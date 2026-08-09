routerAdd(
  'POST',
  '/backend/v1/routes/analyze',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Authentication required')

    const body = e.requestInfo().body || {}
    const {
      cargo_type,
      cargo_detail,
      origin_name,
      origin_lat,
      origin_lng,
      destination_name,
      destination_lat,
      destination_lng,
      destination_type,
      vehicle_type,
      cargo_weight_t,
      dimensions,
      preferred_departure,
      constraints,
      simple_language,
    } = body

    if (!cargo_type || !origin_name || !destination_name) {
      return e.badRequestError('Missing required shipment fields')
    }

    const shipmentsCol = $app.findCollectionByNameOrId('shipments')
    const shipment = new Record(shipmentsCol)
    shipment.set('user', userId)
    shipment.set('cargo_type', cargo_type)
    shipment.set('cargo_detail', cargo_detail || '')
    shipment.set('origin_name', origin_name)
    shipment.set('origin_lat', Number(origin_lat) || -15.78)
    shipment.set('origin_lng', Number(origin_lng) || -47.92)
    shipment.set('destination_name', destination_name)
    shipment.set('destination_lat', Number(destination_lat) || -15.9)
    shipment.set('destination_lng', Number(destination_lng) || -47.75)
    shipment.set('destination_type', destination_type || 'warehouse')
    shipment.set('vehicle_type', vehicle_type || 'medium_truck')
    shipment.set('cargo_weight_t', Number(cargo_weight_t) || 20)
    shipment.set('dimensions', dimensions || '')
    if (preferred_departure) shipment.set('preferred_departure', preferred_departure)
    shipment.set('constraints', constraints || '')
    shipment.set('status', 'analyzed')
    $app.save(shipment)

    // Compute estimated distances & times
    const lat1 = Number(origin_lat) || -15.78
    const lng1 = Number(origin_lng) || -47.92
    const lat2 = Number(destination_lat) || -15.9
    const lng2 = Number(destination_lng) || -47.75

    const dx = (lat2 - lat1) * 111
    const dy = (lng2 - lng1) * 111 * Math.cos((lat1 * Math.PI) / 180)
    const baseDist = Math.round(Math.sqrt(dx * dx + dy * dy) * 1.3) || 45

    const distA = Math.round(baseDist * 1.1)
    const timeA = Math.round(distA * 1.15)
    const costA = Math.round(distA * 5.5 + 80)

    const distB = Math.round(baseDist * 1.35)
    const timeB = Math.round(distB * 1.25)
    const costB = Math.round(distB * 6.2 + 90)

    let summaryA = `Rooted recommends Route A for carrying ${cargo_type} from ${origin_name} to ${destination_name}. It offers a direct paved route with lower fuel consumption and compliant weight clearances.`
    let summaryB = `Route B provides an alternative secondary corridor. It is longer with slightly higher fuel costs, but avoids potential weigh-station queues during peak hours.`

    try {
      const aiPrompt = simple_language
        ? `Explain in 2 simple sentences why Route A (${distA}km, ${timeA}min) is recommended for transporting ${cargo_type} by ${vehicle_type} from ${origin_name} to ${destination_name}.`
        : `Provide a concise 2-sentence logistics summary comparing Route A (${distA}km, ${timeA}min, ~${costA}) vs Route B (${distB}km) for transporting ${cargo_type} to ${destination_name}.`
      const aiRes = $ai.chat({
        model: 'fast',
        messages: [{ role: 'user', content: aiPrompt }],
      })
      if (aiRes?.choices?.[0]?.message?.content) {
        summaryA = aiRes.choices[0].message.content.trim()
      }
    } catch (err) {
      console.log('AI route summary generation fallback:', err.message)
    }

    const routesCol = $app.findCollectionByNameOrId('routes')

    const routeA = new Record(routesCol)
    routeA.set('shipment', shipment.id)
    routeA.set('name', 'Route A - Primary Arterial Highway')
    routeA.set('is_recommended', true)
    routeA.set('distance_km', distA)
    routeA.set('travel_time_min', timeA)
    routeA.set('estimated_cost', costA)
    routeA.set('risk_level', 'low')
    routeA.set('restrictions', 'Standard weigh station at Km 15 (compliant)')
    routeA.set(
      'considerations',
      `${Math.round(((distB - distA) / distB) * 100)}% shorter · lower estimated fuel burn · reliable road surface`,
    )
    routeA.set('confidence_level', 'high')
    routeA.set('summary_text', summaryA)
    $app.save(routeA)

    const routeB = new Record(routesCol)
    routeB.set('shipment', shipment.id)
    routeB.set('name', 'Route B - Secondary Regional Bypass')
    routeB.set('is_recommended', false)
    routeB.set('distance_km', distB)
    routeB.set('travel_time_min', timeB)
    routeB.set('estimated_cost', costB)
    routeB.set('risk_level', 'medium')
    routeB.set('restrictions', 'Single-lane rural bridges')
    routeB.set(
      'considerations',
      'Alternative route if main highway experiences unexpected congestion.',
    )
    routeB.set('confidence_level', 'medium')
    routeB.set('summary_text', summaryB)
    $app.save(routeB)

    // Generate an alert if heavy vehicle or special cargo
    if (vehicle_type === 'large_truck' || cargo_type === 'fruits' || cargo_type === 'vegetables') {
      const alertsCol = $app.findCollectionByNameOrId('alerts')
      const alert = new Record(alertsCol)
      alert.set('user', userId)
      alert.set('shipment', shipment.id)
      alert.set('route', routeA.id)
      alert.set(
        'category',
        cargo_type === 'fruits' || cargo_type === 'vegetables'
          ? 'potential_delay'
          : 'road_restriction',
      )
      alert.set('severity', 'attention')
      alert.set(
        'label',
        cargo_type === 'fruits' || cargo_type === 'vegetables'
          ? 'Temperature sensitive cargo schedule'
          : 'Vehicle axle weight check',
      )
      alert.set(
        'explanation',
        `Cargo (${cargo_type}) requires optimized transit time to prevent quality degradation.`,
      )
      alert.set(
        'recommended_action',
        'Maintain departure schedule on Route A for optimal transit window.',
      )
      $app.save(alert)
    }

    return e.json(200, {
      shipment_id: shipment.id,
      recommended_route_id: routeA.id,
    })
  },
  $apis.requireAuth(),
)
