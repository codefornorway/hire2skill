'use client'

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function useTheme() { return useContext(ThemeCtx) }

const THEME_KEY = 'sl-theme'
const THEME_EVENT = 'sl-theme-change'

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = window.localStorage.getItem(THEME_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function subscribeTheme(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onMq = () => onStoreChange()
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) onStoreChange()
  }
  const onCustom = () => onStoreChange()
  mq.addEventListener('change', onMq)
  window.addEventListener('storage', onStorage)
  window.addEventListener(THEME_EVENT, onCustom)
  return () => {
    mq.removeEventListener('change', onMq)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(THEME_EVENT, onCustom)
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(subscribeTheme, readTheme, () => 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggle() {
    if (typeof window === 'undefined') return
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    window.localStorage.setItem(THEME_KEY, next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}
