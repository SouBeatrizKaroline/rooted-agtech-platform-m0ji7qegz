import { Globe } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface WebSourceBadgeProps {
  sources: string[]
  className?: string
  iconSize?: string
}

export function WebSourceBadge({
  sources,
  className,
  iconSize = 'w-2.5 h-2.5',
}: WebSourceBadgeProps) {
  const { t } = useI18n()

  if (!sources || sources.length === 0) return null

  if (sources.length === 1) {
    return (
      <span
        className={cn('flex items-center gap-1 mt-1 text-[10px] text-[#536057] px-1', className)}
        role="status"
        aria-live="polite"
      >
        <Globe className={iconSize} aria-hidden="true" />
        {t('webAccessSource')}: {sources[0]}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'flex items-center gap-1 mt-1 text-[10px] text-[#536057] px-1 flex-wrap',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Globe className={iconSize} aria-hidden="true" />
      <span className="font-medium">{t('webAccessSources')}:</span>
      {sources.map((s, i) => (
        <span key={i}>
          • {s}
          {i < sources.length - 1 && ' '}
        </span>
      ))}
    </span>
  )
}
