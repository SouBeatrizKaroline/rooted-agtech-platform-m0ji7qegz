routerAdd(
  'POST',
  '/backend/v1/assistant/chat',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Authentication required')

    const body = e.requestInfo().body || {}
    const message = (body.message || '').trim()
    const contextText = body.context || ''
    const language = body.language || 'en'

    var languageMode = body.language_mode || ''
    if (!languageMode) {
      languageMode = body.simple_language ? 'simple' : 'standard'
    }

    if (!message) return e.badRequestError('Message is required')

    var urlRegex = /https?:\/\/[^\s<>"'\\)]+/gi
    var urls = message.match(urlRegex) || []

    var webIntentPatterns = [
      /leia\s+(esse|esta|aquele|aquela)\s+(site|p[áa]gina|link)/i,
      /pesquis[ae]\s+(sobre|isso|esse|esta|aquele|aquela)/i,
      /veja\s+(essa|este|aquele|aquela)\s+(p[áa]gina|site|link)/i,
      /confira\s+(esse|este|esse|esta)/i,
      /compare\s+(essas|estes|aqueles)\s+(p[áa]ginas|sites|links)/i,
      /quais\s+s[ãa]o\s+(os\s+)?requisitos\s+atuais/i,
      /veja\s+(as\s+)?informa[çc][õo]es/i,
      /encontre\s+(os\s+)?requisitos/i,
      /procure\s+informa[çc][õo]es/i,
      /veja\s+se\s+(esse|este)\s+produto/i,
      /n[ãa]o\s+consigo\s+entender\s+(esse|este)\s+site/i,
      /n[ãa]o\s+entendi\s+(esse|este|a\s+essa)/i,
      /leia\s+(esse|este)\s+site/i,
      /read\s+(this|that)\s+(site|page|link)/i,
      /search\s+for/i,
      /look\s+up/i,
      /check\s+(this|that)\s+(page|site|link)/i,
      /compare\s+(these|those)\s+(pages|sites|links)/i,
      /what\s+are\s+(the\s+)?current\s+requirements/i,
      /see\s+(the\s+)?latest\s+information/i,
      /find\s+(the\s+)?requirements/i,
      /look\s+for\s+information\s+about/i,
      /see\s+if\s+(this|that)\s+product/i,
      /i\s+can'?t\s+understand\s+(this|that)\s+site/i,
      /i\s+didn'?t\s+understand/i,
    ]

    var actionIntentPatterns = [
      /o\s+que\s+(eu\s+)?preciso\s+fazer/i,
      /what\s+do\s+i\s+need\s+to\s+do/i,
      /o\s+que\s+(eu\s+)?devo\s+fazer/i,
      /what\s+should\s+i\s+do/i,
      /quais\s+(s[ãa]o\s+os\s+)?passos/i,
      /what\s+(are\s+the\s+)?steps/i,
      /quais\s+documentos/i,
      /what\s+documents/i,
      /como\s+(eu\s+)?(fa[çc]o|preencho|preencher|solicito)/i,
      /how\s+do\s+i\s+(fill|complete|apply)/i,
    ]

    var webIntentDetected = false
    for (var pi = 0; pi < webIntentPatterns.length; pi++) {
      if (webIntentPatterns[pi].test(message)) {
        webIntentDetected = true
        break
      }
    }

    var actionIntentDetected = false
    for (var ai = 0; ai < actionIntentPatterns.length; ai++) {
      if (actionIntentPatterns[ai].test(message)) {
        actionIntentDetected = true
        break
      }
    }

    var shouldFetchWeb = urls.length > 0 && webIntentDetected
    if (urls.length > 0) shouldFetchWeb = true
    if (!urls.length && !webIntentDetected) shouldFetchWeb = false

    var webContent = ''
    var webDomains = []
    var webError = ''
    var webAccessUsed = false

    if (shouldFetchWeb && urls.length > 0) {
      webAccessUsed = true
      var apiKey = $secrets.get('BRIGHTDATA_API_KEY')

      if (!apiKey) {
        webError = 'not_configured'
      } else {
        var maxUrls = Math.min(urls.length, 2)
        for (var ui = 0; ui < maxUrls; ui++) {
          var fetchUrl = urls[ui]
          if (!/^https?:\/\/[^\s<>"'\\)]+/i.test(fetchUrl)) continue

          var dm = fetchUrl.match(/^https?:\/\/([^\/?#]+)/i)
          var dmn = dm ? dm[1] : ''

          var bdRes
          try {
            bdRes = $http.send({
              url: 'https://api.brightdata.com/request',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + apiKey,
              },
              body: JSON.stringify({ zone: 'rooted', url: fetchUrl, format: 'raw' }),
              timeout: 30,
            })
          } catch (err) {
            webError = 'fetch_error'
            continue
          }

          if (bdRes.statusCode !== 200) {
            if (bdRes.statusCode === 429) webError = 'rate_limited'
            else if (bdRes.statusCode === 401 || bdRes.statusCode === 403) webError = 'auth_error'
            else webError = 'fetch_failed'
            continue
          }

          var html = ''
          try {
            if (
              bdRes.json &&
              bdRes.json.solution &&
              bdRes.json.solution.response &&
              bdRes.json.solution.response.body
            ) {
              html = bdRes.json.solution.response.body
            } else if (bdRes.json && bdRes.json.body) {
              html = bdRes.json.body
            } else if (bdRes.json && typeof bdRes.json === 'string') {
              html = bdRes.json
            }
          } catch (_) {}

          if (!html && bdRes.body && bdRes.body.length) {
            var chars = []
            for (var bi = 0; bi < bdRes.body.length; bi++) {
              chars.push(String.fromCharCode(bdRes.body[bi]))
            }
            html = chars.join('')
          }

          if (!html || html.length < 10) {
            webError = 'empty_content'
            continue
          }

          html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
          html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
          html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
          html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '')
          html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '')
          html = html.replace(/<header[\s\S]*?<\/header>/gi, '')
          html = html.replace(/<aside[\s\S]*?<\/aside>/gi, '')
          html = html.replace(/<!--[\s\S]*?-->/g, '')
          html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')

          var metaDescM = html.match(
            /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
          )
          var metaDesc = metaDescM ? metaDescM[1].trim() : ''

          var titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
          var pageTitle = titleM ? titleM[1].trim() : ''

          html = html.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
          html = html.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
          html = html.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
          html = html.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
          html = html.replace(/<h[56][^>]*>([\s\S]*?)<\/h[56]>/gi, '\n##### $1\n')
          html = html.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
          html = html.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '$2 [$1]')
          html = html.replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, '$1 | ')
          html = html.replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, '$1 | ')
          html = html.replace(/<\/tr>/gi, '\n')
          html = html.replace(/<p[^>]*>/gi, '\n')
          html = html.replace(/<\/p>/gi, '\n')
          html = html.replace(/<br\s*\/?>/gi, '\n')
          html = html.replace(/<div[^>]*>/gi, '\n')
          html = html.replace(/<[^>]+>/g, '')

          html = html
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&eacute;/g, 'é')
            .replace(/&aacute;/g, 'á')
            .replace(/&iacute;/g, 'í')
            .replace(/&oacute;/g, 'ó')
            .replace(/&uacute;/g, 'ú')
            .replace(/&ntilde;/g, 'ñ')
            .replace(/&ccedil;/g, 'ç')
            .replace(/&atilde;/g, 'ã')
            .replace(/&otilde;/g, 'õ')

          html = html
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/^\s+|\s+$/g, '')

          var cleaned = ''
          if (pageTitle) cleaned += 'Title: ' + pageTitle + '\n'
          if (metaDesc) cleaned += 'Description: ' + metaDesc + '\n'
          cleaned += '\n' + html

          if (cleaned.length > 8000)
            cleaned = cleaned.substring(0, 8000) + '\n\n[Content truncated]'

          webContent +=
            'Source URL: ' + fetchUrl + '\nDomain: ' + dmn + '\n\n' + cleaned + '\n\n---\n\n'
          webDomains.push(dmn)
          webError = ''
        }
      }
    }

    var modeInstructions = {
      simple:
        '\n\n[Instruction: Respond using simple, clear, non-technical plain language. Keep sentences short. Use everyday words. Avoid jargon.]',
      standard: '',
      detailed:
        '\n\n[Instruction: Provide a detailed, thorough explanation with context and background information. Include relevant details.]',
      technical:
        '\n\n[Instruction: Use precise technical terminology and industry-standard language. Include specifications and technical details.]',
      step_by_step:
        '\n\n[Instruction: Present the response as numbered steps, one action per step. Include any important deadlines or requirements. Make each step actionable.]',
    }

    var formattedPrompt = message

    if (webContent) {
      var sourceList = webDomains.join(', ')
      formattedPrompt =
        '[Web content retrieved live from the web]:\n\n' +
        webContent +
        '\n\n[User message]: ' +
        message +
        '\n\n[Instructions: The web content above was retrieved live from the internet using Bright Data Web Unlocker. When answering: 1) Clearly distinguish information from the webpage (cite source as "' +
        sourceList +
        '") from information you already know. 2) Never claim web-retrieved information was known beforehand. 3) If the user asks for a simple explanation, provide plain language. 4) If the content is in a different language than the user\'s message, translate key points. 5) Never submit forms or perform actions on external websites. 6) If the page contains instructions, forms, or application steps, explain what documents or information are needed and the steps to complete the process.]'

      if (actionIntentDetected) {
        formattedPrompt +=
          '\n\n[Instruction: The user is asking what they need to do. Analyze the webpage content and return a guided, actionable answer with numbered steps. Identify any important deadlines, requirements, prerequisites, or documents needed. Do not dump raw webpage content — synthesize and guide the user through the process.]'
      }
    } else if (webError === 'not_configured') {
      formattedPrompt =
        message +
        "\n\n[System note: The user may be asking about a webpage/URL. Web access is not configured. Inform the user that web access isn't available right now but they can paste the content directly.]"
    } else if (webError) {
      formattedPrompt =
        message +
        '\n\n[System note: An attempt to fetch a webpage failed (' +
        webError +
        "). Inform the user that the webpage couldn't be accessed and suggest pasting the content.]"
    } else if (webIntentDetected && !urls.length) {
      formattedPrompt +=
        '\n\n[System note: The user seems to want web access but did not provide a URL. Ask them to provide a specific URL (starting with http:// or https://) so you can read the page for them.]'
    }

    var modeKey = languageMode || 'standard'
    if (modeInstructions[modeKey]) {
      formattedPrompt += modeInstructions[modeKey]
    }

    if (language && language !== 'en') {
      formattedPrompt += '\n\n[Instruction: Please respond strictly in language: ' + language + ']'
    }
    if (contextText) {
      formattedPrompt = '[Context: ' + contextText + ']\n\n' + formattedPrompt
    }

    var assistantReply =
      'Rooted recommends choosing Route A to minimize travel time and keep fuel costs low.'

    try {
      const result = $ai.agent('rooted-assistant').chat({
        user_id: userId,
        conversation_id: body.conversation_id || null,
        message: formattedPrompt,
      })
      if (result && result.content) {
        assistantReply = result.content
      }
    } catch (err) {
      try {
        const chatRes = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'You are Rooted, an agricultural logistics decision assistant. Help users choose optimal routes and understand transportation risks. When web content is provided, analyze it and clearly distinguish web-sourced information from your own knowledge. Never claim web-retrieved information was known beforehand. Never submit forms or perform actions on external websites.',
            },
            { role: 'user', content: formattedPrompt },
          ],
        })
        if (chatRes?.choices?.[0]?.message?.content) {
          assistantReply = chatRes.choices[0].message.content
        }
      } catch (e2) {
        console.log('Assistant chat fallback notice:', e2.message)
      }
    }

    if (webError === 'not_configured' && urls.length > 0) {
      if (
        assistantReply.indexOf('web access') === -1 &&
        assistantReply.indexOf('paste the content') === -1
      ) {
        var ncMsg =
          language === 'pt'
            ? 'O acesso à web não está configurado no momento, mas você pode colar o conteúdo aqui e eu vou te ajudar.'
            : language === 'es'
              ? 'El acceso web no está configurado en este momento, pero puedes pegar el contenido aquí y te ayudaré.'
              : "Web access isn't configured right now, but you can paste the content here and I'll help you."
        assistantReply = ncMsg + '\n\n' + assistantReply
      }
    } else if (webError && webError !== 'not_configured' && urls.length > 0) {
      if (
        assistantReply.indexOf("couldn't access") === -1 &&
        assistantReply.indexOf('paste the content') === -1
      ) {
        var failMsg =
          language === 'pt'
            ? 'Não consegui acessar essa página agora. Você pode tentar novamente ou colar o conteúdo aqui.'
            : language === 'es'
              ? 'No pude acceder a esa página ahora. Puedes intentarlo de nuevo o pegar el contenido aquí.'
              : "I couldn't access that webpage right now. You can try again or paste the content here."
        assistantReply = failMsg + '\n\n' + assistantReply
      }
    }

    try {
      const msgCol = $app.findCollectionByNameOrId('assistant_messages')
      var contextForMessages = contextText
      if (webDomains.length > 0) {
        contextForMessages =
          (contextText ? contextText + ' | ' : '') + 'web_source:' + webDomains.join(',')
      }

      const uMsg = new Record(msgCol)
      uMsg.set('user', userId)
      uMsg.set('role', 'user')
      uMsg.set('content', message)
      uMsg.set('context', contextForMessages)
      uMsg.set('language', language)
      $app.save(uMsg)

      const aMsg = new Record(msgCol)
      aMsg.set('user', userId)
      aMsg.set('role', 'assistant')
      aMsg.set('content', assistantReply)
      aMsg.set('context', contextForMessages)
      aMsg.set('language', language)
      $app.save(aMsg)
    } catch (err) {
      console.log('Message save notice:', err.message)
    }

    return e.json(200, {
      reply: assistantReply,
      language,
      language_mode: languageMode,
      simple_language: languageMode === 'simple',
      web_access_used: webAccessUsed,
      web_source: webDomains[0] || '',
      web_sources: webDomains,
      web_error: webError || '',
    })
  },
  $apis.requireAuth(),
)
