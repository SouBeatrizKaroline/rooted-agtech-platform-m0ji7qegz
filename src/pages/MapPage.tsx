import { useState } from 'react'
import { InteractiveMap } from '@/components/map/InteractiveMap'
import { useI18n } from '@/hooks/use-i18n'

export default function MapPage() {
  const { t } = useI18n()

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#214D34]">{t('navMap')}</h1>
        <p className="text-xs sm:text-sm text-[#536057] mt-1">
          Interactive agricultural corridor & restriction viewer
        </p>
      </div>

      <InteractiveMap height="h-[calc(100vh-220px)]" />
    </div>
  )
}
