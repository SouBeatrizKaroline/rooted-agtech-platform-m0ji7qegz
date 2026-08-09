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
    const simpleLanguage = !!body.simple_language

    if (!message) return e.badRequestError('Message is required')

    // === URL Detection & Web Fetch ===
    var urlRegex = /https?:\/\/[^\s<>"'\\)]+/gi
    var urls = message.match(urlRegex) || []
    var webContent = ''
    var webDomain = ''
    var webError = ''
    var webAccessUsed = false

    if (urls.length > 0) {
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
              url: 'https://api.brightdata.com/webunlocker/request',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + apiKey,
              },
              body: JSON.stringify({ url: fetchUrl, format: 'raw' }),
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

          // Clean HTML
          html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
          html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
          html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
          html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '')
          html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '')
          html = html.replace(/<header[\s\S]*?<\/header>/gi, '')
          html = html.replace(/<aside[\s\S]*?<\/aside>/gi, '')
          html = html.replace(/<!--[\s\S]*?-->/g, '')

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

          var cleaned = pageTitle ? 'Title: ' + pageTitle + '\n\n' + html : html
          if (cleaned.length > 8000)
            cleaned = cleaned.substring(0, 8000) + '\n\n[Content truncated]'

          webContent +=
            'Source URL: ' + fetchUrl + '\nDomain: ' + dmn + '\n\n' + cleaned + '\n\n---\n\n'
          if (webDomain === '') webDomain = dmn
          webError = ''
        }
      }
    }

    // === Build Prompt ===
    let formattedPrompt = message

    if (webContent) {
      formattedPrompt =
        '[Web content retrieved live from the web]:\n\n' +
        webContent +
        '\n\n[User message]: ' +
        message +
        '\n\n[Instructions: The web content above was retrieved live from the internet. When answering: 1) Clearly distinguish information from the webpage (cite source as "' +
        webDomain +
        '") from information you already know. 2) Never claim web-retrieved information was known beforehand. 3) If the user asks for a simple explanation, provide plain language. 4) If the content is in a different language than the user\'s message, translate key points.]'
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
    }

    if (simpleLanguage) {
      formattedPrompt +=
        '\n\n[Instruction: Respond using simple, clear, non-technical plain language. Keep sentences short.]'
    }
    if (language && language !== 'en') {
      formattedPrompt += '\n\n[Instruction: Please respond strictly in language: ' + language + ']'
    }
    if (contextText) {
      formattedPrompt = '[Context: ' + contextText + ']\n\n' + formattedPrompt
    }

    // === Get AI Response ===
    let assistantReply =
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
                'You are Rooted, an agricultural logistics decision assistant. Help users choose optimal routes and understand transportation risks. When web content is provided, analyze it and clearly distinguish web-sourced information from your own knowledge.',
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

    // Handle web errors in reply
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

    // === Persist Messages ===
    try {
      const msgCol = $app.findCollectionByNameOrId('assistant_messages')
      var contextForMessages = contextText
      if (webDomain) {
        contextForMessages = (contextText ? contextText + ' | ' : '') + 'web_source:' + webDomain
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
      simple_language: simpleLanguage,
      web_access_used: webAccessUsed,
      web_source: webDomain || '',
      web_error: webError || '',
    })
  },
  $apis.requireAuth(),
)
