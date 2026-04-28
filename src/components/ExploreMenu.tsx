'use client'

import Link from 'next/link'
import { LayoutGrid } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function ExploreMenu() {
  const { t } = useLanguage()
  const n = t.nav
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useLayoutEffect(() => {
    if (!open || !narrow) {
      return
    }
    const el = btnRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setMenuPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) })
    }
    update()
    window.addEventListener('resize', update)
    document.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      document.removeEventListener('scroll', update, true)
    }
  }, [open, narrow])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors select-none sm:gap-1.5 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${n.explore}: ${n.postJob}, ${n.exploreHelpers}, ${n.exploreJobs}`}
      >
        <LayoutGrid className="h-4 w-4 shrink-0 text-blue-600 sm:hidden" strokeWidth={2} aria-hidden />
        <span className="hidden max-w-[5.5rem] truncate text-[11px] font-bold leading-tight text-gray-800 sm:hidden">
          {n.explore}
        </span>
        <LayoutGrid className="hidden h-4 w-4 shrink-0 text-gray-500 sm:block" strokeWidth={2} aria-hidden />
        <span className="hidden sm:inline text-sm font-medium text-gray-500 sm:hover:text-gray-900">{n.explore}</span>
        <svg className="hidden sm:block" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (narrow ? menuPos : true) && (
        <div
          className={
            narrow && menuPos
              ? 'fixed z-[60] w-max max-w-[min(18rem,calc(100vw-1rem))] rounded-lg border py-0.5 shadow-lg'
              : 'absolute left-0 top-full z-[60] mt-2 w-52 rounded-xl border py-1 shadow-lg'
          }
          style={{
            background: 'var(--sl-bg-card)',
            borderColor: 'var(--sl-border)',
            ...(narrow && menuPos ? { top: menuPos.top, right: menuPos.right } : {}),
          }}
          role="menu"
        >
          <Link href="/post" onClick={() => setOpen(false)} className="block whitespace-nowrap rounded-md px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors sm:rounded-lg sm:px-3 sm:py-2.5">
            {n.postJob}
          </Link>
          <Link href="/taskers" onClick={() => setOpen(false)} className="block whitespace-nowrap rounded-md px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors sm:rounded-lg sm:px-3 sm:py-2.5">
            {n.exploreHelpers}
          </Link>
          <Link href="/jobs" onClick={() => setOpen(false)} className="block whitespace-nowrap rounded-md px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors sm:rounded-lg sm:px-3 sm:py-2.5">
            {n.exploreJobs}
          </Link>
        </div>
      )}
    </div>
  )
}
