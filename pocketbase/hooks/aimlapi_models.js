routerAdd(
  'GET',
  '/backend/v1/aimlapi/models',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Authentication required')

    var apiKey = $secrets.get('AIMLAPI_KEY')
    if (!apiKey) {
      return e.json(200, { configured: false, models: [] })
    }

    var res
    try {
      res = $http.send({
        url: 'https://api.aimlapi.com/v1/models',
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

    for (var i = 0; i < rawModels.length && i < 150; i++) {
      var m = rawModels[i]
      var id = m.id || ''

      var modality = ''
      if (m.architecture && m.architecture.modality) {
        modality = String(m.architecture.modality).toLowerCase()
      }

      var contextWindow = m.context_length || m.max_context || 0

      var hasVision = modality.indexOf('image->text') !== -1 || modality.indexOf('vision') !== -1
      var hasImageGen =
        modality.indexOf('text->image') !== -1 || modality.indexOf('image->image') !== -1
      var hasSTT = modality.indexOf('audio->text') !== -1 || modality.indexOf('speech') !== -1
      var hasTTS = modality.indexOf('text->audio') !== -1 || modality.indexOf('tts') !== -1
      var hasAudio = hasSTT || hasTTS

      var isTextModel =
        modality.indexOf('text->text') !== -1 ||
        modality === '' ||
        modality.indexOf('image->text') !== -1

      var lowerId = id.toLowerCase()
      var hasTools =
        /gpt-4o|gpt-4-turbo|gpt-3\.5-turbo|claude-3|gemini-1\.5|gemini-2|grok|mistral-large|qwen2|llama-3\.1|command-r/i.test(
          lowerId,
        )
      var hasReasoning = /o1|o3|deepseek-r1|reasoning|think/i.test(lowerId)
      var hasCoding = /code|coder|starcoder|deepseek-coder|qwen.*coder/i.test(lowerId)
      var hasStreaming = isTextModel && !hasImageGen && !hasTTS
      var hasStructuredOutput = hasTools

      var modalityType = 'text'
      if (hasImageGen) modalityType = 'image_generation'
      else if (hasTTS) modalityType = 'tts'
      else if (hasSTT) modalityType = 'stt'
      else if (hasVision) modalityType = 'multimodal'

      var pricing = null
      if (m.pricing) {
        pricing = {
          prompt: m.pricing.prompt || '',
          completion: m.pricing.completion || '',
        }
      }

      var displayName = id.split('/').pop() || id
      displayName = displayName.replace(/[-_]/g, ' ')
      displayName = displayName.replace(/\b\w/g, function (c) {
        return c.toUpperCase()
      })

      models.push({
        id: id,
        name: displayName,
        provider: 'aimlapi',
        modality: modalityType,
        context_window: contextWindow || 0,
        capabilities: {
          chat: isTextModel || hasVision,
          streaming: hasStreaming,
          vision: hasVision,
          tools: hasTools,
          structured_output: hasStructuredOutput,
          reasoning: hasReasoning,
          coding: hasCoding,
          audio: hasSTT,
          tts: hasTTS,
          image_generation: hasImageGen,
        },
        pricing: pricing,
        description: m.owned_by ? 'By ' + m.owned_by : '',
      })
    }

    models.sort(function (a, b) {
      if (a.capabilities.chat !== b.capabilities.chat) {
        return a.capabilities.chat ? -1 : 1
      }
      return (b.context_window || 0) - (a.context_window || 0)
    })

    return e.json(200, { configured: true, models: models })
  },
  $apis.requireAuth(),
)
