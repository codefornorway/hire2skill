'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  SprayCan, Truck, GraduationCap, Package, Wrench, PartyPopper, Monitor, Leaf,
  PawPrint, ChefHat, ShoppingBag, Wind, Scissors, Baby, Car, PaintBucket,
  Paintbrush, Wand2, Snowflake, Dog, Sofa, AppWindow, Camera, Dumbbell,
  HeartHandshake, Music,
} from 'lucide-react'

const CATEGORIES: { key: string; bg: string; color: string; Icon: React.ElementType }[] = [
  { key: 'Cleaning',           bg: '#F0FDF4', color: '#16A34A', Icon: SprayCan },
  { key: 'Moving',             bg: '#EFF6FF', color: '#2563EB', Icon: Truck },
  { key: 'Tutoring',           bg: '#FFFBEB', color: '#D97706', Icon: GraduationCap },
  { key: 'Delivery',           bg: '#FFF7ED', color: '#EA580C', Icon: Package },
  { key: 'Handyman',           bg: '#F5F3FF', color: '#7C3AED', Icon: Wrench },
  { key: 'Events',             bg: '#FFF1F2', color: '#E11D48', Icon: PartyPopper },
  { key: 'IT & Tech',          bg: '#F0F9FF', color: '#0284C7', Icon: Monitor },
  { key: 'Gardening',          bg: '#F0FDF4', color: '#15803D', Icon: Leaf },
  { key: 'Pet Care',           bg: '#FFF7ED', color: '#F97316', Icon: PawPrint },
  { key: 'Cooking',            bg: '#FEF2F2', color: '#DC2626', Icon: ChefHat },
  { key: 'Shopping',           bg: '#F5F3FF', color: '#8B5CF6', Icon: ShoppingBag },
  { key: 'Knitting',           bg: '#FDF4FF', color: '#C026D3', Icon: Wind },
  { key: 'Sewing',             bg: '#ECFEFF', color: '#0891B2', Icon: Scissors },
  { key: 'Kids Care',          bg: '#FEFCE8', color: '#CA8A04', Icon: Baby },
  { key: 'Car Wash',           bg: '#F0F9FF', color: '#0EA5E9', Icon: Car },
  { key: 'Painting',           bg: '#EEF2FF', color: '#4F46E5', Icon: PaintBucket },
  { key: 'Makeup Artist',      bg: '#FDF2F8', color: '#DB2777', Icon: Paintbrush },
  { key: 'Hair Dresser',       bg: '#F3E8FF', color: '#7E22CE', Icon: Wand2 },
  { key: 'Snow Removal',       bg: '#EFF6FF', color: '#0369A1', Icon: Snowflake },
  { key: 'Dog Walking',        bg: '#FEF9C3', color: '#92400E', Icon: Dog },
  { key: 'Furniture Assembly', bg: '#F5F3FF', color: '#6D28D9', Icon: Sofa },
  { key: 'Window Cleaning',    bg: '#ECFEFF', color: '#0E7490', Icon: AppWindow },
  { key: 'Photography',        bg: '#FFF1F2', color: '#BE123C', Icon: Camera },
  { key: 'Personal Training',  bg: '#F0FDF4', color: '#166534', Icon: Dumbbell },
  { key: 'Elder Care',         bg: '#FFF7ED', color: '#C2410C', Icon: HeartHandshake },
  { key: 'Music Lessons',      bg: '#EEF2FF', color: '#4338CA', Icon: Music },
]

