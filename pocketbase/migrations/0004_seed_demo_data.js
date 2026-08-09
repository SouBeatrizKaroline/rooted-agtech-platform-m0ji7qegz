migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let demoUser
    try {
      demoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'demo@rooted.agtech')
    } catch (_) {
      const rec = new Record(users)
      rec.setEmail('demo@rooted.agtech')
      rec.setPassword('DemoRooted2024')
      rec.setVerified(true)
      rec.set('name', 'Demo Explorer')
      app.save(rec)
      demoUser = rec
    }

    const shipmentsCol = app.findCollectionByNameOrId('shipments')
    const routesCol = app.findCollectionByNameOrId('routes')
    const alertsCol = app.findCollectionByNameOrId('alerts')

    try {
      app.findFirstRecordByData('shipments', 'origin_name', 'Sunrise Valley Farm')
      return
    } catch (_) {}

    var s1 = new Record(shipmentsCol)
    s1.set('user', demoUser.id)
    s1.set('cargo_type', 'corn')
    s1.set('cargo_detail', 'Premium Yellow Corn')
    s1.set('origin_name', 'Sunrise Valley Farm')
    s1.set('origin_lat', -15.78)
    s1.set('origin_lng', -47.92)
    s1.set('destination_name', 'Port of Santos Terminal')
    s1.set('destination_lat', -15.9)
    s1.set('destination_lng', -47.75)
    s1.set('destination_type', 'port')
    s1.set('vehicle_type', 'large_truck')
    s1.set('cargo_weight_t', 32)
    s1.set('status', 'analyzed')
    app.save(s1)

    var r1a = new Record(routesCol)
    r1a.set('shipment', s1.id)
    r1a.set('name', 'Route A - BR-060 Direct')
    r1a.set('is_recommended', true)
    r1a.set('distance_km', 64)
    r1a.set('travel_time_min', 75)
    r1a.set('estimated_cost', 420)
    r1a.set('risk_level', 'low')
    r1a.set('restrictions', 'Weight check at Km 22 (compliant)')
    r1a.set('considerations', 'Shortest path, paved highway, minimal toll')
    r1a.set('confidence_level', 'high')
    r1a.set(
      'summary_text',
      'Recommended for fuel efficiency and road compliance. Direct paved highway suitable for 32-ton loads.',
    )
    app.save(r1a)

    var r1b = new Record(routesCol)
    r1b.set('shipment', s1.id)
    r1b.set('name', 'Route B - Southern Bypass')
    r1b.set('is_recommended', false)
    r1b.set('distance_km', 78)
    r1b.set('travel_time_min', 92)
    r1b.set('estimated_cost', 510)
    r1b.set('risk_level', 'medium')
    r1b.set('restrictions', 'Narrow bridge at Km 45')
    r1b.set('considerations', 'Alternative if main highway is congested')
    r1b.set('confidence_level', 'medium')
    r1b.set('summary_text', 'Longer detour, use only if BR-060 is blocked. Higher fuel cost.')
    app.save(r1b)

    var a1 = new Record(alertsCol)
    a1.set('user', demoUser.id)
    a1.set('shipment', s1.id)
    a1.set('route', r1a.id)
    a1.set('category', 'road_restriction')
    a1.set('severity', 'attention')
    a1.set('label', 'Bridge inspection on BR-060')
    a1.set(
      'explanation',
      'Scheduled inspection at Km 22 between 10:00-12:00. Single lane traffic expected.',
    )
    a1.set('recommended_action', 'Depart before 08:30 to avoid delays.')
    app.save(a1)

    var s2 = new Record(shipmentsCol)
    s2.set('user', demoUser.id)
    s2.set('cargo_type', 'soybeans')
    s2.set('cargo_detail', 'Non-GMO Soybeans')
    s2.set('origin_name', 'Cerrado Plains Farm')
    s2.set('origin_lat', -15.82)
    s2.set('origin_lng', -47.88)
    s2.set('destination_name', 'Cerrado Processing Facility')
    s2.set('destination_lat', -15.88)
    s2.set('destination_lng', -48.02)
    s2.set('destination_type', 'processing_facility')
    s2.set('vehicle_type', 'medium_truck')
    s2.set('cargo_weight_t', 18)
    s2.set('status', 'in_transit')
    app.save(s2)

    var r2 = new Record(routesCol)
    r2.set('shipment', s2.id)
    r2.set('name', 'Route A - Industrial Park Access')
    r2.set('is_recommended', true)
    r2.set('distance_km', 28)
    r2.set('travel_time_min', 35)
    r2.set('estimated_cost', 195)
    r2.set('risk_level', 'low')
    r2.set('restrictions', 'None')
    r2.set('considerations', 'Direct access road, light traffic')
    r2.set('confidence_level', 'high')
    r2.set(
      'summary_text',
      'Short, efficient route with no restrictions. Ideal for time-sensitive soybean delivery.',
    )
    app.save(r2)

    var a2 = new Record(alertsCol)
    a2.set('user', demoUser.id)
    a2.set('shipment', s2.id)
    a2.set('category', 'normal')
    a2.set('severity', 'normal')
    a2.set('label', 'Shipment on schedule')
    a2.set('explanation', 'All checkpoints passed. Estimated arrival on time.')
    a2.set('recommended_action', 'No action needed.')
    app.save(a2)
  },
  (app) => {
    try {
      var demoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'demo@rooted.agtech')
      app.delete(demoUser)
    } catch (_) {}
  },
)
