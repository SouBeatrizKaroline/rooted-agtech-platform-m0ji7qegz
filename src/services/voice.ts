import pb from '@/lib/pocketbase/client'

export interface VoiceTokenResponse {
  available: boolean
  token?: string
  url?: string
  language?: string
  message?: string
}

export const getVoiceToken = (language: string) =>
  pb.send<VoiceTokenResponse>('/backend/v1/voice/token', {
    method: 'POST',
    body: JSON.stringify({ language }),
    headers: { 'Content-Type': 'application/json' },
  })
