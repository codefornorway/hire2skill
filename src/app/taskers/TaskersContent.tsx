'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { Search, X, LayoutGrid, Map } from 'lucide-react'
import { CATEGORY_BY_KEY, CATEGORY_LABEL_BY_KEY, CATEGORY_LABELS, toCategoryKey } from '@/lib/categories'
import { categoryIconProps } from '@/lib/category-icon'

type Tasker = {
  id: string
  display_name: string
  bio: string
  hourly_rate: number
  categories: string[]
  location: string
  verified: boolean
  tasks_done: number
  rating: number
  review_count?: number
  response_hours: number
  avatar_url?: string | null
  languages?: string[] | null
  brings_tools?: boolean | null
  can_invoice?: boolean | null
}

function isElite(t: Tasker) {
  return t.verified && t.rating >= 4.8 && (t.tasks_done ?? 0) >= 10
}

const CATEGORIES = ['All', ...CATEGORY_LABELS]

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7', '#EA580C', '#0F766E']

// City bounding boxes (rough, for pin placement)
const CITY_ZONES: Record<string, { x: number; y: number; label: string }> = {
  'oslo':         { x: 52, y: 34, label: 'Oslo' },
  'bergen':       { x: 18, y: 44, label: 'Bergen' },
  'trondheim':    { x: 45, y: 18, label: 'Trondheim' },
  'stavanger':    { x: 15, y: 58, label: 'Stavanger' },
  'tromsø':       { x: 55, y: 5,  label: 'Tromsø' },
  'kristiansand': { x: 30, y: 70, label: 'Kristiansand' },
  'drammen':      { x: 49, y: 38, label: 'Drammen' },
  'fredrikstad':  { x: 55, y: 42, label: 'Fredrikstad' },
  'bodø':         { x: 42, y: 12, label: 'Bodø' },
  'ålesund':      { x: 24, y: 32, label: 'Ålesund' },
}

function cityKey(location: string) {
  return location.toLowerCase().split(/[–\s]/)[0].trim()
}

