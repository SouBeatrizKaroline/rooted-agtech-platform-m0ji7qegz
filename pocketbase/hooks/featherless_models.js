routerAdd(
  'GET',
  '/backend/v1/featherless/models',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Authentication required')

    var apiKey = $secrets.get('FEATHERLESS_API_KEY')
    if (!apiKey) {
      return e.json(200, { configured: false, models: [] })
    }

    var res
    try {
      res = $http.send({
        url: 'https://api.featherless.ai/v1/models',
        method: 'GET',
        headers: { Authorization: 'Bearer ' + apiKey },
        timeout: 15,
      })
    } catch (err) {
      return e.json(200, { configured: true, models: [], error: 'fetch_error' })
    }

    if (res.statusCode !== 200) {
      return e.json(200, { configured: true, models: [], error: 'api_error' })
    }

    var data
    try {
      data = res.json
    } catch (_) {
      return e.json(200, { configured: true, models: [], error: 'parse_error' })
    }

    var rawModels = (data && data.data) || []
    var models = []

    for (var i = 0; i < rawModels.length && i < 100; i++) {
      var m = rawModels[i]
      var id = m.id || ''
      var nameLower = id.toLowerCase()

      var caps = {
        chat: true,
        streaming: true,
        tool_use: /tool|function|qwen2\.5|llama-3\.1/i.test(nameLower),
        multilingual: /70b|72b|104b|llama-3|qwen2\.5/i.test(nameLower),
        coding: /code|coder|programming/i.test(nameLower),
        reasoning: /reason|r1|thinking|deepseek/i.test(nameLower),
        long_context: /llama-3\.1|qwen2\.5|128k|32k/i.test(nameLower),
      }

      var ctxWindow = 8192
      if (/llama-3\.1/i.test(nameLower)) ctxWindow = 131072
      else if (/qwen2\.5/i.test(nameLower)) ctxWindow = 32768
      else if (/deepseek/i.test(nameLower)) ctxWindow = 65536
      else if (/70b|72b/i.test(nameLower)) ctxWindow = 32768

      var displayName = id.split('/').pop() || id
      displayName = displayName.replace(/[-_]/g, ' ')
      displayName = displayName.replace(/\b\w/g, function (c) {
        return c.toUpperCase()
      })

      models.push({
        id: id,
        name: displayName,
        provider: 'featherless',
        capabilities: caps,
        context_window: ctxWindow,
        description: m.owned_by ? 'By ' + m.owned_by : '',
      })
    }

    return e.json(200, { configured: true, models: models })
  },
  $apis.requireAuth(),
)
