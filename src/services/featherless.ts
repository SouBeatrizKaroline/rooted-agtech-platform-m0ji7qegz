import pb from '@/lib/pocketbase/client'
import { parseChatStream, type OpenAIChatStreamChunk } from '@/lib/skipAi'

export interface FeatherlessModelCapabilities {
  chat: boolean
  streaming: boolean
  tool_use: boolean
  multilingual: boolean
  coding: boolean
  reasoning: boolean
  long_context: boolean
}

export interface FeatherlessModel {
  id: string
  name: string
  provider: 'featherless'
  capabilities: FeatherlessModelCapabilities
  context_window?: number
  description?: string
}

export interface FeatherlessModelsResponse {
  configured: boolean
  models: FeatherlessModel[]
  error?: string
}

let modelsCache: FeatherlessModelsResponse | null = null
let modelsCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000

export function listFeatherlessModels(forceRefresh = false): Promise<FeatherlessModelsResponse> {
  if (!forceRefresh && modelsCache && Date.now() - modelsCacheTime < CACHE_TTL) {
    return Promise.resolve(modelsCache)
  }
  return pb
    .send<FeatherlessModelsResponse>('/backend/v1/featherless/models', { method: 'GET' })
    .then((res) => {
      modelsCache = res
      modelsCacheTime = Date.now()
      return res
    })
}

export interface FeatherlessChatPayload {
  model?: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  max_tokens?: number
}

export async function* featherlessChatStream(
  payload: FeatherlessChatPayload,
  signal?: AbortSignal,
): AsyncGenerator<OpenAIChatStreamChunk> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/featherless/chat/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
      body: JSON.stringify(payload),
      signal,
    },
  )

  if (!res.ok) {
    let message = `Featherless chat failed: ${res.status}`
    try {
      const body = await res.clone().json()
      if (body?.error) message = body.error
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }

  yield* parseChatStream(res, signal)
}
