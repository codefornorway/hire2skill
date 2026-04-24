'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import {
  Search, X,
  SprayCan, Truck, GraduationCap, Package, Wrench, PartyPopper, Monitor, Leaf,
  PawPrint, ChefHat, ShoppingBag, Wind, Scissors, Baby, Car, PaintBucket,
  Paintbrush, Wand2, Snowflake, Dog, Sofa, AppWindow, Camera, Dumbbell,
  HeartHandshake, Music,
} from 'lucide-react'

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
}

function isElite(t: Tasker) {
  return t.verified && t.rating >= 4.8 && (t.tasks_done ?? 0) >= 10
}

const CATEGORIES = [
  'All', 'Cleaning', 'Moving', 'Tutoring', 'Delivery', 'Handyman', 'Events',
  'IT & Tech', 'Gardening', 'Pet Care', 'Cooking', 'Shopping', 'Knitting',
  'Sewing', 'Kids Care', 'Car Wash', 'Painting', 'Makeup Artist', 'Hair Dresser',
  'Snow Removal', 'Dog Walking', 'Furniture Assembly', 'Window Cleaning',
  'Photography', 'Personal Training', 'Elder Care', 'Music Lessons',
]

type CatMeta = { bg: string; color: string; Icon: React.ElementType }
const CAT_ICONS: Record<string, CatMeta> = {
  'Cleaning':           { bg: '#F0FDF4', color: '#16A34A', Icon: SprayCan },
  'Moving':             { bg: '#EFF6FF', color: '#2563EB', Icon: Truck },
  'Tutoring':           { bg: '#FFFBEB', color: '#D97706', Icon: GraduationCap },
  'Delivery':           { bg: '#FFF7ED', color: '#EA580C', Icon: Package },
  'Handyman':           { bg: '#F5F3FF', color: '#7C3AED', Icon: Wrench },
  'Events':             { bg: '#FFF1F2', color: '#E11D48', Icon: PartyPopper },
  'IT & Tech':          { bg: '#F0F9FF', color: '#0284C7', Icon: Monitor },
  'Gardening':          { bg: '#F0FDF4', color: '#15803D', Icon: Leaf },
  'Pet Care':           { bg: '#FFF7ED', color: '#F97316', Icon: PawPrint },
  'Cooking':            { bg: '#FEF2F2', color: '#DC2626', Icon: ChefHat },
  'Shopping':           { bg: '#F5F3FF', color: '#8B5CF6', Icon: ShoppingBag },
  'Knitting':           { bg: '#FDF4FF', color: '#C026D3', Icon: Wind },
  'Sewing':             { bg: '#ECFEFF', color: '#0891B2', Icon: Scissors },
  'Kids Care':          { bg: '#FEFCE8', color: '#CA8A04', Icon: Baby },
  'Car Wash':           { bg: '#F0F9FF', color: '#0EA5E9', Icon: Car },
  'Painting':           { bg: '#EEF2FF', color: '#4F46E5', Icon: PaintBucket },
  'Makeup Artist':      { bg: '#FDF2F8', color: '#DB2777', Icon: Paintbrush },
  'Hair Dresser':       { bg: '#F3E8FF', color: '#7E22CE', Icon: Wand2 },
  'Snow Removal':       { bg: '#EFF6FF', color: '#0369A1', Icon: Snowflake },
  'Dog Walking':        { bg: '#FEF9C3', color: '#92400E', Icon: Dog },
  'Furniture Assembly': { bg: '#F5F3FF', color: '#6D28D9', Icon: Sofa },
  'Window Cleaning':    { bg: '#ECFEFF', color: '#0E7490', Icon: AppWindow },
  'Photography':        { bg: '#FFF1F2', color: '#BE123C', Icon: Camera },
  'Personal Training':  { bg: '#F0FDF4', color: '#166534', Icon: Dumbbell },
  'Elder Care':         { bg: '#FFF7ED', color: '#C2410C', Icon: HeartHandshake },
  'Music Lessons':      { bg: '#EEF2FF', color: '#4338CA', Icon: Music },
}

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7', '#EA580C', '#0F766E']

const SORT_OPTIONS = [
  { value: 'recommended',  label: 'Recommended' },
  { value: 'price_asc',    label: 'Price: Low → High' },
  { value: 'price_desc',   label: 'Price: High → Low' },
  { value: 'most_reviews', label: 'Most reviews' },
  { value: 'top_rated',    label: 'Highest rated' },
] as const
type SortBy = (typeof SORT_OPTIONS)[number]['value']

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

