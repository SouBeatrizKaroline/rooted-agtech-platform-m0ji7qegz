migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', '1aspiraqualquer@gmail.com')
    } catch (_) {
      const rec = new Record(users)
      rec.setEmail('1aspiraqualquer@gmail.com')
      rec.setPassword('Skip@Pass')
      rec.setVerified(true)
      rec.set('name', 'Agricultural Logistics Manager')
      app.save(rec)
      adminUser = rec
    }

    // Seed initial shipment & routes for default user
    const shipmentsCol = app.findCollectionByNameOrId('shipments')
    const routesCol = app.findCollectionByNameOrId('routes')
    const alertsCol = app.findCollectionByNameOrId('alerts')

    let sampleShipment
    try {
      sampleShipment = app.findFirstRecordByData('shipments', 'origin_name', 'Green Valley Farm')
    } catch (_) {
      const s = new Record(shipmentsCol)
      s.set('user', adminUser.id)
      s.set('cargo_type', 'corn')
      s.set('cargo_detail', 'Non-GMO Feed Corn')
      s.set('origin_name', 'Green Valley Farm')
      s.set('origin_lat', -15.78)
      s.set('origin_lng', -47.92)
      s.set('destination_name', 'Riverside Grain Terminal')
      s.set('destination_lat', -15.9)
      s.set('destination_lng', -47.75)
      s.set('destination_type', 'port')
      s.set('vehicle_type', 'large_truck')
      s.set('cargo_weight_t', 32)
      s.set('dimensions', 'Standard Triple Axle')
      s.set('status', 'analyzed')
      app.save(s)
      sampleShipment = s

      // Recommended Route
      const r1 = new Record(routesCol)
      r1.set('shipment', sampleShipment.id)
      r1.set('name', 'Route A - Highway BR-060 Bypass')
      r1.set('is_recommended', true)
      r1.set('distance_km', 64)
      r1.set('travel_time_min', 75)
      r1.set('estimated_cost', 420)
      r1.set('risk_level', 'low')
      r1.set('restrictions', 'Weight limit check at Km 22 (compliant)')
      r1.set('risk_areas', 'Minor roadwork near river bridge')
      r1.set('considerations', '12% shorter than south loop · minimal toll fees')
      r1.set('confidence_level', 'high')
      r1.set(
        'summary_text',
        'Rooted recommends Route A because it avoids heavy urban traffic around the ring road, reduces fuel burn by ~8%, and stays on primary paved corridors suitable for a 32-ton truck.',
      )
      app.save(r1)

      // Alternative Route
      const r2 = new Record(routesCol)
      r2.set('shipment', sampleShipment.id)
      r2.set('name', 'Route B - Southern Secondary Corridor')
      r2.set('is_recommended', false)
      r2.set('distance_km', 78)
      r2.set('travel_time_min', 92)
      r2.set('estimated_cost', 510)
      r2.set('risk_level', 'medium')
      r2.set('restrictions', 'Narrow bridge clearance at Km 45')
      r2.set('risk_areas', 'Unpaved 4km section near reservoir')
      r2.set('considerations', 'Longer detour, recommended only if main highway is congested.')
      r2.set('confidence_level', 'medium')
      r2.set(
        'summary_text',
        'Route B is an alternative bypass. It is longer and incurs additional fuel cost, but can be used as a secondary option if BR-060 undergoes sudden closures.',
      )
      app.save(r2)

      // Sample Alert
      const a1 = new Record(alertsCol)
      a1.set('user', adminUser.id)
      a1.set('shipment', sampleShipment.id)
      a1.set('route', r1.id)
      a1.set('category', 'road_restriction')
      a1.set('severity', 'attention')
      a1.set('label', 'Road restriction check on BR-060')
      a1.set(
        'explanation',
        'Scheduled bridge inspection at Km 22 between 10:00 and 12:00. Single lane alternating traffic expected.',
      )
      a1.set(
        'recommended_action',
        'Depart before 08:30 or take Route A with expected +10 min delay.',
      )
      app.save(a1)
    }

    // Define Rooted Assistant Agent
    try {
      $ai.agents.define(app, {
        slug: 'rooted-assistant',
        name: 'Rooted Assistant',
        description: 'Agricultural logistics and decision support assistant.',
        systemPrompt:
          'You are Rooted, a calm, knowledgeable, practical, supportive, and concise agricultural logistics companion. Priority in answers: clarity -> context -> recommendation -> action. Explain risks and routes in simple plain language. Label estimates clearly. Respond in the language requested by the user.',
        tier: 'fast',
        tools: [
          { collection: 'shipments', perms: { read: true, list: true } },
          { collection: 'routes', perms: { read: true, list: true } },
          { collection: 'alerts', perms: { read: true, list: true } },
          { collection: 'storage_options', perms: { read: true, list: true } },
        ],
        memory: [
          {
            type: 'faq',
            payload: {
              qa: [
                {
                  question: 'How does Rooted choose the recommended route?',
                  answer:
                    'Rooted evaluates distance, road suitability, vehicle weight limits, active road restrictions, estimated fuel cost, and storage availability to select the safest and most efficient path.',
                },
                {
                  question: 'What does a road restriction alert mean?',
                  answer:
                    'A road restriction indicates weight limits, height clearances, toll requirements, roadwork, or seasonal bans that could impact your specific vehicle type.',
                },
              ],
            },
          },
          {
            type: 'text',
            payload: {
              text: 'Rooted recommendations prioritize safety, lower operational cost, and compliance with heavy vehicle restrictions.',
            },
          },
        ],
      })
    } catch (err) {
      console.log('Agent define notice:', err.message)
    }
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'rooted-assistant')
    } catch (_) {}
  },
)
