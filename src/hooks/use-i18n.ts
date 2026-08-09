import { useState, useEffect, createContext, useContext, ReactNode, createElement } from 'react'
import { translations, Language } from '@/i18n/translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof (typeof translations)['en']) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('rooted_lang')
    if (saved === 'pt' || saved === 'es' || saved === 'en') return saved
    return 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('rooted_lang', lang)
  }

  const t = (key: keyof (typeof translations)['en']): string => {
    const dict = translations[language] || translations.en
    return dict[key] || translations.en[key] || key
  }

  return createElement(I18nContext.Provider, { value: { language, setLanguage, t } }, children)
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within an I18nProvider')
  return context
}