const NORWAY_LOCATIONS = [
  'Oslo – Sentrum', 'Oslo – Grünerløkka', 'Oslo – Grønland', 'Oslo – Tøyen',
  'Oslo – Frogner', 'Oslo – Majorstuen', 'Oslo – Skøyen', 'Oslo – Bygdøy',
  'Oslo – Sagene', 'Oslo – Nydalen', 'Oslo – Storo', 'Oslo – Furuset',
  'Oslo – Grorud', 'Oslo – Stovner', 'Oslo – Nordstrand', 'Oslo – Holmlia',
  'Bergen – Sentrum', 'Bergen – Bergenhus', 'Bergen – Sandviken', 'Bergen – Fana',
  'Bergen – Fyllingsdalen', 'Bergen – Åsane', 'Bergen – Arna', 'Bergen – Laksevåg',
  'Trondheim – Midtbyen', 'Trondheim – Nedre Elvehavn', 'Trondheim – Lerkendal',
  'Trondheim – Heimdal', 'Trondheim – Byåsen', 'Trondheim – Strindheim',
  'Stavanger – Sentrum', 'Stavanger – Storhaug', 'Stavanger – Madla',
  'Stavanger – Eiganes', 'Stavanger – Hundvåg', 'Stavanger – Tasta',
  'Kristiansand', 'Tromsø', 'Sandnes', 'Fredrikstad', 'Sarpsborg',
  'Bodø', 'Ålesund', 'Tønsberg', 'Drammen', 'Moss', 'Hamar',
  'Lillehammer', 'Molde', 'Harstad', 'Gjøvik', 'Kongsberg',
  'Bærum', 'Asker', 'Lillestrøm', 'Lørenskog', 'Ski',
]

type Step = 1 | 2 | 3 | 4

