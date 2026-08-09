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

    let formattedPrompt = message
    if (simpleLanguage) {
      formattedPrompt +=
        '\n\n[Instruction: Respond using simple, clear, non-technical plain language. Keep sentences short.]'
    }
    if (language && language !== 'en') {
      formattedPrompt += `\n\n[Instruction: Please respond strictly in language: ${language}]`
    }
    if (contextText) {
      formattedPrompt = `[Context: ${contextText}]\n\n${formattedPrompt}`
    }

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
                'You are Rooted, an agricultural logistics decision assistant. Help users choose optimal routes and understand transportation risks.',
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

    // Persist message record
    try {
      const msgCol = $app.findCollectionByNameOrId('assistant_messages')
      const uMsg = new Record(msgCol)
      uMsg.set('user', userId)
      uMsg.set('role', 'user')
      uMsg.set('content', message)
      uMsg.set('context', contextText)
      uMsg.set('language', language)
      $app.save(uMsg)

      const aMsg = new Record(msgCol)
      aMsg.set('user', userId)
      aMsg.set('role', 'assistant')
      aMsg.set('content', assistantReply)
      aMsg.set('context', contextText)
      aMsg.set('language', language)
      $app.save(aMsg)
    } catch (err) {
      console.log('Message save notice:', err.message)
    }

    return e.json(200, {
      reply: assistantReply,
      language,
      simple_language: simpleLanguage,
    })
  },
  $apis.requireAuth(),
)
