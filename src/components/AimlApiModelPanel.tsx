import { useState, useEffect, useCallback } from 'react'
import { Cpu, RefreshCw, Loader2, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { listAimlApiModels, type AimlApiModel } from '@/services/aimlApi'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface AimlApiModelPanelProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  selectedModel: string
  onSelectModel: (model: string) => void
}

const CAP_LABELS: Record<string, string> = {
  chat: 'Chat',
  streaming: 'Streaming',
  vision: 'Vision',
  tools: 'Tools',
  structured_output: 'Structured Output',
  reasoning: 'Reasoning',
  coding: 'Coding',
  audio: 'Audio (STT)',
  tts: 'Text-to-Speech',
  image_generation: 'Image Generation',
}

export function AimlApiModelPanel({
  enabled,
  onToggle,
  selectedModel,
  onSelectModel,
}: AimlApiModelPanelProps) {
  const { t } = useI18n()
  const [models, setModels] = useState<AimlApiModel[]>([])
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState('')

  const loadModels = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listAimlApiModels(true)
      setConfigured(res.configured)
      setModels(res.models)
      if (!res.configured) {
        setError(t('aimlapiNotConfigured'))
      }
    } catch {
      setError('Failed to load models.')
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (enabled) loadModels()
  }, [enabled, loadModels])

  const selectedModelData = models.find((m) => m.id === selectedModel)

  return (
    <div className="p-5 bg-white border border-[#DCE3DC] rounded-2xl space-y-4 shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F6F7F2] flex items-center justify-center">
            <Cpu className="w-4 h-4 text-[#2F6B45]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#214D34]">{t('aimlapiTitle')}</h3>
            <p className="text-xs text-[#536057]">{t('aimlapiDesc')}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>

      {enabled && (
        <>
          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
              {error}
            </div>
          )}

          {configured && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#536057]">
                  {t('aimlapiModel')} ({models.length} {t('aimlapiAvailable')})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadModels}
                  disabled={loading}
                  className="h-7 text-xs"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </Button>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#DCE3DC] hover:bg-[#F6F7F2] transition-colors"
                >
                  <span className="text-xs font-medium text-[#17221A] truncate">
                    {selectedModel || t('aimlapiAutoSelect')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 text-[#536057] transition-transform',
                      expanded && 'rotate-180',
                    )}
                  />
                </button>

                {expanded && (
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[#DCE3DC] divide-y divide-[#DCE3DC]">
                    <button
                      onClick={() => {
                        onSelectModel('')
                        setExpanded(false)
                      }}
                      className={cn(
                        'w-full text-left p-2.5 hover:bg-[#F6F7F2] transition-colors text-xs',
                        !selectedModel && 'bg-[#DDEBDD]',
                      )}
                    >
                      {t('aimlapiAutoSelect')}
                    </button>
                    {models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectModel(m.id)
                          setExpanded(false)
                        }}
                        className={cn(
                          'w-full text-left p-2.5 hover:bg-[#F6F7F2] transition-colors text-xs',
                          selectedModel === m.id && 'bg-[#DDEBDD]',
                        )}
                      >
                        <div className="font-medium text-[#17221A]">{m.name}</div>
                        <div className="text-[10px] text-[#536057] truncate">{m.id}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedModelData && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[#536057]">
                    {t('aimlapiCapabilities')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selectedModelData.capabilities).map(([key, value]) =>
                      value ? (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="text-[10px] bg-[#DDEBDD] text-[#214D34]"
                        >
                          <Check className="w-2.5 h-2.5 mr-1" />
                          {CAP_LABELS[key] || key}
                        </Badge>
                      ) : null,
                    )}
                  </div>
                  {selectedModelData.context_window > 0 && (
                    <p className="text-[10px] text-[#536057]">
                      Context: {(selectedModelData.context_window / 1000).toFixed(0)}K tokens
                    </p>
                  )}
                  {selectedModelData.modality && selectedModelData.modality !== 'text' && (
                    <p className="text-[10px] text-[#536057]">
                      Modality: {selectedModelData.modality}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