type Helper = {
  id: string
  name: string
  avatarUrl: string | null
  categories: string[]
  location: string
  hourlyRate: number | null
}

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function ProgressBar({ step }: { step: Step }) {
  const steps = ['Choose service', 'Task details', 'Browse helpers', 'Confirm']
  return (
    <div className="border-b border-gray-100 bg-white px-6 py-4 sticky top-18.25 z-40">
      <div className="flex items-center max-w-4xl mx-auto">
        {steps.map((label, i) => {
          const num = (i + 1) as Step
          const done = num < step
          const active = num === step
          return (
            <div key={label} className="flex items-center flex-1 min-w-0">
              <div className={`flex items-center gap-2 shrink-0 ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                  active ? 'border-blue-600 bg-blue-600 text-white'
                  : done  ? 'border-green-500 bg-green-500 text-white'
                  :         'border-gray-300 bg-white text-gray-400'
                }`}>
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : num}
                </div>
                <span className={`text-xs font-semibold hidden sm:block truncate ${active ? 'text-blue-700' : done ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < 3 && (
                <div className={`h-px flex-1 mx-2 sm:mx-3 ${num < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PostForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null)
  const [allHelpers, setAllHelpers] = useState<Helper[]>([])
  const [loadingHelpers, setLoadingHelpers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [locSuggestions, setLocSuggestions] = useState<string[]>([])
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)
  const locRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setShowLocSuggestions(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (step !== 3 || allHelpers.length > 0) return
    setLoadingHelpers(true)
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url, categories, location, hourly_rate')
      .eq('role', 'helper')
      .not('display_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(24)
      .then(({ data }) => {
        setAllHelpers((data ?? []).map(p => ({
          id: p.id,
          name: p.display_name ?? 'Helper',
          avatarUrl: p.avatar_url ?? null,
          categories: (p.categories as string[] | null) ?? [],
          location: p.location ?? 'Norway',
          hourlyRate: p.hourly_rate ?? null,
        })))
        setLoadingHelpers(false)
      })
  }, [step, allHelpers.length])

  const filteredHelpers = useMemo(() =>
    allHelpers.filter(h =>
      !category || h.categories.some(c => c.toLowerCase() === category.toLowerCase())
    ),
  [allHelpers, category])

  function handleLocChange(val: string) {
    setLocation(val)
    if (errors.location) setErrors(prev => ({ ...prev, location: '' }))
    if (val.trim().length >= 1) {
      const matches = NORWAY_LOCATIONS.filter(l => l.toLowerCase().includes(val.toLowerCase())).slice(0, 8)
      setLocSuggestions(matches)
      setShowLocSuggestions(matches.length > 0)
    } else {
      setShowLocSuggestions(false)
    }
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!title.trim() || title.trim().length < 3) e.title = 'Please write a task title (min 3 characters).'
    if (!description.trim() || description.trim().length < 10) e.description = 'Please describe your task (min 10 characters).'
    if (!location.trim()) e.location = 'Please select your location.'
    return e
  }

  async function handleConfirm() {
    setSubmitting(true)
    setSubmitError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?next=/post'); return }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        price: budget ? Number(budget) : null,
        location: location.trim(),
      })
      .select('id')
      .single()

    if (postError || !post) {
      setSubmitError(postError?.message ?? 'Failed to post task.')
      setSubmitting(false)
      return
    }

    if (selectedHelper) {
      await supabase.from('bookings').insert({
        post_id: post.id,
        poster_id: user.id,
        helper_id: selectedHelper.id,
        status: 'pending',
      })
    }

    router.push('/dashboard?posted=1')
  }

  const selectedCat = CATEGORIES.find(c => c.key === category)

  // ── Step 1 ──────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        <ProgressBar step={1} />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 text-center">What do you need help with?</h1>
          <p className="text-sm text-gray-400 mb-8 text-center">Pick a service category to get started.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.key} type="button"
                onClick={() => { setCategory(cat.key); setStep(2) }}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white border-2 border-gray-100 px-3 py-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-center group">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: cat.bg }}>
                  <cat.Icon size={26} color={cat.color} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">{cat.key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2 ──────────────────────────────────────────────────────
  if (step === 2) {
    const cat = selectedCat!
    return (
      <div>
        <ProgressBar step={2} />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                  <cat.Icon size={20} color={cat.color} strokeWidth={1.75} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900">{category}</h1>
                  <p className="text-xs text-gray-400">Tell us what you need done</p>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Task title <span className="text-red-500">*</span></label>
                <input type="text" value={title}
                  onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: '' })) }}
                  placeholder={`e.g. Need help with ${category.toLowerCase()} in ${location || 'Oslo'}`}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition ${errors.title ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Describe your task <span className="text-red-500">*</span></label>
                <textarea rows={4} value={description}
                  onChange={e => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: '' })) }}
                  placeholder="Give details about what needs to be done, any special requirements, size of the job..."
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none transition ${errors.description ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Location <span className="text-red-500">*</span></label>
                <div ref={locRef} className="relative">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <input type="text" value={location} onChange={e => handleLocChange(e.target.value)}
                      onFocus={() => { if (location.length >= 1) setShowLocSuggestions(locSuggestions.length > 0) }}
                      placeholder="Search city or neighbourhood..."
                      className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition ${errors.location ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                  </div>
                  {showLocSuggestions && locSuggestions.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {locSuggestions.map(loc => (
                        <li key={loc}>
                          <button type="button" onMouseDown={() => { setLocation(loc); setShowLocSuggestions(false) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span className="font-medium text-gray-700">{loc}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
              </div>

              {/* Budget + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Budget <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">NOK</span>
                    <input type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)}
                      placeholder="350"
                      className="w-full rounded-xl border border-gray-200 pl-12 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Preferred date <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                  <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
                <button type="button"
                  onClick={() => {
                    const errs = validateStep2()
                    if (Object.keys(errs).length) { setErrors(errs); return }
                    setErrors({})
                    setStep(3)
                  }}
                  className="btn-primary flex-1 py-3">
                  Browse helpers →
                </button>
              </div>
            </div>

            {/* Summary panel */}
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sticky top-32">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Task summary</p>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                    <cat.Icon size={18} color={cat.color} strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{category}</span>
                </div>
                {title && <p className="text-sm font-semibold text-gray-800 mb-2 truncate">{title}</p>}
                {location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {location}
                  </div>
                )}
                {budget && <p className="text-xs font-bold text-green-600 mb-2">{budget} NOK budget</p>}
                {preferredDate && <p className="text-xs text-gray-500">{new Date(preferredDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                {!title && !location && (
                  <p className="text-xs text-gray-400 italic">Fill in the form to see your summary here.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 3 ──────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div>
        <ProgressBar step={3} />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Available helpers for {category}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {loadingHelpers ? 'Loading...' : `${filteredHelpers.length} helper${filteredHelpers.length !== 1 ? 's' : ''} found${location ? ` near ${location}` : ''}`}
              </p>
            </div>
            <button type="button" onClick={() => { setSelectedHelper(null); setStep(4) }}
              className="shrink-0 text-sm font-semibold text-blue-600 hover:underline whitespace-nowrap">
              Skip → post publicly
            </button>
          </div>

          {loadingHelpers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-48" />)}
            </div>
          ) : filteredHelpers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">No helpers yet for {category}</p>
              <p className="text-xs text-gray-400 mb-5">Post publicly — helpers will see and respond to your task.</p>
              <button type="button" onClick={() => { setSelectedHelper(null); setStep(4) }} className="btn-primary px-8 py-2.5">
                Post publicly →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHelpers.map(helper => {
                const isSelected = selectedHelper?.id === helper.id
                return (
                  <div key={helper.id}
                    onClick={() => setSelectedHelper(isSelected ? null : helper)}
                    className={`rounded-2xl border-2 bg-white p-5 cursor-pointer transition-all select-none ${
                      isSelected ? 'border-blue-500 shadow-lg shadow-blue-100/60' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {helper.avatarUrl ? (
                        <img src={helper.avatarUrl} alt={helper.name} className="h-12 w-12 rounded-2xl object-cover shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: avatarColor(helper.name) }}>
                          {initials(helper.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{helper.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {helper.location}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3 min-h-5.5">
                      {helper.categories.slice(0, 3).map(c => (
                        <span key={c} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{c}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-base font-extrabold" style={{ color: '#16A34A' }}>
                        {helper.hourlyRate ? `${helper.hourlyRate} NOK/hr` : 'Negotiable'}
                      </span>
                      <Link href={`/taskers/${helper.id}`} onClick={e => e.stopPropagation()}
                        className="text-xs font-semibold text-blue-600 hover:underline">
                        View profile →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center gap-3 mt-8">
            <button type="button" onClick={() => setStep(2)}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              ← Back
            </button>
            <button type="button" onClick={() => setStep(4)} className="btn-primary flex-1 py-3">
              {selectedHelper ? `Continue with ${selectedHelper.name.split(' ')[0]} →` : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 4 ──────────────────────────────────────────────────────
  const cat4 = selectedCat!
  return (
    <div>
      <ProgressBar step={4} />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-xl font-extrabold text-gray-900 mb-6">Confirm your task</h1>

            {submitError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
              {/* Category row */}
              <div className="flex items-center gap-4 p-5">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat4.bg }}>
                  <cat4.Icon size={20} color={cat4.color} strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Category</p>
                  <p className="text-sm font-bold text-gray-900">{category}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 font-semibold hover:underline shrink-0">Edit</button>
              </div>

              {/* Task details row */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Task details</p>
                  <button type="button" onClick={() => setStep(2)} className="text-xs text-blue-600 font-semibold hover:underline">Edit</button>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {location}
                  </span>
                  {budget && <span className="font-bold text-green-600">{budget} NOK</span>}
                  {preferredDate && (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {new Date(preferredDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Helper row */}
              {selectedHelper ? (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Sending request to</p>
                    <button type="button" onClick={() => setStep(3)} className="text-xs text-blue-600 font-semibold hover:underline">Change</button>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedHelper.avatarUrl ? (
                      <img src={selectedHelper.avatarUrl} alt={selectedHelper.name} className="h-11 w-11 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: avatarColor(selectedHelper.name) }}>
                        {initials(selectedHelper.name)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{selectedHelper.name}</p>
                      <p className="text-xs text-gray-400">{selectedHelper.location}</p>
                    </div>
                    <span className="text-sm font-extrabold text-green-600 shrink-0">
                      {selectedHelper.hourlyRate ? `${selectedHelper.hourlyRate} NOK/hr` : 'Negotiable'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Visibility</p>
                  <p className="text-sm text-gray-500">Public listing — helpers in your area will see and respond to your task.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button type="button" onClick={() => setStep(3)}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                ← Back
              </button>
              <button type="button" onClick={handleConfirm} disabled={submitting}
                className={`btn-primary flex-1 py-3 ${submitting ? 'opacity-60' : ''}`}>
                {submitting ? 'Posting...' : selectedHelper
                  ? `Send request to ${selectedHelper.name.split(' ')[0]}`
                  : 'Post task publicly'}
              </button>
            </div>
          </div>

          {/* What happens next */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sticky top-32">
              <p className="text-sm font-bold text-blue-900 mb-4">What happens next?</p>
              <div className="flex flex-col gap-3">
                {[
                  selectedHelper ? `${selectedHelper.name.split(' ')[0]} gets notified of your request` : 'Helpers near you are notified',
                  'They review your task and respond',
                  'Chat directly to agree on details',
                  'Get it done safely — rate when complete',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-blue-800 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-blue-200 bg-white p-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-800">💬 Messaging included.</span>{' '}
                  Once a helper responds, you can message each other directly through SkillLink — no phone number needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
