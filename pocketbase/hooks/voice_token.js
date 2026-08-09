routerAdd(
  'POST',
  '/backend/v1/voice/token',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Authentication required')

    const body = e.requestInfo().body || {}
    const language = body.language || 'en'

    const apiKey = $secrets.get('SPEECHMATICS_API_KEY')
    if (!apiKey) {
      return e.json(200, {
        available: false,
        message:
          "Voice input isn't configured right now, but you can type your message and I'll help you.",
      })
    }

    var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    function b64url(bytes) {
      var r = ''
      for (var i = 0; i < bytes.length; i += 3) {
        var a = bytes[i],
          b = i + 1 < bytes.length ? bytes[i + 1] : 0,
          c = i + 2 < bytes.length ? bytes[i + 2] : 0
        r += B64[(a >> 2) & 63] + B64[((a & 3) << 4) | ((b >> 4) & 15)]
        if (i + 1 < bytes.length) r += B64[((b & 15) << 2) | ((c >> 6) & 3)]
        if (i + 2 < bytes.length) r += B64[c & 63]
      }
      return r
    }
    function strBytes(s) {
      var b = []
      for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i)
        if (c < 128) b.push(c)
        else if (c < 2048) b.push(192 | (c >> 6), 128 | (c & 63))
        else b.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63))
      }
      return b
    }
    function hexBytes(h) {
      var b = []
      for (var i = 0; i < h.length; i += 2) b.push(parseInt(h.substr(i, 2), 16))
      return b
    }

    var now = Math.floor(Date.now() / 1000)
    var header = b64url(strBytes(JSON.stringify({ typ: 'JWT', alg: 'HS256' })))
    var payload = b64url(
      strBytes(
        JSON.stringify({
          iss: apiKey,
          aud: 'api',
          type: 'rt',
          exp: now + 300,
          iat: now,
          sub: userId,
        }),
      ),
    )
    var signingInput = header + '.' + payload
    var sig = b64url(hexBytes($security.hs256(signingInput, apiKey)))
    var jwt = signingInput + '.' + sig

    return e.json(200, {
      available: true,
      token: jwt,
      url: 'wss://eu2.rt.speechmatics.com/v2',
      language: language,
    })
  },
  $apis.requireAuth(),
)
