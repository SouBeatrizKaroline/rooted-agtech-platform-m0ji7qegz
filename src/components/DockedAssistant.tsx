import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  CornerDownLeft,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/hooks/use-i18n'
import { useVoice } from '@/hooks/use-voice'
import { useSpeechmatics } from '@/hooks/use-speechmatics'
import { sendAssistantChat } from '@/services/assistant'
import { sendChat, shouldUseStreaming } from '@/lib/assistant-chat'
import { LanguageModeSelector, type LanguageMode } from '@/components/LanguageModeSelector'
import { WebSourceBadge } from '@/components/WebSourceBadge'

interface DockedAssistantProps {
  open: boolean
  onClose: () => void
  contextText?: string
}

export function DockedAssistant({ open, onClose, contextText }: DockedAssistantProps) {
  const { t, language } = useI18n()
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; web_source?: string; web_sources?: string[] }>
  >([
    {
      role: 'assistant',
      text: 'Hello! I am Rooted. How can I help with your agricultural shipment today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [webAccess, setWebAccess] = useState<{ used: boolean; source: string } | null>(null)
  const [languageMode, setLanguageMode] = useState<LanguageMode>(
    () => (localStorage.getItem('rooted_language_mode') as LanguageMode) || 'standard',
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    isSpeaking,
    speak,
    stopSpeaking,
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  if (!open) return null

  const handleSend = async (userQuery?: string) => {
    const query = userQuery || input.trim()
    if (!query || loading) return

    const hasUrl = /https?:\/\/[^\s<>"'\\)]+/i.test(query)
    setWebAccess(hasUrl ? { used: true, source: '' } : null)

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: query }])
    setLoading(true)

    const streaming = shouldUseStreaming(query)

    if (streaming) {
      setMessages((prev) => [...prev, { role: 'assistant', text: '' }])
    }

    try {
      const result = await sendChat({
        message: query,
        context: contextText,
        language,
        language_mode: languageMode,
        onProgress: streaming
          ? (text) =>
              setMessages((prev) => {
                const updated = [...prev]
                if (updated[updated.length - 1]?.role === 'assistant') {
                  updated[updated.length - 1] = { role: 'assistant', text }
                }
                return updated
              })
          : undefined,
      })

      const reply = result.reply || 'Rooted recommends using Route A for compliant transport.'

      if (streaming) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[updated.length - 1]?.role === 'assistant') {
            updated[updated.length - 1] = { role: 'assistant', text: reply }
          }
          return updated
        })
      } else {
        setWebAccess({
          used: !!result.web_sources?.length,
          source: result.web_sources?.[0] || '',
        })
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: reply,
            web_sources: result.web_sources,
          },
        ])
      }

      if (isSpeaking) speak(reply)
    } catch (_) {
      const fallbackText = streaming
        ? "I couldn't process that request right now. Please try again."
        : 'Rooted advises choosing the primary highway route to minimize delays and costs.'

      if (streaming) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[updated.length - 1]?.role === 'assistant') {
            updated[updated.length - 1] = { role: 'assistant', text: fallbackText }
          }
          return updated
        })
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: fallbackText }])
      }
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    'Why this route?',
    'What could delay this shipment?',
    'How do I reduce cost?',
    'Explain this simply',
  ]

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 lg:bottom-6 w-auto sm:w-[380px] max-w-[380px] h-[min(520px,calc(100dvh-7rem))] bg-white border border-[#DCE3DC] rounded-2xl shadow-elevation z-50 flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-3.5 bg-[#214D34] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#2F6B45] flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">Rooted Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            {contextText && (
              <span className="text-[10px] text-emerald-200 block truncate max-w-[180px]">
                About: {contextText}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <LanguageModeSelector
            mode={languageMode}
            onChange={(m) => {
              setLanguageMode(m)
              localStorage.setItem('rooted_language_mode', m)
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-emerald-100 hover:bg-[#2F6B45] hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#F6F7F2]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed break-words ${
                m.role === 'user'
                  ? 'bg-[#2F6B45] text-white rounded-br-none'
                  : 'bg-white border border-[#DCE3DC] text-[#17221A] rounded-bl-none shadow-subtle'
              }`}
            >
              {m.text}
            </div>
            {m.role === 'assistant' && (m.web_sources?.length || m.web_source) && (
              <WebSourceBadge sources={m.web_sources || (m.web_source ? [m.web_source] : [])} />
            )}
          </div>
        ))}
        {loading && (
          <div className="flex flex-col gap-1.5 p-3 bg-white border border-[#DCE3DC] rounded-2xl text-xs text-[#536057] w-max">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2F6B45] animate-spin" />
              <span>Rooted is formulating advice…</span>
            </div>
            {webAccess?.used && (
              <div
                className="flex items-center gap-1.5 text-[#2F6B45]"
                role="status"
                aria-live="polite"
              >
                <Globe className="w-3 h-3 animate-pulse" aria-hidden="true" />
                <span>{t('webAccessing')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice status */}
      {(isListening || isProcessing || voiceError || partialText) && (
        <div className="px-3 py-1.5 bg-white border-t border-[#DCE3DC]">
          {isListening && (
            <p className="text-[11px] text-[#536057] flex items-center gap-1.5" aria-live="polite">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="truncate">{partialText || 'Listening…'}</span>
            </p>
          )}
          {isProcessing && !isListening && (
            <p className="text-[11px] text-[#536057] flex items-center gap-1.5" aria-live="polite">
              <Sparkles className="w-3 h-3 text-[#2F6B45] animate-spin shrink-0" />
              Processing…
            </p>
          )}
          {voiceError && !isListening && !isProcessing && (
            <p className="text-[11px] text-amber-700" role="alert">
              {voiceError}
            </p>
          )}
        </div>
      )}

      {/* Suggested chips */}
      <div className="p-2 bg-white border-t border-[#DCE3DC] flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1.5 rounded-full bg-[#F6F7F2] hover:bg-[#DDEBDD] border border-[#DCE3DC] text-[#536057] hover:text-[#214D34] transition-colors flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-2.5 bg-white border-t border-[#DCE3DC] flex items-center gap-2">
        <button
          onClick={() => {
            if (useSm) {
              if (sm.state === 'listening') sm.stopListening()
              else if (sm.state === 'error') sm.reset()
              else if (sm.state === 'idle') sm.startListening((t) => handleSend(t))
            } else {
              if (webListening) webStop()
              else webStart((t) => handleSend(t))
            }
          }}
          disabled={isProcessing}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          className={`p-2 rounded-xl border transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#2F6B45] focus-visible:ring-offset-1 ${
            isListening
              ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
              : isProcessing
                ? 'bg-[#DDEBDD] text-[#214D34] border-[#DCE3DC]'
                : voiceError
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-[#F6F7F2] text-[#536057] border-[#DCE3DC] hover:text-[#214D34]'
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
          placeholder="Ask Rooted a question…"
          className="flex-1 h-9 text-xs border-[#DCE3DC] focus-visible:ring-[#2F6B45]"
        />

        <Button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          size="icon"
          className="h-9 w-9 bg-[#2F6B45] hover:bg-[#214D34] text-white rounded-xl"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
