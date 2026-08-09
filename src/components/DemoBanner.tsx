import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DemoBannerProps {
  onExit: () => void
}

export function DemoBanner({ onExit }: DemoBannerProps) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-amber-900 min-w-0">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium truncate">
          Demo Mode — You're exploring a sample Rooted workspace. No real account data is being
          modified.
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onExit}
        className="text-xs border-amber-300 text-amber-800 hover:bg-amber-100 flex-shrink-0 h-7"
      >
        Exit Demo
      </Button>
    </div>
  )
}
