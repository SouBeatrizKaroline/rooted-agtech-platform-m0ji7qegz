import pb from '@/lib/pocketbase/client'
import { parseChatStream, type OpenAIChatStreamChunk } from '@/lib/skipAi'

export interface AimlApiModelCapabilities {
  chat: boolean
  streaming: boolean
  vision: boolean
  tools: boolean
  structured_output: boolean
  reasoning: boolean
  coding: boolean
  audio: boolean
  tts: boolean
  image_generation: boolean
}

export interface AimlApiModel {
  id: string
  name: string
  provider: 'aimlapi'
  modality: string
  context_window: number
  capabilities: AimlApiModelCapabilities
  pricing?: { prompt: string; completion: string } | null
  description?: string
}

export interface AimlApiModelsResponse {
  configured: boolean
  models: AimlApiModel[]
  error?: string
}

let modelsCache: AimlApiModelsResponse | null = null
let modelsCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000

export function listAimlApiModels(forceRefresh = false): Promise<AimlApiModelsResponse> {
  if (!forceRefresh && modelsCache && Date.now() - modelsCacheTime < CACHE_TTL) {
    return Promise.resolve(modelsCache)
  }
  return pb
    .send<AimlApiModelsResponse>('/backend/v1/aimlapi/models', { method: 'GET' })
    .then((res) => {
      modelsCache = res
      modelsCacheTime = Date.now()
      return res
    })
}

export interface AimlApiChatPayload {
  model?: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  max_tokens?: number
}

export async function* aimlApiChatStream(
  payload: AimlApiChatPayload,
  signal?: AbortSignal,
): AsyncGenerator<OpenAIChatStreamChunk> {
  const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/aimlapi/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok) {
    let message = `AI/ML API chat failed: ${res.status}`
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
