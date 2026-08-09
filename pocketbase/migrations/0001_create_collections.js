migrate(
  (app) => {
    const locations = new Collection({
      name: 'locations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: [
            'farm',
            'warehouse',
            'distribution_center',
            'processing_facility',
            'port',
            'buyer',
            'custom',
          ],
          maxSelect: 1,
        },
        { name: 'address', type: 'text' },
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_locations_type ON locations (type)'],
    })
    app.save(locations)

    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    const shipments = new Collection({
      name: 'shipments',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'cargo_type',
          type: 'select',
          required: true,
          values: ['corn', 'soybeans', 'wheat', 'fruits', 'vegetables', 'other'],
          maxSelect: 1,
        },
        { name: 'cargo_detail', type: 'text' },
        { name: 'origin_name', type: 'text', required: true },
        { name: 'origin_lat', type: 'number' },
        { name: 'origin_lng', type: 'number' },
        { name: 'destination_name', type: 'text', required: true },
        { name: 'destination_lat', type: 'number' },
        { name: 'destination_lng', type: 'number' },
        {
          name: 'destination_type',
          type: 'select',
          required: true,
          values: [
            'warehouse',
            'distribution_center',
            'processing_facility',
            'port',
            'buyer',
            'custom',
          ],
          maxSelect: 1,
        },
        {
          name: 'vehicle_type',
          type: 'select',
          required: true,
          values: ['small_truck', 'medium_truck', 'large_truck', 'other'],
          maxSelect: 1,
        },
        { name: 'cargo_weight_t', type: 'number' },
        { name: 'dimensions', type: 'text' },
        { name: 'preferred_departure', type: 'date' },
        { name: 'constraints', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['planned', 'analyzed', 'in_transit', 'delayed', 'delivered'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_shipments_user ON shipments (user)',
        'CREATE INDEX idx_shipments_status ON shipments (status)',
      ],
    })
    app.save(shipments)

    const routes = new Collection({
      name: 'routes',
      type: 'base',
      listRule: "@request.auth.id != '' && shipment.user = @request.auth.id",
      viewRule: "@request.auth.id != '' && shipment.user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'shipment',
          type: 'relation',
          required: true,
          collectionId: shipments.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'is_recommended', type: 'bool' },
        { name: 'distance_km', type: 'number', required: true },
        { name: 'travel_time_min', type: 'number', required: true },
        { name: 'estimated_cost', type: 'number' },
        {
          name: 'risk_level',
          type: 'select',
          required: true,
          values: ['low', 'medium', 'high'],
          maxSelect: 1,
        },
        { name: 'restrictions', type: 'text' },
        { name: 'risk_areas', type: 'text' },
        { name: 'considerations', type: 'text' },
        { name: 'confidence_level', type: 'text' },
        { name: 'summary_text', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_routes_shipment ON routes (shipment)'],
    })
    app.save(routes)

    const alerts = new Collection({
      name: 'alerts',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'shipment',
          type: 'relation',
          collectionId: shipments.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'route',
          type: 'relation',
          collectionId: routes.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'road_restriction',
            'route_disruption',
            'capacity_issue',
            'potential_delay',
            'high_risk_route',
            'normal',
          ],
          maxSelect: 1,
        },
        {
          name: 'severity',
          type: 'select',
          required: true,
          values: ['normal', 'attention', 'critical'],
          maxSelect: 1,
        },
        { name: 'label', type: 'text', required: true },
        { name: 'explanation', type: 'text', required: true },
        { name: 'recommended_action', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_alerts_user ON alerts (user)'],
    })
    app.save(alerts)

    const storageOptions = new Collection({
      name: 'storage_options',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['warehouse', 'silo', 'cold_storage', 'distribution_center'],
          maxSelect: 1,
        },
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
        { name: 'address', type: 'text' },
        { name: 'capacity_t', type: 'number' },
        { name: 'available_t', type: 'number' },
        { name: 'distance_km', type: 'number' },
        {
          name: 'suitability',
          type: 'select',
          required: true,
          values: ['low', 'medium', 'high'],
          maxSelect: 1,
        },
        { name: 'consideration', type: 'text' },
        {
          name: 'cargo_types',
          type: 'select',
          values: ['corn', 'soybeans', 'wheat', 'fruits', 'vegetables', 'other'],
          maxSelect: 6,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_storage_type ON storage_options (type)'],
    })
    app.save(storageOptions)

    const assistantMessages = new Collection({
      name: 'assistant_messages',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          values: ['user', 'assistant'],
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'context', type: 'text' },
        { name: 'language', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_asst_msg_user ON assistant_messages (user)'],
    })
    app.save(assistantMessages)
  },
  (app) => {
    ;[
      'assistant_messages',
      'storage_options',
      'alerts',
      'routes',
      'shipments',
      'locations',
    ].forEach((name) => {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    })
  },
)
