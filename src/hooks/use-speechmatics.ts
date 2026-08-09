import { useState, useRef, useCallback, useEffect } from 'react'
import { getVoiceToken } from '@/services/voice'
import { downsampleBuffer, float32ToInt16 } from '@/lib/audio-utils'

export type VoiceState = 'idle' | 'requesting' | 'listening' | 'processing' | 'error'

const LANG_MAP: Record<string, string> = { en: 'en', pt: 'pt', es: 'es', fr: 'fr' }

export function useSpeechmatics(language: string = 'en') {
  const [state, setState] = useState<VoiceState>('idle')
  const [partialTranscript, setPartialTranscript] = useState('')
  const [error, setError] = useState('')
  const [available, setAvailable] = useState(true)

  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const procRef = useRef<ScriptProcessorNode | null>(null)
  const finalRef = useRef('')
  const stateRef = useRef(state)
  stateRef.current = state

  const cleanup = useCallback(() => {
    if (procRef.current) {
      procRef.current.disconnect()
      procRef.current = null
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) wsRef.current.close()
      } catch {
        /* intentionally ignored */
      }
      wsRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setError('')
    setPartialTranscript('')
    finalRef.current = ''
  }, [])

  useEffect(() => {
    getVoiceToken(LANG_MAP[language] || 'en')
      .then((res) => setAvailable(res.available))
      .catch(() => setAvailable(false))
  }, [language])

  const startListening = useCallback(
    async (onFinal: (text: string) => void) => {
      setState('requesting')
      setError('')
      setPartialTranscript('')
      finalRef.current = ''
      const lang = LANG_MAP[language] || 'en'

      try {
        const res = await getVoiceToken(lang)
        if (!res.available) {
          setAvailable(false)
          setState('error')
          setError(res.message || 'Voice input is not configured. Please type your message.')
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        })
        streamRef.current = stream

        const ws = new WebSocket(`${res.url}?jwt=${res.token}`)
        ws.binaryType = 'arraybuffer'
        wsRef.current = ws

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              message: 'StartRecognition',
              transcription_config: {
                language: lang,
                operating_point: 'enhanced',
                enable_partials: true,
                max_delay: 2,
              },
              audio_format: { type: 'raw', encoding: 'pcm_s16le', sample_rate: 16000 },
            }),
          )

          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          ctxRef.current = ctx
          const source = ctx.createMediaStreamSource(stream)
          const proc = ctx.createScriptProcessor(4096, 1, 1)
          procRef.current = proc
          const sr = ctx.sampleRate

          proc.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return
            const input = e.inputBuffer.getChannelData(0)
            const ds = downsampleBuffer(input, sr, 16000)
            ws.send(float32ToInt16(ds).buffer)
          }
          source.connect(proc)
          proc.connect(ctx.destination)
          setState('listening')
        }

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            if (msg.message === 'AddPartialTranscript') {
              const t = msg.metadata?.transcript || ''
              if (t) setPartialTranscript(finalRef.current ? finalRef.current + ' ' + t : t)
            } else if (msg.message === 'AddTranscript') {
              const t = msg.metadata?.transcript || ''
              if (t) {
                finalRef.current += (finalRef.current ? ' ' : '') + t
                setPartialTranscript(finalRef.current)
              }
            } else if (msg.message === 'EndOfTranscript') {
              const ft = finalRef.current.trim()
              cleanup()
              if (ft) {
                setState('idle')
                onFinal(ft)
              } else {
                setState('error')
                setError(
                  "I couldn't process your voice input. You can try again or type your message instead.",
                )
              }
            } else if (msg.message === 'Error') {
              setState('error')
              setError(
                'Voice transcription failed. You can try again or type your message instead.',
              )
              cleanup()
            }
          } catch {
            /* intentionally ignored */
          }
        }

        ws.onerror = () => {
          if (stateRef.current !== 'processing' && stateRef.current !== 'idle') {
            setState('error')
            setError('Voice connection failed. You can try again or type your message instead.')
            cleanup()
          }
        }

        ws.onclose = () => {
          if (stateRef.current === 'listening' || stateRef.current === 'requesting') {
            if (finalRef.current.trim()) {
              setState('idle')
              onFinal(finalRef.current.trim())
            } else setState('idle')
          }
        }
      } catch (err: any) {
        if (err?.name === 'NotAllowedError') {
          setState('error')
          setError(
            'Microphone access is required for voice input. You can allow microphone access in your browser settings or continue using text.',
          )
        } else if (err?.name === 'NotFoundError') {
          setState('error')
          setError('No microphone found. You can continue using text input.')
        } else {
          setState('error')
          setError(
            "I couldn't process your voice input. You can try again or type your message instead.",
          )
        }
        cleanup()
      }
    },
    [language, cleanup],
  )

  const stopListening = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: 'EndOfStream' }))
    }
    setState('processing')
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  return { state, partialTranscript, error, available, startListening, stopListening, reset }
}
