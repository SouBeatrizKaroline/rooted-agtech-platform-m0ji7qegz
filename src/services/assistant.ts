import pb from '@/lib/pocketbase/client'

export interface AssistantMessageItem {
  id: string
  user: string
  role: 'user' | 'assistant'
  content: string
  context?: string
  language: string
  created: string
}

export interface AssistantChatPayload {
  message: string
  context?: string
  language?: string
  simple_language?: boolean
}

export const getAssistantMessages = () =>
  pb.collection('assistant_messages').getFullList<AssistantMessageItem>({ sort: 'created' })

export const sendAssistantChat = (payload: AssistantChatPayload) =>
  pb.send<{ reply: string; language: string; simple_language: boolean }>(
    '/backend/v1/assistant/chat',
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    },
  )
