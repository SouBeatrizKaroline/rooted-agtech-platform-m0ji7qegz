import { cn } from '@/lib/utils'

interface BadgeTagProps {
  type: 'data' | 'estimate' | 'recommendation' | 'warning' | 'normal' | 'attention' | 'critical'
  label?: string
  className?: string
}

export function BadgeTag({ type, label, className }: BadgeTagProps) {
  const configs = {
    data: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'Data' },
    estimate: { bg: 'bg-amber-100 text-amber-800 border-amber-300', text: 'Estimate' },
    recommendation: {
      bg: 'bg-green-100 text-green-900 border-green-400 font-semibold',
      text: 'Recommendation',
    },
    warning: { bg: 'bg-red-100 text-red-800 border-red-300', text: 'Warning' },
    normal: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Normal' },
    attention: { bg: 'bg-amber-50 text-amber-800 border-amber-300', text: 'Attention' },
    critical: { bg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', text: 'Critical' },
  }

  const cfg = configs[type] || configs.data

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
        cfg.bg,
        className,
      )}
    >
      {label || cfg.text}
    </span>
  )
}