function TaskerCard({ tasker, index, bookLabel }: { tasker: Tasker; index: number; bookLabel: string }) {
  const initials = tasker.display_name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-200 flex flex-col">
      <div className="flex items-start gap-4 mb-4">
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
            <h3 className="font-extrabold text-gray-900 text-base">{tasker.display_name}</h3>
            {isElite(tasker) && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border"
                style={{ background: 'linear-gradient(135deg,#fef9c3,#fde68a)', color: '#92400e', borderColor: '#fcd34d' }}>
                ★ Elite
              </span>
            )}
            {tasker.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-100">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Verified
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
              <span className="text-xs text-gray-400">({tasker.review_count} reviews)</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-extrabold text-gray-900">{tasker.hourly_rate} NOK</p>
          <p className="text-xs text-gray-400">per hour</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">{tasker.bio}</p>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          {tasker.tasks_done} tasks
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          &lt; {tasker.response_hours}h reply
        </span>
        <div className="flex gap-1 ml-auto">
          {tasker.categories.slice(0, 2).map(c => {
            const meta = CAT_ICONS[c]
            const ChipIcon = meta?.Icon
            return (
              <span key={c} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: meta?.bg ?? '#EFF6FF', color: meta?.color ?? '#2563EB' }}>
                {ChipIcon && <ChipIcon size={11} strokeWidth={2} />}
                {c}
              </span>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
        <Link href={`/taskers/${tasker.id}`}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold text-blue-600 border-2 border-blue-600 text-center hover:bg-blue-600 hover:text-white transition-all">
          View profile
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
  const searchParams = useSearchParams()
  const posted = searchParams.get('posted') === '1'

  const [showBanner, setShowBanner] = useState(posted)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState(activeCategory ?? 'All')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [location, setLocation] = useState('All')
  const [minRating, setMinRating] = useState(0)
  const [maxResponseHours, setMaxResponseHours] = useState(24)
  const [sortBy, setSortBy] = useState<SortBy>('recommended')

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

  const hasActiveFilters = !!(debouncedQuery || category !== 'All' || priceMin || priceMax || location !== 'All' || minRating > 0 || maxResponseHours < 24)

  const filtered = useMemo(() => {
    let list = [...taskers]

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      list = list.filter(t =>
        t.display_name.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.categories.some(c => c.toLowerCase().includes(q))
      )
    }

    if (category !== 'All') list = list.filter(t => t.categories.includes(category))
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
  }, [taskers, debouncedQuery, category, priceMin, priceMax, location, minRating, maxResponseHours, sortBy])

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
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {showBanner && (
        <div className="bg-green-600 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-sm font-semibold">Your task is posted! Browse helpers below and send a request.</span>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-white/80 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header + Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Find a helper near you</h1>
          <p className="text-gray-500 text-base">Verified locals ready to help — book in minutes</p>

          {/* Search bar */}
          <div className="relative mt-6 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ zIndex: 1 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, service, or location…"
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
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: '2,400+ helpers' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: '8,000+ tasks completed' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, label: 'Avg. response < 2 hours' },
            ].map(s => (
              <span key={s.label} className="flex items-center gap-2">{s.icon}{s.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* Category chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
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
        <div className="flex flex-wrap items-center gap-2 mb-5">

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
            {locations.map(l => <option key={l} value={l}>{l === 'All' ? 'Any location' : l}</option>)}
          </select>

          {/* Min rating */}
          <select value={minRating} onChange={e => setMinRating(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
            <option value={0}>Any rating</option>
            <option value={3}>★ 3+</option>
            <option value={4}>★ 4+</option>
            <option value={4.5}>★ 4.5+</option>
          </select>

          {/* Availability */}
          <select value={maxResponseHours} onChange={e => setMaxResponseHours(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
            <option value={24}>Any availability</option>
            <option value={1}>Available now (&lt; 1h)</option>
            <option value={2}>Responds quickly (&lt; 2h)</option>
            <option value={4}>Within 4 hours</option>
          </select>

          {/* Clear all */}
          {hasActiveFilters && (
            <button onClick={clearAll}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
              <X size={13} />
              Clear
            </button>
          )}

          {/* Sort — pushed to the right */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline">Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900">{filtered.length}</span> helper{filtered.length !== 1 ? 's' : ''} found
          </p>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-blue-600 hover:underline">
              clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">No helpers match your search</p>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or search terms</p>
            <button onClick={clearAll}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((tasker, i) => (
              <TaskerCard key={tasker.id} tasker={tasker} index={i} bookLabel={t.home?.bookNow ?? 'Book now'} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-blue-100 bg-blue-50 px-8 py-10 text-center">
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">Are you a skilled professional?</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Join SkillLink as a helper and start earning on your own schedule.</p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Sign up as a helper
          </Link>
        </div>
      </div>
    </div>
  )
}
