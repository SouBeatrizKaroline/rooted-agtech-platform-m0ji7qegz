import { Sparkles, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

export type LanguageMode = 'simple' | 'standard' | 'detailed' | 'technical' | 'step_by_step'

const MODES: LanguageMode[] = ['simple', 'standard', 'detailed', 'technical', 'step_by_step']

const MODE_KEYS: Record<LanguageMode, string> = {
  simple: 'modeSimple',
  standard: 'modeStandard',
  detailed: 'modeDetailed',
  technical: 'modeTechnical',
  step_by_step: 'modeStepByStep',
}

interface LanguageModeSelectorProps {
  mode: LanguageMode
  onChange: (mode: LanguageMode) => void
  variant?: 'header' | 'page'
}

export function LanguageModeSelector({
  mode,
  onChange,
  variant = 'header',
}: LanguageModeSelectorProps) {
  const { t } = useI18n()

  const triggerClass =
    variant === 'header'
      ? 'text-xs text-emerald-100 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2F6B45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-1 focus-visible:ring-offset-[#214D34]'
      : 'text-xs text-emerald-100 bg-[#2F6B45] px-3 py-1.5 rounded-xl flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-1 focus-visible:ring-offset-[#214D34]'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={triggerClass} aria-label={t('languageMode')} aria-haspopup="menu">
          <Sparkles className={cn('w-4 h-4', mode === 'simple' && 'text-emerald-300')} />
          <span className={cn(variant === 'header' && 'text-[11px] hidden sm:inline')}>
            {t(MODE_KEYS[mode] as any)}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {MODES.map((m) => (
          <DropdownMenuItem
            key={m}
            onClick={() => onChange(m)}
            className={cn('cursor-pointer justify-between', mode === m && 'bg-accent')}
          >
            <span>{t(MODE_KEYS[m] as any)}</span>
            {mode === m && <Check className="w-3 h-3 text-[#2F6B45]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
