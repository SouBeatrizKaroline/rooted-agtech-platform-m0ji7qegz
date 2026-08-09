import { useState, useEffect, useRef } from 'react'
import { Bot, Send, Mic, MicOff, Sparkles, Globe } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { useVoice } from '@/hooks/use-voice'
import { useSpeechmatics } from '@/hooks/use-speechmatics'
import { sendAssistantChat, getAssistantMessages, AssistantMessageItem } from '@/services/assistant'
import { sendChat, shouldUseStreaming } from '@/lib/assistant-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LanguageModeSelector, type LanguageMode } from '@/components/LanguageModeSelector'
import { WebSourceBadge } from '@/components/WebSourceBadge'

export default function AssistantPage() {
  const { t, language } = useI18n()
  const [messages, setMessages] = useState<AssistantMessageItem[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [languageMode, setLanguageMode] = useState<LanguageMode>(
    () => (localStorage.getItem('rooted_language_mode') as LanguageMode) || 'standard',
  )
  const [webAccess, setWebAccess] = useState<{ used: boolean; source: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    isListening: webListening,
    startListening: webStart,
    stopListening: webStop,
  } = useVoice(language)
  const sm = useSpeechmatics(language)
  const useSm = sm.available
  const isListening = useSm ? sm.state === 'listening' : webListening
  const isProcessing = useSm ? sm.state === 'processing' || sm.state === 'requesting' : false
  const voiceError = useSm ? sm.error : ''
  const partialText = useSm ? sm.partialTranscript : ''

  useEffect(() => {
    getAssistantMessages()
      .then(setMessages)
      .catch(() => {
        setMessages([
          {
            id: '1',
            user: 'system',
            role: 'assistant',
            content:
              'Hello! I am Rooted, your agricultural logistics assistant. How can I help you choose the best route or storage option today?',
            language: 'en',
            created: new Date().toISOString(),
          },
        ])
      })
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  const handleSend = async (queryText?: string) => {
    const text = queryText || input.trim()
    if (!text || loading) return

    const hasUrl = /https?:\/\/[^\s<>"'\\)]+/i.test(text)
    setWebAccess(hasUrl ? { used: true, source: '' } : null)

    setInput('')
    const tempUserMsg: AssistantMessageItem = {
      id: Date.now().toString(),
      user: 'me',
      role: 'user',
      content: text,
      language,
      created: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempUserMsg])
    setLoading(true)

    const streaming = shouldUseStreaming(text)
    const streamMsgId = (Date.now() + 1).toString()

    if (streaming) {
      setMessages((prev) => [
        ...prev,
        {
          id: streamMsgId,
          user: 'assistant',
          role: 'assistant',
          content: '',
          language,
          created: new Date().toISOString(),
        },
      ])
    }

    try {
      const result = await sendChat({
        message: text,
        language,
        language_mode: languageMode,
        onProgress: streaming
          ? (txt) =>
              setMessages((prev) =>
                prev.map((m) => (m.id === streamMsgId ? { ...m, content: txt } : m)),
              )
          : undefined,
      })

      const reply =
        result.reply || 'Rooted advises prioritizing paved primary highways for heavy corn loads.'

      if (streaming) {
        setMessages((prev) =>
          prev.map((m) => (m.id === streamMsgId ? { ...m, content: reply } : m)),
        )
      } else {
        setWebAccess({
          used: !!result.web_sources?.length,
          source: result.web_sources?.[0] || '',
        })
        const tempAsstMsg: AssistantMessageItem = {
          id: streamMsgId,
          user: 'assistant',
          role: 'assistant',
          content: reply,
          language,
          created: new Date().toISOString(),
          web_sources: result.web_sources,
        }
        setMessages((prev) => [...prev, tempAsstMsg])
      }
    } catch (_) {
      const fallbackContent = streaming
        ? "I couldn't process that request right now. Please try again."
        : 'Rooted recommends choosing Route A to minimize travel time and keep fuel costs low.'

      if (streaming) {
        setMessages((prev) =>
          prev.map((m) => (m.id === streamMsgId ? { ...m, content: fallbackContent } : m)),
        )
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: streamMsgId,
            user: 'assistant',
            role: 'assistant',
            content: fallbackContent,
            language,
            created: new Date().toISOString(),
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100dvh-200px)] min-h-[400px] flex flex-col bg-white border border-[#DCE3DC] rounded-2xl overflow-hidden shadow-elevation animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-[#214D34] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2F6B45] flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base">Rooted Assistant</h1>
            <p className="text-xs text-emerald-200">Voice-capable decision companion</p>
          </div>
        </div>

        <LanguageModeSelector
          mode={languageMode}
          onChange={(m) => {
            setLanguageMode(m)
            localStorage.setItem('rooted_language_mode', m)
          }}
          variant="page"
        />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F6F7F2] min-h-0">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words ${
                m.role === 'user'
                  ? 'bg-[#2F6B45] text-white rounded-br-none'
                  : 'bg-white border border-[#DCE3DC] text-[#17221A] rounded-bl-none shadow-subtle'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'assistant' && (m.web_sources?.length || m.web_source) && (
              <WebSourceBadge
                sources={m.web_sources || (m.web_source ? [m.web_source] : [])}
                iconSize="w-3 h-3"
              />
            )}
          </div>
        ))}
        {loading && (
          <div className="flex flex-col gap-1.5 p-3 bg-white border border-[#DCE3DC] rounded-2xl text-xs text-[#536057] w-max">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2F6B45] animate-spin" />
              <span>Formulating advice…</span>
            </div>
            {webAccess?.used && (
              <div
                className="flex items-center gap-1.5 text-[#2F6B45]"
                role="status"
                aria-live="polite"
              >
                <Globe className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                <span>{t('webAccessing')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice status */}
      {(isListening || isProcessing || voiceError || partialText) && (
        <div className="px-4 py-2 bg-white border-t border-[#DCE3DC]">
          {isListening && (
            <p className="text-xs text-[#536057] flex items-center gap-2" aria-live="polite">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="truncate">{partialText || 'Listening…'}</span>
            </p>
          )}
          {isProcessing && !isListening && (
            <p className="text-xs text-[#536057] flex items-center gap-2" aria-live="polite">
              <Sparkles className="w-3.5 h-3.5 text-[#2F6B45] animate-spin shrink-0" />
              Processing…
            </p>
          )}
          {voiceError && !isListening && !isProcessing && (
            <p className="text-xs text-amber-700" role="alert">
              {voiceError}
            </p>
          )}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-[#DCE3DC] flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => {
            if (useSm) {
              if (sm.state === 'listening') sm.stopListening()
              else if (sm.state === 'error') sm.reset()
              else if (sm.state === 'idle') sm.startListening((txt) => handleSend(txt))
            } else {
              if (webListening) webStop()
              else webStart((txt) => handleSend(txt))
            }
          }}
          disabled={isProcessing}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          className={`p-2.5 rounded-xl border transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#2F6B45] focus-visible:ring-offset-1 ${
            isListening
              ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
              : isProcessing
                ? 'bg-[#DDEBDD] text-[#214D34]'
                : voiceError
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-[#F6F7F2] text-[#536057]'
          }`}
          title={voiceError || 'Voice input'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : isProcessing ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your route, vehicle limits, or grain terminal capacity…"
          className="flex-1 border-[#DCE3DC]"
        />

        <Button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="bg-[#2F6B45] text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
