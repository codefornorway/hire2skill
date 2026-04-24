'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import {
  SprayCan, Truck, GraduationCap, Package, Wrench, PartyPopper, Monitor, Leaf,
  PawPrint, ChefHat, ShoppingBag, Wind, Scissors, Baby, Car, PaintBucket,
  Paintbrush, Wand2, Snowflake, Dog, Sofa, AppWindow, Camera, Dumbbell,
  HeartHandshake, Music,
} from 'lucide-react'

import type { RealHelper } from './page'

type Job = { title: string; location: string; price: number | null; category: string; urgent?: boolean }

// Normalise a human-readable category label to a CAT_ICONS key
function toCatKey(label: string): string {
  const overrides: Record<string, string> = {
    'IT & Tech': 'it', 'Pet Care': 'petcare', 'Kids Care': 'kidscare',
    'Car Wash': 'carwash', 'Makeup Artist': 'makeup', 'Hair Dresser': 'hairdresser',
    'Snow Removal': 'snowremoval', 'Dog Walking': 'dogwalking',
    'Furniture Assembly': 'furnitureassembly', 'Window Cleaning': 'windowcleaning',
    'Personal Training': 'personaltraining', 'Elder Care': 'eldercare',
    'Music Lessons': 'musiclessons',
  }
  return overrides[label] ?? label.toLowerCase().replace(/\s+/g, '').replace('&', '')
}

// ── Inline Norway flag SVG (no emoji) ──────────────────────────────────────
function NorwayFlag({ size = 16 }: { size?: number }) {
  const w = Math.round(size * 1.5)
  return (
    <svg width={w} height={size} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 2, display: 'block' }}>
      <rect width="24" height="16" fill="#EF2B2D" />
      <rect x="6" width="4" height="16" fill="white" />
      <rect y="6" width="24" height="4" fill="white" />
      <rect x="7" width="2" height="16" fill="#003087" />
      <rect y="7" width="24" height="2" fill="#003087" />
    </svg>
  )
}

// ── Star rating ─────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-600">{rating.toFixed(1)}</span>
    </span>
  )
}

// ── Category icon map ───────────────────────────────────────────────────────
type CatIconEntry = { bg: string; fg: string; Icon: React.ElementType }
const CAT_ICONS: Record<string, CatIconEntry> = {
  cleaning:          { bg: '#F0FDF4', fg: '#16A34A', Icon: SprayCan },
  moving:            { bg: '#EFF6FF', fg: '#2563EB', Icon: Truck },
  tutoring:          { bg: '#FFFBEB', fg: '#D97706', Icon: GraduationCap },
  delivery:          { bg: '#FFF7ED', fg: '#EA580C', Icon: Package },
  handyman:          { bg: '#F5F3FF', fg: '#7C3AED', Icon: Wrench },
  events:            { bg: '#FFF1F2', fg: '#E11D48', Icon: PartyPopper },
  it:                { bg: '#F0F9FF', fg: '#0284C7', Icon: Monitor },
  gardening:         { bg: '#F0FDF4', fg: '#15803D', Icon: Leaf },
  petcare:           { bg: '#FFF7ED', fg: '#F97316', Icon: PawPrint },
  cooking:           { bg: '#FEF2F2', fg: '#DC2626', Icon: ChefHat },
  shopping:          { bg: '#F5F3FF', fg: '#8B5CF6', Icon: ShoppingBag },
  knitting:          { bg: '#FDF4FF', fg: '#C026D3', Icon: Wind },
  sewing:            { bg: '#ECFEFF', fg: '#0891B2', Icon: Scissors },
  kidscare:          { bg: '#FEFCE8', fg: '#CA8A04', Icon: Baby },
  carwash:           { bg: '#F0F9FF', fg: '#0EA5E9', Icon: Car },
  painting:          { bg: '#EEF2FF', fg: '#4F46E5', Icon: PaintBucket },
  makeup:            { bg: '#FDF2F8', fg: '#DB2777', Icon: Paintbrush },
  hairdresser:       { bg: '#F3E8FF', fg: '#7E22CE', Icon: Wand2 },
  snowremoval:       { bg: '#EFF6FF', fg: '#0369A1', Icon: Snowflake },
  dogwalking:        { bg: '#FEF9C3', fg: '#92400E', Icon: Dog },
  furnitureassembly: { bg: '#F5F3FF', fg: '#6D28D9', Icon: Sofa },
  windowcleaning:    { bg: '#ECFEFF', fg: '#0E7490', Icon: AppWindow },
  photography:       { bg: '#FFF1F2', fg: '#BE123C', Icon: Camera },
  personaltraining:  { bg: '#F0FDF4', fg: '#166534', Icon: Dumbbell },
  eldercare:         { bg: '#FFF7ED', fg: '#C2410C', Icon: HeartHandshake },
  musiclessons:      { bg: '#EEF2FF', fg: '#4338CA', Icon: Music },
}