function MapView({
  taskers,
  bookLabel,
  ui,
}: {
  taskers: Tasker[]
  bookLabel: string
  ui: {
    mapAriaShowHelpersInCity: (count: number, city: string) => string
    mapClosePreview: string
    mapHelpersAcrossNorway: (count: number) => string
    perHourShort: string
  }
}) {
  const [active, setActive] = useState<Tasker | null>(null)

  // Group taskers by city zone
  const pins = taskers.reduce<{ key: string; zone: { x: number; y: number; label: string }; items: Tasker[] }[]>((acc, t) => {
    const key = cityKey(t.location)
    const zone = CITY_ZONES[key] ?? CITY_ZONES['oslo']
    const existing = acc.find(p => p.key === key)
    if (existing) { existing.items.push(t); return acc }
    return [...acc, { key, zone, items: [t] }]
  }, [])

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-white" style={{ height: 480 }}>
      {/* Norway SVG outline map */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width="100" height="100" fill="#EFF6FF" />
        {/* Simplified Norway landmass */}
        <path d="M30 5 Q40 3 50 8 Q58 6 60 10 Q65 8 68 14 Q72 12 74 18 Q78 15 80 22
                 Q82 20 84 28 Q86 26 85 35 Q88 33 87 42 Q90 40 88 50
                 Q90 52 88 60 Q89 65 86 70 Q88 75 84 78 Q82 82 78 84
                 Q74 88 70 86 Q65 90 60 87 Q55 92 50 88 Q44 92 40 87
                 Q35 90 32 85 Q28 88 26 82 Q22 84 22 78 Q18 80 20 72
                 Q16 70 18 62 Q14 60 16 52 Q12 48 15 40 Q11 36 14 28
                 Q10 24 14 18 Q12 14 17 10 Q20 6 25 5 Z"
          fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.5" />
        {/* Water body */}
        <text x="5" y="50" fontSize="3" fill="#60A5FA" fontWeight="bold" opacity="0.6">North Sea</text>
        <text x="62" y="25" fontSize="2.5" fill="#60A5FA" opacity="0.6">Norwegian Sea</text>
      </svg>

      {/* City pins */}
      {pins.map(pin => (
        <button key={pin.key} type="button"
          onClick={() => setActive(active?.id === pin.items[0].id && pin.items.length === 1 ? null : pin.items[0])}
          aria-label={ui.mapAriaShowHelpersInCity(pin.items.length, pin.zone.label)}
          className="absolute transform -translate-x-1/2 -translate-y-full group"
          style={{ left: `${pin.zone.x}%`, top: `${pin.zone.y}%`, zIndex: active && pin.items.some(t => t.id === active.id) ? 20 : 10 }}>
          <div className="flex flex-col items-center">
            <div className="rounded-full text-white text-xs font-extrabold px-2.5 py-1 shadow-lg transition-transform group-hover:scale-110 flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)', minWidth: 28 }}>
              {pin.items.length}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent"
              style={{ borderTopColor: '#1E3A8A' }} />
            <span className="text-[9px] font-bold text-blue-900 mt-0.5 bg-white/80 rounded px-1">{pin.zone.label}</span>
          </div>
        </button>
      ))}

      {/* Popup */}
      {active && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: AVATAR_COLORS[active.display_name.charCodeAt(0) % AVATAR_COLORS.length] }}>
              {active.display_name.split(' ').map(w => w[0]?.toUpperCase()).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{active.display_name}</p>
              <p className="text-xs text-gray-400">{active.location} · {active.hourly_rate} {ui.perHourShort}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/taskers/${active.id}`}
                className="rounded-xl px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                {bookLabel}
              </Link>
              <button onClick={() => setActive(null)} aria-label={ui.mapClosePreview} className="text-gray-400 hover:text-gray-600 px-1">✕</button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 bg-white/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm border border-gray-100">
        {ui.mapHelpersAcrossNorway(taskers.length)}
      </div>
    </div>
  )
}

const SORT_OPTIONS = ['recommended', 'price_asc', 'price_desc', 'most_reviews', 'top_rated'] as const
type SortBy = (typeof SORT_OPTIONS)[number]

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
    </span>
  )
}

function TaskerCard({
  tasker,
  index,
  bookLabel,
  ui,
}: {
  tasker: Tasker
  index: number
  bookLabel: string
  ui: {
    availableToday: string
    instantBook: string
    verified: string
    elite: string
    reviews: (count: number) => string
    perHour: string
    tasksCount: (count: number) => string
    responseWithinHours: (hours: number) => string
    viewProfile: string
  }
}) {
  const initials = tasker.display_name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const availableToday = tasker.response_hours <= 2
  const instantBook = tasker.verified && tasker.rating >= 4.8

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden">
      {/* Availability ribbon */}
      {availableToday && (
        <div className="absolute top-0 right-0">
          <div className="bg-green-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wide">
            {ui.availableToday}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3.5 mb-3.5">
        {tasker.avatar_url ? (
          <Image src={tasker.avatar_url} alt={tasker.display_name} width={64} height={64} className="h-16 w-16 rounded-2xl object-cover shrink-0" />
        ) : (
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-sm"
            style={{ background: color }}>
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-gray-900 text-[15px] leading-tight">{tasker.display_name}</h3>
            {isElite(tasker) && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border"
                style={{ background: 'linear-gradient(135deg,#fef9c3,#fde68a)', color: '#92400e', borderColor: '#fcd34d' }}>
                ★ {ui.elite}
              </span>
            )}
            {instantBook && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                {ui.instantBook}
              </span>
            )}
            {tasker.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-100">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {ui.verified}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-xs text-gray-400">{tasker.location}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Stars rating={tasker.rating} />
            {(tasker.review_count ?? 0) > 0 && (
              <span className="text-xs text-gray-400">({ui.reviews(tasker.review_count ?? 0)})</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 pl-2">
          <p className="text-2xl font-extrabold text-gray-900 leading-none">{tasker.hourly_rate} NOK</p>
          <p className="text-xs text-gray-400">{ui.perHour}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3 min-h-[3.9rem]">{tasker.bio}</p>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 rounded-xl bg-gray-50 px-2.5 py-2">
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          {ui.tasksCount(tasker.tasks_done)}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {ui.responseWithinHours(tasker.response_hours)}
        </span>
        <div className="flex gap-1 ml-auto">
          {tasker.categories.slice(0, 2).map(c => {
            const meta = CATEGORY_BY_KEY[toCategoryKey(c)]
            const ChipIcon = meta?.Icon
            return (
              <span key={c} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: meta?.bg ?? '#EFF6FF', color: meta?.color ?? '#2563EB' }}>
                {ChipIcon && <ChipIcon {...categoryIconProps(12, meta?.color ?? '#2563EB')} />}
                {CATEGORY_LABEL_BY_KEY[toCategoryKey(c)] ?? c}
              </span>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2.5 mt-auto pt-3.5 border-t border-gray-100">
        <Link href={`/taskers/${tasker.id}`}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold text-blue-600 border border-blue-200 text-center hover:bg-blue-50 transition-all">
          {ui.viewProfile}
        </Link>
        <Link href={`/taskers/${tasker.id}`}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
          {bookLabel}
        </Link>
      </div>
    </div>
  )
}

export default function TaskersContent({ taskers, activeCategory }: { taskers: Tasker[]; activeCategory: string | null }) {
  const { t } = useLanguage()
  const tt = t.taskers
  const ui = {
    bannerPosted: tt.bannerPosted ?? 'Your task is posted! Browse helpers below and send a request.',
    title: tt.title ?? 'Find a helper near you',
    subtitle: tt.subtitle ?? 'Verified locals ready to help — book in minutes',
    searchPlaceholder: tt.searchPlaceholder ?? 'Search by name, service, or location…',
    statsHelpers: tt.statsHelpers ?? '2,400+ helpers',
    statsTasksCompleted: tt.statsTasksCompleted ?? '8,000+ tasks completed',
    statsResponse: tt.statsResponse ?? 'Avg. response < 2 hours',
    anyLocation: tt.anyLocation ?? 'Any location',
    anyRating: tt.anyRating ?? 'Any rating',
    anyAvailability: tt.anyAvailability ?? 'Any availability',
    availableNow: tt.availableNow ?? 'Available now (< 1h)',
    respondsQuickly: tt.respondsQuickly ?? 'Responds quickly (< 2h)',
    withinFourHours: tt.withinFourHours ?? 'Within 4 hours',
    clear: tt.clear ?? 'Clear',
    sortLabel: tt.sortLabel ?? 'Sort:',
    helpersFound: (count: number) => tt.helpersFound?.(count) ?? `${count} helper${count === 1 ? '' : 's'} found`,
    clearFilters: tt.clearFilters ?? 'clear filters',
    popularThisSpring: tt.popularThisSpring ?? 'Popular this spring',
    grid: tt.grid ?? 'Grid',
    map: tt.map ?? 'Map',
    noMatchTitle: tt.noMatchTitle ?? 'No helpers match your search',
    noMatchHint: tt.noMatchHint ?? 'Try adjusting your filters or search terms',
    clearAllFilters: tt.clearAllFilters ?? 'Clear all filters',
    ctaTitle: tt.ctaTitle ?? 'Are you a skilled professional?',
    ctaBody: tt.ctaBody ?? 'Join Hire2Skill as a helper and start earning on your own schedule.',
    ctaButton: tt.ctaButton ?? 'Sign up as a helper',
    availableToday: tt.availableToday ?? 'Available today',
    instantBook: tt.instantBook ?? 'Instant Book',
    verified: tt.verified ?? 'Verified',
    elite: tt.elite ?? 'Elite',
    reviews: (count: number) => tt.reviews?.(count) ?? `${count} reviews`,
    perHour: tt.perHour ?? 'per hour',
    perHourShort: tt.perHourShort ?? 'NOK/hr',
    tasksCount: (count: number) => tt.tasksCount?.(count) ?? `${count} tasks`,
    responseWithinHours: (hours: number) => tt.responseWithinHours?.(hours) ?? `< ${hours}h reply`,
    viewProfile: tt.viewProfile ?? 'View profile',
    mapAriaShowHelpersInCity: (count: number, city: string) =>
      tt.mapAriaShowHelpersInCity?.(count, city) ?? `Show ${count} helper${count === 1 ? '' : 's'} in ${city}`,
    mapClosePreview: tt.mapClosePreview ?? 'Close map preview',
    mapHelpersAcrossNorway: (count: number) =>
      tt.mapHelpersAcrossNorway?.(count) ?? `${count} helper${count === 1 ? '' : 's'} across Norway`,
  }
  const searchParams = useSearchParams()
  const posted = searchParams.get('posted') === '1'

  const [showBanner, setShowBanner] = useState(posted)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState(activeCategory ?? 'All')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [location, setLocation] = useState('All')
  const [minRating, setMinRating] = useState(0)
  const [maxResponseHours, setMaxResponseHours] = useState(24)
  const [sortBy, setSortBy] = useState<SortBy>('recommended')
  const [wantNorwegian, setWantNorwegian] = useState(false)
  const [wantEnglish, setWantEnglish] = useState(false)
  const [wantTools, setWantTools] = useState(false)
  const [wantInvoice, setWantInvoice] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 280)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    if (posted) {
      const id = setTimeout(() => setShowBanner(false), 5000)
      return () => clearTimeout(id)
    }
  }, [posted])

  const locations = useMemo(() => {
    const set = new Set(taskers.map(t => t.location).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [taskers])

  const hasActiveFilters = !!(
    debouncedQuery ||
    category !== 'All' ||
    priceMin ||
    priceMax ||
    location !== 'All' ||
    minRating > 0 ||
    maxResponseHours < 24 ||
    wantNorwegian ||
    wantEnglish ||
    wantTools ||
    wantInvoice
  )

  const filtered = useMemo(() => {
    let list = [...taskers]

    const norwegianSignals = /(norsk|bokmål|bokmaal|nynorsk|snakker norsk|taler norsk|på norsk|norwegian|fluent norwegian)/i
    const englishSignals = /(english|engelsk|fluent english|business english|comfortable in english|native english)/i
    const toolSignals = /(tools?|utstyr|equipment|drill|driver|snekker|håndverk|handverk|maskin|lift|stillas|scaffold|varebil|van\b|trail)/i
    const invoiceSignals = /(invoice|faktura|mva\b|vat\b|org\.?\s*nr|orgnr|foretak|enk\b|as\b|vat\-?registered)/i

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      list = list.filter(t =>
        t.display_name.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.categories.some(c => c.toLowerCase().includes(q))
      )
    }

    if (wantNorwegian) {
      list = list.filter(t => {
        const langs = (t.languages ?? []).map(l => l.toLowerCase())
        return langs.includes('no') || langs.includes('nb') || langs.includes('nn') || norwegianSignals.test(t.bio)
      })
    }
    if (wantEnglish) {
      list = list.filter(t => {
        const langs = (t.languages ?? []).map(l => l.toLowerCase())
        return langs.includes('en') || englishSignals.test(t.bio)
      })
    }
    if (wantTools) list = list.filter(t => t.brings_tools === true || toolSignals.test(t.bio))
    if (wantInvoice) list = list.filter(t => t.can_invoice === true || invoiceSignals.test(t.bio))

    if (category !== 'All') {
      const activeKey = toCategoryKey(category)
      list = list.filter(t => t.categories.some(c => toCategoryKey(c) === activeKey))
    }
    if (priceMin)           list = list.filter(t => t.hourly_rate >= Number(priceMin))
    if (priceMax)           list = list.filter(t => t.hourly_rate <= Number(priceMax))
    if (location !== 'All') list = list.filter(t => t.location === location)
    if (minRating > 0)      list = list.filter(t => t.rating >= minRating)
    if (maxResponseHours < 24) list = list.filter(t => t.response_hours <= maxResponseHours)

    switch (sortBy) {
      case 'price_asc':    list.sort((a, b) => a.hourly_rate - b.hourly_rate); break
      case 'price_desc':   list.sort((a, b) => b.hourly_rate - a.hourly_rate); break
      case 'most_reviews': list.sort((a, b) => (b.review_count ?? b.tasks_done) - (a.review_count ?? a.tasks_done)); break
      case 'top_rated':    list.sort((a, b) => b.rating - a.rating); break
      default:             list.sort((a, b) => (b.rating * 20 + b.tasks_done) - (a.rating * 20 + a.tasks_done))
    }

    return list
  }, [taskers, debouncedQuery, category, priceMin, priceMax, location, minRating, maxResponseHours, sortBy, wantNorwegian, wantEnglish, wantTools, wantInvoice])

  function clearAll() {
    setQuery('')
    setDebouncedQuery('')
    setCategory('All')
    setPriceMin('')
    setPriceMax('')
    setLocation('All')
    setMinRating(0)
    setMaxResponseHours(24)
    setSortBy('recommended')
    setWantNorwegian(false)
    setWantEnglish(false)
    setWantTools(false)
    setWantInvoice(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {showBanner && (
        <div className="bg-green-600 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-sm font-semibold">{ui.bannerPosted}</span>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-white/80 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header + Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-[30px] leading-tight font-extrabold text-gray-900 mb-2">{ui.title}</h1>
          <p className="text-gray-500 text-[15px]">{ui.subtitle}</p>
          <p className="text-xs text-gray-400 mt-3 max-w-2xl leading-relaxed">{tt.trustLine}</p>

          {/* Search bar */}
          <div className="relative mt-6 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ zIndex: 1 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={ui.searchPlaceholder}
              style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: query ? '2.5rem' : '1rem' }}
              className="block rounded-2xl border border-gray-200 bg-white py-3.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-500">
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: ui.statsHelpers },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: ui.statsTasksCompleted },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, label: ui.statsResponse },
            ].map(s => (
              <span key={s.label} className="flex items-center gap-2">{s.icon}{s.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* Category chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all border"
              style={category === cat
                ? { background: 'linear-gradient(90deg,#2563EB,#38BDF8)', color: '#fff', borderColor: 'transparent' }
                : { background: '#fff', color: '#374151', borderColor: '#E5E7EB' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Filter strip */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5 rounded-2xl border border-gray-200 bg-white p-3">

          {/* Price range */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <span className="text-gray-400 text-xs font-medium">NOK</span>
            <input
              type="number" placeholder="Min" value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              className="w-14 outline-none text-gray-700 placeholder-gray-300" min="0"
            />
            <span className="text-gray-300 text-xs">–</span>
            <input
              type="number" placeholder="Max" value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              className="w-14 outline-none text-gray-700 placeholder-gray-300" min="0"
            />
          </div>

          {/* Location */}
          <select value={location} onChange={e => setLocation(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
            {locations.map(l => <option key={l} value={l}>{l === 'All' ? ui.anyLocation : l}</option>)}
          </select>

          {/* Min rating */}
          <select value={minRating} onChange={e => setMinRating(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
            <option value={0}>{ui.anyRating}</option>
            <option value={3}>★ 3+</option>
            <option value={4}>★ 4+</option>
            <option value={4.5}>★ 4.5+</option>
          </select>

          {/* Availability */}
          <select value={maxResponseHours} onChange={e => setMaxResponseHours(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
            <option value={24}>{ui.anyAvailability}</option>
            <option value={1}>{ui.availableNow}</option>
            <option value={2}>{ui.respondsQuickly}</option>
            <option value={4}>{ui.withinFourHours}</option>
          </select>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWantNorwegian(v => !v)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors"
              style={wantNorwegian
                ? { background: 'var(--sl-gradient-brand)', color: '#fff', borderColor: 'transparent' }
                : { background: '#fff', color: '#4B5563', borderColor: '#E5E7EB' }}>
              {tt.filterLangNo}
            </button>
            <button
              type="button"
              onClick={() => setWantEnglish(v => !v)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors"
              style={wantEnglish
                ? { background: 'var(--sl-gradient-brand)', color: '#fff', borderColor: 'transparent' }
                : { background: '#fff', color: '#4B5563', borderColor: '#E5E7EB' }}>
              {tt.filterLangEn}
            </button>
            <button
              type="button"
              onClick={() => setWantTools(v => !v)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors"
              style={wantTools
                ? { background: 'var(--sl-gradient-brand)', color: '#fff', borderColor: 'transparent' }
                : { background: '#fff', color: '#4B5563', borderColor: '#E5E7EB' }}>
              {tt.filterTools}
            </button>
            <button
              type="button"
              onClick={() => setWantInvoice(v => !v)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors"
              style={wantInvoice
                ? { background: 'var(--sl-gradient-brand)', color: '#fff', borderColor: 'transparent' }
                : { background: '#fff', color: '#4B5563', borderColor: '#E5E7EB' }}>
              {tt.filterInvoice}
            </button>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button onClick={clearAll}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
              <X size={13} />
              {ui.clear}
            </button>
          )}

          {/* Sort — pushed to the right */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline">{ui.sortLabel}</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              {SORT_OPTIONS.map(option => <option key={option} value={option}>{tt.sortOptions?.[option] ?? option}</option>)}
            </select>
          </div>
        </div>

        {/* Results count + seasonal tag + view toggle */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <p className="text-sm font-medium text-gray-600">
            {ui.helpersFound(filtered.length)}
            {hasActiveFilters && (
              <button onClick={clearAll} className="ml-2 text-xs text-blue-600 hover:underline">
                {ui.clearFilters}
              </button>
            )}
          </p>
          <div className="flex items-center gap-3">
            {!hasActiveFilters && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                {ui.popularThisSpring}
              </span>
            )}
            {/* Grid / Map toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
              <button onClick={() => setViewMode('grid')}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={viewMode === 'grid'
                  ? { background: 'linear-gradient(90deg,#2563EB,#38BDF8)', color: '#fff' }
                  : { color: '#6B7280' }}>
                <LayoutGrid size={13} strokeWidth={2} />
                {ui.grid}
              </button>
              <button onClick={() => setViewMode('map')}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={viewMode === 'map'
                  ? { background: 'linear-gradient(90deg,#2563EB,#38BDF8)', color: '#fff' }
                  : { color: '#6B7280' }}>
                <Map size={13} strokeWidth={2} />
                {ui.map}
              </button>
            </div>
          </div>
        </div>

        {/* Grid / Map */}
        {viewMode === 'map' ? (
          <MapView taskers={filtered} bookLabel={t.home?.bookNow ?? 'Book now'} ui={ui} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">{ui.noMatchTitle}</p>
            <p className="text-gray-400 text-sm mb-4">{ui.noMatchHint}</p>
            <button onClick={clearAll}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
              {ui.clearAllFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tasker, i) => (
              <TaskerCard key={tasker.id} tasker={tasker} index={i} bookLabel={t.home?.bookNow ?? 'Book now'} ui={ui} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-blue-100 bg-blue-50 px-8 py-10 text-center">
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">{ui.ctaTitle}</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{ui.ctaBody}</p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            {ui.ctaButton}
          </Link>
        </div>
      </div>
    </div>
  )
}
