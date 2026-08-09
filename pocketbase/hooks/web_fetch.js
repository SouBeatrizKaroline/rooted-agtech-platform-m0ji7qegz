routerAdd(
  'POST',
  '/backend/v1/web/fetch',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Authentication required')

    const body = e.requestInfo().body || {}
    const url = (body.url || '').trim()

    if (!url) return e.badRequestError('URL is required')

    const urlPattern = /^https?:\/\/[^\s<>"'\\)]+/i
    if (!urlPattern.test(url)) {
      return e.json(200, {
        success: false,
        error: 'invalid_url',
        message:
          "That doesn't look like a valid web URL. Please provide a link starting with http:// or https://.",
      })
    }

    var domainMatch = url.match(/^https?:\/\/([^\/?#]+)/i)
    var domain = domainMatch ? domainMatch[1] : ''

    var apiKey = $secrets.get('BRIGHTDATA_API_KEY')
    if (!apiKey) {
      return e.json(200, {
        success: false,
        error: 'not_configured',
        message:
          "Web access isn't configured right now, but you can paste the content here and I'll help you.",
      })
    }

    var res
    try {
      res = $http.send({
        url: 'https://api.brightdata.com/webunlocker/request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
        },
        body: JSON.stringify({ url: url, format: 'raw' }),
        timeout: 30,
      })
    } catch (err) {
      return e.json(200, {
        success: false,
        error: 'fetch_error',
        message:
          "I couldn't access that webpage right now. You can try again or paste the content here.",
      })
    }

    if (res.statusCode !== 200) {
      var errMsg =
        "I couldn't access that webpage right now. You can try again or paste the content here."
      if (res.statusCode === 429) {
        errMsg =
          "I'm getting too many requests right now. Please try again in a moment, or paste the content here."
      }
      return e.json(200, { success: false, error: 'fetch_failed', message: errMsg })
    }

    var html = ''
    try {
      if (
        res.json &&
        res.json.solution &&
        res.json.solution.response &&
        res.json.solution.response.body
      ) {
        html = res.json.solution.response.body
      } else if (res.json && res.json.body) {
        html = res.json.body
      } else if (res.json && typeof res.json === 'string') {
        html = res.json
      }
    } catch (_) {}

    if (!html && res.body && res.body.length) {
      var chars = []
      for (var bi = 0; bi < res.body.length; bi++) {
        chars.push(String.fromCharCode(res.body[bi]))
      }
      html = chars.join('')
    }

    if (!html || html.length < 10) {
      return e.json(200, {
        success: false,
        error: 'empty_content',
        message:
          'The webpage returned no readable content. You can try another URL or paste the content here.',
      })
    }

    html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
    html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '')
    html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '')
    html = html.replace(/<header[\s\S]*?<\/header>/gi, '')
    html = html.replace(/<aside[\s\S]*?<\/aside>/gi, '')
    html = html.replace(/<!--[\s\S]*?-->/g, '')

    var titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    var pageTitle = titleMatch ? titleMatch[1].trim() : ''

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

    var MAX_CONTENT = 12000
    if (cleaned.length > MAX_CONTENT) {
      cleaned = cleaned.substring(0, MAX_CONTENT) + '\n\n[Content truncated for length]'
    }

    return e.json(200, {
      success: true,
      url: url,
      domain: domain,
      content: cleaned,
      content_length: cleaned.length,
    })
  },
  $apis.requireAuth(),
)