// ── Sample tasker profiles (displayed as helpers) ───────────────────────────
const SAMPLE_TASKERS = [
  { initials: 'MK', name: 'Maria K.', rating: 4.9, tasks: 52, reply: '< 1h', location: 'Oslo', category: 'cleaning', price: 350 },
  { initials: 'ER', name: 'Erik R.', rating: 4.8, tasks: 38, reply: '< 2h', location: 'Bergen', category: 'moving', price: 500 },
  { initials: 'AS', name: 'Amina S.', rating: 5.0, tasks: 74, reply: '< 30m', location: 'Oslo', category: 'tutoring', price: 400 },
]

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']

// ── Job card (TaskRabbit style) ─────────────────────────────────────────────
function TaskCard({ job, bookLabel, negotiableLabel }: { job: Job; bookLabel: string; negotiableLabel: string }) {
  const initials = job.title.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const color = AVATAR_COLORS[Math.abs(job.title.charCodeAt(0)) % AVATAR_COLORS.length]
  const cat = CAT_ICONS[toCatKey(job.category)] ?? CAT_ICONS.handyman
  const CatIcon = cat.Icon

  return (
    <Link href="/signup" className="group flex flex-col rounded-2xl bg-white border border-gray-200 p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-200">
      {/* Header: avatar + info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm"
          style={{ background: color }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{job.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-xs text-gray-400">{job.location}</span>
          </div>
        </div>
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
          <CatIcon size={18} color={cat.fg} strokeWidth={1.75} />
        </div>
      </div>

      {/* Rating + reply time */}
      <div className="flex items-center gap-3 mb-4">
        <Stars rating={4.7 + (job.title.charCodeAt(0) % 3) * 0.1} />
        <span className="text-xs text-gray-400">·</span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          &lt; 2h
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <span className="text-lg font-extrabold" style={{ color: '#16A34A' }}>
          {job.price ? `${job.price} NOK` : negotiableLabel}
        </span>
        <span className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity group-hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
          {bookLabel}
        </span>
      </div>
    </Link>
  )
}

type DisplayHelper = {
  id?: string
  initials: string
  name: string
  avatarUrl?: string | null
  avatarColor: string
  location: string
  catKey: string
  price: number | null
  rating: number
  tasks: number
  reply: string
}

