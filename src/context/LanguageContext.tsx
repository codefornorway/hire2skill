'use client'

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { translations, locales, type Locale, type TranslationType } from '@/lib/i18n/translations'

type T = TranslationType

const LOCALE_KEY = 'sl_locale'
const LOCALE_EVENT = 'sl_locale_change'

function readLocale(): Locale {
  if (typeof window === 'undefined') return 'no'
  try {
    const raw = window.localStorage.getItem(LOCALE_KEY) as Locale | null
    if (raw && locales.includes(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'no'
}

function subscribeLocale(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === LOCALE_KEY) onStoreChange()
  }
  const onCustom = () => onStoreChange()
  window.addEventListener('storage', onStorage)
  window.addEventListener(LOCALE_EVENT, onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(LOCALE_EVENT, onCustom)
  }
}

const LanguageContext = createContext<{
  locale: Locale
  t: T
  setLocale: (l: Locale) => void
}>({
  locale: 'no',
  t: translations['no'],
  setLocale: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => 'no' as Locale)

  function setLocale(l: Locale) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(LOCALE_KEY, l)
    window.dispatchEvent(new Event(LOCALE_EVENT))
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
