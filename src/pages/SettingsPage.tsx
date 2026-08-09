import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/hooks/use-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FeatherlessModelPanel } from '@/components/FeatherlessModelPanel'
import { AimlApiModelPanel } from '@/components/AimlApiModelPanel'

export default function SettingsPage() {
  const { user, signOut, demoMode, exitDemo, requestEmailChange } = useAuth()
  const { language, setLanguage, t } = useI18n()

  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [featherlessEnabled, setFeatherlessEnabled] = useState(
    () => localStorage.getItem('rooted_ai_provider') === 'featherless',
  )
  const [featherlessModel, setFeatherlessModel] = useState(
    () => localStorage.getItem('rooted_ai_model') || '',
  )
  const [aimlApiEnabled, setAimlApiEnabled] = useState(
    () => localStorage.getItem('rooted_ai_provider') === 'aimlapi',
  )
  const [aimlApiModel, setAimlApiModel] = useState(
    () => localStorage.getItem('rooted_aimlapi_model') || '',
  )

  const handleFeatherlessToggle = (enabled: boolean) => {
    setFeatherlessEnabled(enabled)
    if (enabled) {
      setAimlApiEnabled(false)
      localStorage.setItem('rooted_ai_provider', 'featherless')
    } else {
      localStorage.setItem('rooted_ai_provider', 'rooted')
    }
  }

  const handleAimlApiToggle = (enabled: boolean) => {
    setAimlApiEnabled(enabled)
    if (enabled) {
      setFeatherlessEnabled(false)
      localStorage.setItem('rooted_ai_provider', 'aimlapi')
    } else {
      localStorage.setItem('rooted_ai_provider', 'rooted')
    }
  }

  const handleAimlApiModel = (model: string) => {
    setAimlApiModel(model)
    localStorage.setItem('rooted_aimlapi_model', model)
  }

  const handleFeatherlessModel = (model: string) => {
    setFeatherlessModel(model)
    localStorage.setItem('rooted_ai_model', model)
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMsg('')
    const { error } = await requestEmailChange(newEmail)
    if (error) setEmailMsg('Could not request email change.')
    else setEmailMsg('Confirmation link sent to your new email.')
  }

  const handleSignOut = () => {
    if (demoMode) exitDemo()
    else signOut()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fade-in min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#214D34]">{t('navSettings')}</h1>
        <p className="text-xs sm:text-sm text-[#536057] mt-1">
          Manage profile, preferences, and security
        </p>
      </div>

      <div className="p-4 sm:p-5 bg-white border border-[#DCE3DC] rounded-2xl space-y-4 shadow-subtle">
        <h3 className="font-bold text-base text-[#214D34]">User Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs text-[#536057]">
          <div>
            Name: <strong>{demoMode ? 'Demo Explorer' : user?.name || 'Manager'}</strong>
          </div>
          <div>
            Current Email: <strong>{demoMode ? 'demo@rooted.agtech' : user?.email}</strong>
          </div>
        </div>
        {demoMode && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            You are in Demo Mode. Email and password changes are disabled.
          </div>
        )}
      </div>

      {!demoMode && (
        <div className="p-5 bg-white border border-[#DCE3DC] rounded-2xl space-y-4 shadow-subtle">
          <h3 className="font-bold text-base text-[#214D34]">Change Email</h3>
          {emailMsg && <p className="text-xs text-emerald-800 font-medium">{emailMsg}</p>}
          <form onSubmit={handleEmailChange} className="space-y-3">
            <Input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="border-[#DCE3DC]"
            />
            <Button type="submit" size="sm" className="bg-[#2F6B45] text-white">
              Request Email Change
            </Button>
          </form>
        </div>
      )}

      <div className="p-5 bg-white border border-[#DCE3DC] rounded-2xl space-y-4 shadow-subtle">
        <h3 className="font-bold text-base text-[#214D34]">{t('settingsLanguage')}</h3>
        <div className="flex gap-2">
          {(['en', 'pt', 'es'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                language === lang
                  ? 'bg-[#2F6B45] text-white border-[#2F6B45]'
                  : 'bg-white text-[#536057] border-[#DCE3DC]'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'pt' ? 'Português' : 'Español'}
            </button>
          ))}
        </div>
      </div>

      <FeatherlessModelPanel
        enabled={featherlessEnabled}
        onToggle={handleFeatherlessToggle}
        selectedModel={featherlessModel}
        onSelectModel={handleFeatherlessModel}
      />

      <AimlApiModelPanel
        enabled={aimlApiEnabled}
        onToggle={handleAimlApiToggle}
        selectedModel={aimlApiModel}
        onSelectModel={handleAimlApiModel}
      />

      <div className="pt-4">
        <Button onClick={handleSignOut} variant="destructive" className="w-full">
          {demoMode ? 'Exit Demo' : t('signOut')}
        </Button>
      </div>
    </div>
  )
}
