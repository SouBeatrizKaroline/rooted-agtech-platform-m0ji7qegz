migrate(
  (app) => {
    const locationsCol = app.findCollectionByNameOrId('locations')
    const storageCol = app.findCollectionByNameOrId('storage_options')

    const locData = [
      {
        name: 'Green Valley Farm',
        type: 'farm',
        address: 'Highway 101, Km 42',
        lat: -15.78,
        lng: -47.92,
        description: 'Grain production center - Corn & Soybeans',
      },
      {
        name: 'Riverside Grain Terminal',
        type: 'port',
        address: 'Port Zone Gate 3',
        lat: -15.9,
        lng: -47.75,
        description: 'Export hub with bulk loading docks',
      },
      {
        name: 'AgriStorage Central Silo',
        type: 'warehouse',
        address: 'Industrial Park, Rd 4',
        lat: -15.82,
        lng: -47.88,
        description: 'Temperature controlled grain silos',
      },
      {
        name: 'Cerrado Processing Facility',
        type: 'processing_facility',
        address: 'BR-060 Km 18',
        lat: -15.88,
        lng: -48.02,
        description: 'Soybean crush plant & oil extraction',
      },
      {
        name: 'Metro Produce Distribution Center',
        type: 'distribution_center',
        address: 'Ring Road North',
        lat: -15.7,
        lng: -47.85,
        description: 'Fresh produce cold distribution',
      },
    ]

    locData.forEach((item) => {
      try {
        app.findFirstRecordByData('locations', 'name', item.name)
      } catch (_) {
        const rec = new Record(locationsCol)
        rec.set('name', item.name)
        rec.set('type', item.type)
        rec.set('address', item.address)
        rec.set('lat', item.lat)
        rec.set('lng', item.lng)
        rec.set('description', item.description)
        app.save(rec)
      }
    })

    const storageData = [
      {
        name: 'Cerrado Silo Complex #1',
        type: 'silo',
        lat: -15.81,
        lng: -47.86,
        address: 'BR-060 Km 12',
        capacity_t: 15000,
        available_t: 4200,
        distance_km: 18,
        suitability: 'high',
        consideration: 'Near your destination and has immediate capacity for grain today.',
        cargo_types: ['corn', 'soybeans', 'wheat'],
      },
      {
        name: 'North Port Cold Storage',
        type: 'cold_storage',
        lat: -15.89,
        lng: -47.76,
        address: 'Port Logistics Zone',
        capacity_t: 8000,
        available_t: 1200,
        distance_km: 34,
        suitability: 'medium',
        consideration: 'Ideal for fresh produce, high seasonal demand.',
        cargo_types: ['fruits', 'vegetables'],
      },
      {
        name: 'Central Agri Warehouse',
        type: 'warehouse',
        lat: -15.85,
        lng: -47.95,
        address: 'Av. do Agronegócio 500',
        capacity_t: 20000,
        available_t: 8500,
        distance_km: 12,
        suitability: 'high',
        consideration: 'Direct access to arterial highway, low congestion.',
        cargo_types: ['corn', 'soybeans', 'wheat', 'other'],
      },
    ]

    storageData.forEach((item) => {
      try {
        app.findFirstRecordByData('storage_options', 'name', item.name)
      } catch (_) {
        const rec = new Record(storageCol)
        rec.set('name', item.name)
        rec.set('type', item.type)
        rec.set('lat', item.lat)
        rec.set('lng', item.lng)
        rec.set('address', item.address)
        rec.set('capacity_t', item.capacity_t)
        rec.set('available_t', item.available_t)
        rec.set('distance_km', item.distance_km)
        rec.set('suitability', item.suitability)
        rec.set('consideration', item.consideration)
        rec.set('cargo_types', item.cargo_types)
        app.save(rec)
      }
    })
  },
  (app) => {},
)
