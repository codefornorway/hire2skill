'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, locales, type Locale } from '@/lib/i18n/translations'

type T = typeof translations['en']

const LanguageContext = createContext<{
  locale: Locale
  t: T
  setLocale: (l: Locale) => void
}>({
  locale: 'en',
  t: translations['en'],
  setLocale: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('sl_locale') as Locale | null
    if (saved && locales.includes(saved)) setLocaleState(saved)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('sl_locale', l)
  }

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