// ── Tasker profile card ─────────────────────────────────────────────────────
function TaskerCard({ tasker, bookLabel, replyLabel, doneLabel }: { tasker: DisplayHelper; bookLabel: string; replyLabel: string; doneLabel: string }) {
  const cat = CAT_ICONS[tasker.catKey] ?? CAT_ICONS.handyman
  const CatIcon = cat.Icon
  const href = tasker.id ? `/taskers/${tasker.id}` : '/signup'
  return (
    <Link href={href} className="group flex flex-col rounded-2xl bg-white border border-gray-200 p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        {tasker.avatarUrl ? (
          <Image src={tasker.avatarUrl} alt={tasker.name} width={48} height={48} className="h-12 w-12 rounded-2xl object-cover shrink-0" />
        ) : (
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
            style={{ background: tasker.avatarColor }}>
            {tasker.initials}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{tasker.name}</p>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-xs text-gray-400">{tasker.location}</span>
          </div>
        </div>
        <div className="ml-auto h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
          <CatIcon size={20} color={cat.fg} strokeWidth={1.75} />
        </div>
      </div>

      <Stars rating={tasker.rating} />

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        {tasker.tasks > 0 && (
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            {tasker.tasks} {doneLabel}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {replyLabel} {tasker.reply}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-lg font-extrabold" style={{ color: '#16A34A' }}>
          {tasker.price ? `${tasker.price} NOK` : 'Negotiable'}
        </span>
        <span className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity group-hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
          {bookLabel}
        </span>
      </div>
    </Link>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function HomeContent({ jobs, totalJobs, helpers }: { jobs: Job[]; totalJobs: number; helpers: RealHelper[] | null }) {
  const { t } = useLanguage()
  const h = t.home

  const how1 = h?.how1
  const how2 = h?.how2
  const how3 = h?.how3

  if (!h || !how1 || !how2 || !how3) return null

  // Build display helpers — real profiles if available, otherwise sample fallback
  const displayHelpers: DisplayHelper[] = helpers
    ? helpers.map((p, i) => {
        const initials = p.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
        const catKey = p.categories.length > 0 ? toCatKey(p.categories[0]) : 'handyman'
        return {
          id: p.id,
          initials,
          name: p.name,
          avatarUrl: p.avatarUrl,
          avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
          location: p.location,
          catKey,
          price: p.hourlyRate,
          rating: 4.8,
          tasks: 0,
          reply: '< 2h',
        }
      })
    : SAMPLE_TASKERS.map((t, i) => ({
        initials: t.initials,
        name: t.name,
        avatarUrl: null,
        avatarColor: AVATAR_COLORS[i],
        location: t.location,
        catKey: t.category,
        price: t.price,
        rating: t.rating,
        tasks: t.tasks,
        reply: t.reply,
      }))

  const catKeys = [
    'cleaning', 'moving', 'tutoring', 'delivery', 'handyman', 'events', 'it', 'gardening',
    'petcare', 'cooking', 'shopping', 'knitting', 'sewing', 'kidscare', 'carwash', 'painting',
    'makeup', 'hairdresser', 'snowremoval', 'dogwalking', 'furnitureassembly', 'windowcleaning',
    'photography', 'personaltraining', 'eldercare', 'musiclessons',
  ] as const

  const HOW_STEPS = [
    {
      num: '1',
      color: '#2563EB',
      bg: '#EFF6FF',
      title: how1.title,
      desc: how1.desc,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
    },
    {
      num: '2',
      color: '#7C3AED',
      bg: '#F5F3FF',
      title: how2.title,
      desc: how2.desc,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      num: '3',
      color: '#16A34A',
      bg: '#F0FDF4',
      title: how3.title,
      desc: how3.desc,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="flex flex-col bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          {/* Norway badge — SVG flag, no emoji */}
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 mb-6 border border-blue-100">
            <NorwayFlag size={14} />
            {h.badge}
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-4">
            {h.title1}{' '}
            <span className="block" style={{ background: 'linear-gradient(90deg,#1E3A8A,#38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {h.title2}
            </span>
          </h1>

          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">{h.subtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/post"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-9 py-5 text-lg font-extrabold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)', boxShadow: '0 8px 30px rgba(37,99,235,0.35)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              {h.cta1.replace('🚀 ', '')}
            </Link>
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 bg-white px-9 py-5 text-lg font-extrabold text-gray-700 transition hover:border-blue-400 hover:text-blue-600 hover:shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {h.cta2.replace(' →', '')}
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
            {[`${totalJobs.toLocaleString()}+ ${h.stat1}`, h.stat2, h.stat3].map(s => (
              <span key={s} className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY BROWSE ───────────────────────────────────────────────── */}
      <section className="px-6 py-14 max-w-6xl mx-auto w-full">
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">{h.categoriesTitle}</h2>
        <p className="text-sm text-gray-400 mb-8">Oslo · Bergen · Trondheim · Stavanger</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {catKeys.map(key => {
            const cfg = CAT_ICONS[key]
            const CatIcon = cfg.Icon
            const catLabel = key === 'it' ? 'IT & Tech'
              : key === 'petcare' ? 'Pet Care'
              : key === 'kidscare' ? 'Kids Care'
              : key === 'carwash' ? 'Car Wash'
              : key === 'hairdresser' ? 'Hair Dresser'
              : key === 'makeup' ? 'Makeup Artist'
              : key === 'snowremoval' ? 'Snow Removal'
              : key === 'dogwalking' ? 'Dog Walking'
              : key === 'furnitureassembly' ? 'Furniture Assembly'
              : key === 'windowcleaning' ? 'Window Cleaning'
              : key === 'personaltraining' ? 'Personal Training'
              : key === 'eldercare' ? 'Elder Care'
              : key === 'musiclessons' ? 'Music Lessons'
              : key.charAt(0).toUpperCase() + key.slice(1)
            return (
              <Link key={key} href={`/taskers?category=${encodeURIComponent(catLabel)}`}
                className="group flex flex-col items-center gap-2.5 rounded-2xl bg-white border border-gray-200 px-3 py-4 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-center">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: cfg.bg }}>
                  <CatIcon size={24} color={cfg.fg} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                  {h.cat[key as keyof typeof h.cat]}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-12">{h.howTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative">
                {/* Connector line */}
                {idx < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+32px)] right-[-calc(50%-32px)] h-px" style={{ background: 'linear-gradient(90deg,#E5E7EB,#E5E7EB)', width: 'calc(100% - 32px)' }} />
                )}
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm relative z-10 border-2 border-white"
                  style={{ background: step.bg, boxShadow: `0 0 0 4px ${step.bg}` }}>
                  {step.icon}
                </div>
                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold mb-3"
                  style={{ background: step.bg, color: step.color }}>
                  Step {step.num}
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP TASKERS ──────────────────────────────────────────────────── */}
      <section className="px-6 py-14 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Top helpers near you</h2>
            <p className="text-sm text-gray-400 mt-1">Verified · Rated · Ready to help</p>
          </div>
          <Link href="/signup" className="text-sm font-semibold text-blue-600 hover:underline">{h.seeAll}</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {displayHelpers.map((tasker, i) => (
            <TaskerCard key={i} tasker={tasker} bookLabel={h.bookNow} replyLabel={h.replyTime} doneLabel={h.tasksDone} />
          ))}
        </div>
      </section>

      {/* ── URGENT TASKS ─────────────────────────────────────────────────── */}
      <section className="px-6 pb-14 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FFF7ED,#FED7AA)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">{h.urgentTitle}</h2>
              <p className="text-sm text-gray-400">{h.urgentSub}</p>
            </div>
          </div>
          <Link href="/signup" className="text-sm font-semibold text-blue-600 hover:underline">{h.seeAll}</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {jobs.slice(0, 3).map((job, i) => (
            <TaskCard key={i} job={job} bookLabel={h.bookNow} negotiableLabel={h.negotiable} />
          ))}
        </div>
      </section>

      {/* ── TRUST STATS BAND ─────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-10">{h.trustTitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { val: '2,400+', label: 'Verified users', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, bg: '#EFF6FF' },
              { val: '< 2h', label: 'Avg. response', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, bg: '#F5F3FF' },
              { val: '8,000+', label: 'Tasks completed', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, bg: '#F0FDF4' },
              { val: '12', label: 'Cities covered', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, bg: '#FFF7ED' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SKILLLINK ────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <p className="text-center text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-12">{h.whyTitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            { bg: '#EFF6FF', title: h.fast.title, desc: h.fast.desc,
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
            { bg: '#F0FDF4', title: h.local.title, desc: h.local.desc,
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
            { bg: '#FFFBEB', title: h.chat.title, desc: h.chat.desc,
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          ].map(f => (
            <div key={f.title} className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3 className="text-base font-extrabold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl px-8 py-16 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 50%,#38BDF8 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">{h.ctaTitle}</h2>
            <p className="text-blue-100 mb-8 text-base max-w-md mx-auto">{h.ctaSub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-extrabold transition hover:bg-blue-50 shadow-lg"
                style={{ color: '#1E3A8A' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                {h.ctaPrimary}
              </Link>
              <Link href="/post"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/50 px-8 py-4 text-base font-extrabold text-white transition hover:bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                {h.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
