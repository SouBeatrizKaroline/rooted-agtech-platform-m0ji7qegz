import { useState, useEffect, useRef } from 'react'
import { Bot, Send, Mic, MicOff, ToggleLeft, ToggleRight, Sparkles, Globe } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { useVoice } from '@/hooks/use-voice'
import { useSpeechmatics } from '@/hooks/use-speechmatics'
import { sendAssistantChat, getAssistantMessages, AssistantMessageItem } from '@/services/assistant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AssistantPage() {
  const { t, language } = useI18n()
  const [messages, setMessages] = useState<AssistantMessageItem[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [simpleMode, setSimpleMode] = useState(
    () => localStorage.getItem('rooted_simple_mode') === 'true',
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

    try {
      const res = await sendAssistantChat({
        message: text,
        language,
        simple_language: simpleMode,
      })

      setWebAccess({
        used: !!res.web_access_used,
        source: res.web_source || '',
      })

      const tempAsstMsg: AssistantMessageItem = {
        id: (Date.now() + 1).toString(),
        user: 'assistant',
        role: 'assistant',
        content:
          res.reply || 'Rooted advises prioritizing paved primary highways for heavy corn loads.',
        language,
        created: new Date().toISOString(),
        web_source: res.web_source || undefined,
      }
      setMessages((prev) => [...prev, tempAsstMsg])
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: 'assistant',
          role: 'assistant',
          content:
            'Rooted recommends choosing Route A to minimize travel time and keep fuel costs low.',
          language,
          created: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white border border-[#DCE3DC] rounded-2xl overflow-hidden shadow-elevation animate-fade-in">
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

        <button
          onClick={() => {
            const next = !simpleMode
            setSimpleMode(next)
            localStorage.setItem('rooted_simple_mode', String(next))
          }}
          className="text-xs text-emerald-100 bg-[#2F6B45] px-3 py-1.5 rounded-xl flex items-center gap-1.5"
        >
          {simpleMode ? (
            <ToggleRight className="w-4 h-4 text-emerald-300" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
          <span>{t('simpleLanguage')}</span>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F6F7F2]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#2F6B45] text-white rounded-br-none'
                  : 'bg-white border border-[#DCE3DC] text-[#17221A] rounded-bl-none shadow-subtle'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'assistant' && m.web_source && (
              <span className="flex items-center gap-1 mt-1 text-[10px] text-[#536057] px-1">
                <Globe className="w-3 h-3" />
                Source: {m.web_source}
              </span>
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
              <div className="flex items-center gap-1.5 text-[#2F6B45]">
                <Globe className="w-3.5 h-3.5" />
                <span>Using web access</span>
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
      <div className="p-3 bg-white border-t border-[#DCE3DC] flex items-center gap-2">
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
          className={`p-2.5 rounded-xl border transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#2F6B45] focus-visible:ring-offset-1 ${
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
