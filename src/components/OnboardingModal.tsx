import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, Route, Compass, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

export function OnboardingModal() {
  const [open, setOpen] = useState(() => !localStorage.getItem('rooted_onboarding_dismissed'))
  const navigate = useNavigate()
  const { t, language, setLanguage } = useI18n()

  const handleDismiss = (target?: string) => {
    localStorage.setItem('rooted_onboarding_dismissed', 'true')
    setOpen(false)
    if (target) navigate(target)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent className="sm:max-w-md bg-white border-[#DCE3DC] p-4 sm:p-6 rounded-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#DDEBDD] text-[#2F6B45] flex items-center justify-center mb-3 mx-auto sm:mx-0">
            <Sprout className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#214D34]">
            {t('welcomeOnboarding')}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#536057] mt-1">
            {t('onboardingDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F2] border border-[#DCE3DC]">
            <span className="text-xs font-semibold text-[#536057]">{t('settingsLanguage')}</span>
            <div className="flex gap-1">
              {(['en', 'pt', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    language === lang
                      ? 'bg-[#2F6B45] text-white'
                      : 'bg-white text-[#536057] border border-[#DCE3DC]'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={() => handleDismiss('/app/shipments')}
            className="w-full bg-[#2F6B45] hover:bg-[#214D34] text-white gap-2"
          >
            <Route className="w-4 h-4" />
            {t('planShipment')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDismiss()}
            className="w-full border-[#DCE3DC] text-[#536057] hover:bg-[#F6F7F2]"
          >
            {t('exploreOverview')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
