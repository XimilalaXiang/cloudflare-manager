import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Translations } from './types'
import en from './en'
import zh from './zh'

export type Locale = 'en' | 'zh'
export type { Translations }

const translations: Record<Locale, Translations> = { en, zh }

interface I18nContextType {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
  toggle: () => void
}

const I18nContext = createContext<I18nContextType>(null!)

function getInitialLocale(): Locale {
  const saved = localStorage.getItem('cf-lang') as Locale | null
  if (saved && (saved === 'en' || saved === 'zh')) return saved
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('cf-lang', l)
    document.documentElement.lang = l
  }, [])

  const toggle = useCallback(() => {
    setLocale(locale === 'en' ? 'zh' : 'en')
  }, [locale, setLocale])

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale, toggle }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
