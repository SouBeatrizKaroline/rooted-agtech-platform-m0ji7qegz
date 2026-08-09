import { sendAssistantChat } from '@/services/assistant'
import { featherlessChatStream } from '@/services/featherless'
import { aimlApiChatStream } from '@/services/aimlApi'

const ROOTED_SYSTEM_PROMPT =
  'You are Rooted, a calm, knowledgeable, practical, supportive, and concise agricultural logistics companion. Priority in answers: clarity -> context -> recommendation -> action. Explain risks and routes in simple plain language. Label estimates clearly. Respond in the language requested by the user. When web content is provided, analyze it and clearly distinguish web-sourced information from your own knowledge. Never claim web-retrieved information was known beforehand. Never submit forms or perform actions on external websites.'

export interface SendChatOptions {
  message: string
  context?: string
  language: string
  language_mode: string
  onProgress?: (text: string) => void
}

export interface SendChatResult {
  reply: string
  web_sources?: string[]
  provider?: string
  streamed: boolean
}

export function getAIProvider(): 'rooted' | 'featherless' | 'aimlapi' {
  return (
    (localStorage.getItem('rooted_ai_provider') as 'rooted' | 'featherless' | 'aimlapi') || 'rooted'
  )
}

export function getAIModel(): string {
  const provider = getAIProvider()
  if (provider === 'aimlapi') {
    return localStorage.getItem('rooted_aimlapi_model') || ''
  }
  return localStorage.getItem('rooted_ai_model') || ''
}

export function shouldUseStreaming(message: string): boolean {
  const provider = getAIProvider()
  const hasUrl = /https?:\/\/[^\s<>"'\\)]+/i.test(message)
  return (provider === 'featherless' || provider === 'aimlapi') && !hasUrl
}

export async function sendChat(options: SendChatOptions): Promise<SendChatResult> {
  const provider = getAIProvider()
  const model = getAIModel()
  const hasUrl = /https?:\/\/[^\s<>"'\\)]+/i.test(options.message)

  if (provider === 'featherless' && !hasUrl && options.onProgress) {
    try {
      let accumulated = ''
      const userContent = options.context
        ? `[Context: ${options.context}]\n\n${options.message}`
        : options.message

      for await (const chunk of featherlessChatStream({
        model: model || undefined,
        messages: [
          { role: 'system', content: ROOTED_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      })) {
        const delta = chunk.choices[0]?.delta?.content || ''
        if (delta) {
          accumulated += delta
          options.onProgress(accumulated)
        }
      }

      if (!accumulated) {
        throw new Error('Empty response')
      }

      return { reply: accumulated, provider: 'featherless', streamed: true }
    } catch {
      // Fallback to non-streaming below
    }
  }

  if (provider === 'aimlapi' && !hasUrl && options.onProgress) {
    try {
      let accumulated = ''
      const userContent = options.context
        ? `[Context: ${options.context}]\n\n${options.message}`
        : options.message

      for await (const chunk of aimlApiChatStream({
        model: model || undefined,
        messages: [
          { role: 'system', content: ROOTED_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      })) {
        const delta = chunk.choices[0]?.delta?.content || ''
        if (delta) {
          accumulated += delta
          options.onProgress(accumulated)
        }
      }

      if (!accumulated) {
        throw new Error('Empty response')
      }

      return { reply: accumulated, provider: 'aimlapi', streamed: true }
    } catch {
      // Fallback to non-streaming below
    }
  }

  const res = await sendAssistantChat({
    message: options.message,
    context: options.context,
    language: options.language,
    language_mode: options.language_mode,
    provider,
    model,
  })

  return {
    reply: res.reply,
    web_sources: res.web_sources || (res.web_source ? [res.web_source] : []),
    provider: res.provider || provider,
    streamed: false,
  }
}
