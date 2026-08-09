routerAdd(
  'POST',
  '/backend/v1/featherless/chat/stream',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Authentication required')

    var apiKey = $secrets.get('FEATHERLESS_API_KEY')
    if (!apiKey) {
      return e.json(503, { error: "Featherless AI isn't configured yet." })
    }

    const body = e.requestInfo().body || {}
    var model = body.model || 'meta-llama/Llama-3.1-8B-Instruct'
    var messages = body.messages || []
    var temperature = body.temperature !== undefined ? body.temperature : 0.7
    var maxTokens = body.max_tokens || 2048

    if (!messages.length) return e.badRequestError('Messages are required')

    var requestHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    }

    var streamBody = JSON.stringify({
      model: model,
      messages: messages,
      stream: true,
      temperature: temperature,
      max_tokens: maxTokens,
    })

    var iter
    try {
      iter = $http.stream({
        url: 'https://api.featherless.ai/v1/chat/completions',
        method: 'POST',
        headers: requestHeaders,
        body: streamBody,
        idleTimeout: 60,
      })
    } catch (err) {
      return e.json(502, { error: "I couldn't process that request right now. Please try again." })
    }

    e.response.header().set('Content-Type', 'text/event-stream')
    e.response.header().set('Cache-Control', 'no-cache')
    $response.stream(e, iter)
  },
  $apis.requireAuth(),
)
