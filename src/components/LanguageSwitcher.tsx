'use client'

import { useLanguage } from '@/context/LanguageContext'
import { locales, localeNames, type Locale } from '@/lib/i18n/translations'
import { useState, useRef, useEffect } from 'react'

const flags: Record<Locale, string> = {
  en: '🇬🇧',
  no: '🇳🇴',
  da: '🇩🇰',
  sv: '🇸🇪',
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <span>{flags[locale]}</span>
        <span className="hidden sm:inline font-medium">{localeNames[locale]}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
          {locales.map(l => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false) }}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 ${locale === l ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              <span>{flags[l]}</span>
              <span>{localeNames[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
