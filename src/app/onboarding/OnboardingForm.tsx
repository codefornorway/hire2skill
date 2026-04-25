'use client'

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import {
  SprayCan, Truck, GraduationCap, Package, Wrench, PartyPopper, Monitor, Leaf,
  PawPrint, ChefHat, ShoppingBag, Wind, Scissors, Baby, Car, PaintBucket,
  Paintbrush, Wand2, Snowflake, Dog, Sofa, AppWindow, Camera, Dumbbell,
  HeartHandshake, Music,
} from 'lucide-react'

type Role = 'helper' | 'poster'

const CATEGORIES: { key: string; Icon: React.ElementType; bg: string; color: string }[] = [
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
  'Oslo – Gamlebyen', 'Oslo – Sørenga', 'Oslo – Tjuvholmen', 'Oslo – Aker Brygge',
  'Oslo – Bislett', 'Oslo – St. Hanshaugen', 'Oslo – Frogner', 'Oslo – Majorstuen',
  'Oslo – Skøyen', 'Oslo – Lysaker', 'Oslo – Bygdøy', 'Oslo – Ullern',
  'Oslo – Røa', 'Oslo – Vinderen', 'Oslo – Holmenkollen', 'Oslo – Sagene',
  'Oslo – Sandaker', 'Oslo – Storo', 'Oslo – Nydalen', 'Oslo – Sinsen',
  'Oslo – Grefsen', 'Oslo – Kjelsås', 'Oslo – Tåsen', 'Oslo – Alna',
  'Oslo – Furuset', 'Oslo – Lindeberg', 'Oslo – Trosterud', 'Oslo – Haugerud',
  'Oslo – Teisen', 'Oslo – Grorud', 'Oslo – Ammerud', 'Oslo – Romsås',
  'Oslo – Stovner', 'Oslo – Haugenstua', 'Oslo – Vestli', 'Oslo – Bjerke',
  'Oslo – Helsfyr', 'Oslo – Nordstrand', 'Oslo – Ljan', 'Oslo – Ekeberg',
  'Oslo – Lambertseter', 'Oslo – Manglerud', 'Oslo – Ryen', 'Oslo – Bryn',
  'Oslo – Oppsal', 'Oslo – Bøler', 'Oslo – Holmlia', 'Oslo – Mortensrud',
  'Bergen – Sentrum', 'Bergen – Bergenhus', 'Bergen – Sandviken', 'Bergen – Nygårdshøyden',
  'Bergen – Nordnes', 'Bergen – Møhlenpris', 'Bergen – Fana', 'Bergen – Nesttun',
  'Bergen – Paradis', 'Bergen – Fyllingsdalen', 'Bergen – Laksevåg', 'Bergen – Loddefjord',
  'Bergen – Åsane', 'Bergen – Flaktveit', 'Bergen – Arna',
  'Trondheim – Midtbyen', 'Trondheim – Nedre Elvehavn', 'Trondheim – Møllenberg',
  'Trondheim – Rosenborg', 'Trondheim – Strindheim', 'Trondheim – Ranheim',
  'Trondheim – Lerkendal', 'Trondheim – Singsaker', 'Trondheim – Nardo',
  'Trondheim – Heimdal', 'Trondheim – Saupstad', 'Trondheim – Byåsen',
  'Stavanger – Sentrum', 'Stavanger – Stavanger Øst', 'Stavanger – Storhaug',
  'Stavanger – Hillevåg', 'Stavanger – Hundvåg', 'Stavanger – Madla',
  'Stavanger – Tasta', 'Stavanger – Eiganes', 'Stavanger – Våland',
  'Drammen – Bragernes', 'Drammen – Strømsø', 'Drammen – Fjell', 'Drammen – Konnerud',
  'Kristiansand', 'Tromsø', 'Sandnes', 'Fredrikstad', 'Sarpsborg',
  'Bodø', 'Sandefjord', 'Ålesund', 'Tønsberg', 'Moss', 'Hamar',
  'Porsgrunn', 'Skien', 'Arendal', 'Haugesund', 'Larvik', 'Halden',
  'Lillehammer', 'Molde', 'Harstad', 'Gjøvik', 'Horten', 'Kongsberg',
  'Bærum', 'Asker', 'Jessheim', 'Lillestrøm', 'Lørenskog', 'Ski',
  'Oppegård', 'Ås', 'Nesodden', 'Frogn', 'Vestby', 'Ullensaker',
  'Nannestad', 'Eidsvoll', 'Nittedal', 'Rælingen', 'Skedsmo',
  'Karmøy', 'Sola', 'Askøy', 'Kongsvinger', 'Elverum', 'Brumunddal',
  'Namsos', 'Steinkjer', 'Levanger', 'Stjørdal',
  'Alta', 'Hammerfest', 'Vadsø', 'Kirkenes', 'Narvik',
  'Finnsnes', 'Svolvær', 'Mo i Rana',
]

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
      />
    </div>
  )
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-2 rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? 24 : 8,
            background: i + 1 <= current ? '#2563EB' : '#E5E7EB',
          }} />
      ))}
    </div>
  )
}

export default function OnboardingForm({ userId, userEmail }: { userId: string; userEmail: string }) {
  const defaultName = userEmail.split('@')[0]

  const [step, setStep] = useState(1)
  const [role, setRole] = useState<Role | null>(null)
  const { t } = useLanguage()
  const o = t.onboarding

  const [displayName, setDisplayName] = useState(defaultName)
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [videoIntroUrl, setVideoIntroUrl] = useState('')
  const [locSuggestions, setLocSuggestions] = useState<string[]>([])
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)
  const locRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    displayName?: string
    bio?: string
    location?: string
    categories?: string
    hourlyRate?: string
  }>({})

  const completion = role === 'helper'
    ? [displayName.trim(), bio.trim(), location.trim(), hourlyRate, categories.length > 0 ? 'y' : '']
        .filter(Boolean).length * 20
    : 100

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setShowLocSuggestions(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleLocationChange(val: string) {
    setLocation(val)
    if (val.trim().length >= 1) {
      const matches = NORWAY_LOCATIONS.filter(l => l.toLowerCase().includes(val.toLowerCase())).slice(0, 8)
      setLocSuggestions(matches)
      setShowLocSuggestions(matches.length > 0)
    } else {
      setShowLocSuggestions(false)
    }
  }

  function selectLocation(val: string) {
    setLocation(val)
    setShowLocSuggestions(false)
  }

  function toggleCategory(cat: string) {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  function validate() {
    const errs: typeof fieldErrors = {}
    if (!displayName.trim()) errs.displayName = 'Name is required.'
    else if (displayName.trim().length < 2) errs.displayName = 'Name must be at least 2 characters.'
    if (!bio.trim()) errs.bio = 'Please write a short description about yourself.'
    else if (bio.trim().length < 20) errs.bio = 'Description must be at least 20 characters.'
    if (!location.trim()) errs.location = 'Please select your location.'
    if (categories.length === 0) errs.categories = 'Please select at least one service category.'
    if (hourlyRate && (isNaN(Number(hourlyRate)) || Number(hourlyRate) < 0))
      errs.hourlyRate = 'Enter a valid rate (e.g. 350).'
    return errs
  }

  async function saveProfile(r: Role, extra: Record<string, unknown> = {}) {
    setLoading(true)
    setServerError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('profiles').upsert({
      id: userId,
      role: r,
      display_name: displayName.trim() || defaultName,
      ...extra,
    })
    setLoading(false)
    if (err) { setServerError(err.message); return false }
    return true
  }

  async function handleRoleSelect(r: Role) {
    setRole(r)
    if (r === 'poster') {
      const ok = await saveProfile(r)
      if (ok) setStep(3)
    } else {
      setStep(2)
    }
  }

  async function handleHelperSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    const ok = await saveProfile('helper', {
      bio: bio.trim(),
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      categories,
      location: location.trim(),
      video_intro_url: videoIntroUrl.trim() || null,
    })
    if (ok) setStep(3)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg,#EFF6FF 0%,#F0F9FF 50%,#F0FDF4 100%)' }}>

      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-2xl font-extrabold" style={{ color: '#1E3A8A' }}>
            SKILL<span style={{ color: '#38BDF8' }}>LINK</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* ── STEP 1: Choose role ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <StepDots current={1} total={2} />
                <h1 className="text-2xl font-extrabold text-gray-900 mt-4 mb-2">{o.welcome}</h1>
                <p className="text-gray-500 text-sm">{o.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Poster card */}
                <button onClick={() => handleRoleSelect('poster')} disabled={loading}
                  className="group flex flex-col items-center text-center rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-200 disabled:opacity-50">
                  <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#DBEAFE,#93C5FD)' }}>
                    {/* Clipboard with task list — "I need help posting tasks" */}
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/>
                      <path d="m9 14 2 2 4-4"/>
                      <path d="M9 10h6"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1.5 group-hover:text-blue-600 transition-colors">
                    {o.posterTitle}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{o.posterDesc}</p>
                </button>

                {/* Helper card */}
                <button onClick={() => handleRoleSelect('helper')} disabled={loading}
                  className="group flex flex-col items-center text-center rounded-2xl border-2 border-gray-200 p-6 hover:border-green-500 hover:shadow-xl transition-all duration-200 disabled:opacity-50">
                  <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#DCFCE7,#86EFAC)' }}>
                    {/* Person with award medal — "I can help, I have skills" */}
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6"/>
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-1.5 group-hover:text-green-600 transition-colors">
                    {o.helperTitle}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{o.helperDesc}</p>
                </button>
              </div>

              {loading && (
                <p className="text-center text-sm text-gray-400 mt-4">{o.settingUp}</p>
              )}
              {serverError && (
                <p className="text-center text-sm text-red-500 mt-4">{serverError}</p>
              )}
            </div>
          )}

          {/* ── STEP 2: Helper profile form ─────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleHelperSubmit}>
              {/* Progress header */}
              <div className="px-8 pt-8 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <StepDots current={2} total={2} />
                  <span className="text-xs font-semibold text-gray-400">Profile {completion}% complete</span>
                </div>
                <ProgressBar value={completion} />
                <h2 className="text-xl font-extrabold text-gray-900 mt-5 mb-1">{o.setupTitle}</h2>
                <p className="text-sm text-gray-500">{o.setupSub}</p>
              </div>

              <div className="px-8 pb-8 flex flex-col gap-5">
                {/* Display name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {o.nameLabel} <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={displayName} onChange={e => { setDisplayName(e.target.value); setFieldErrors(p => ({ ...p, displayName: undefined })) }}
                    placeholder="e.g. Maria K."
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
                      fieldErrors.displayName ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
                    }`} />
                  {fieldErrors.displayName && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {fieldErrors.displayName}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {o.aboutLabel} <span className="text-red-400">*</span>
                  </label>
                  <textarea rows={3} value={bio} onChange={e => { setBio(e.target.value); setFieldErrors(p => ({ ...p, bio: undefined })) }}
                    placeholder="Describe your experience, skills, and what makes you great at this..."
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition resize-none ${
                      fieldErrors.bio ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
                    }`} />
                  {fieldErrors.bio && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {fieldErrors.bio}
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {o.servicesLabel} <span className="text-red-400">*</span>
                  </label>
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl transition ${
                    fieldErrors.categories ? 'ring-2 ring-red-200 p-2' : ''
                  }`}>
                    {CATEGORIES.map(({ key, Icon, bg, color }) => {
                      const selected = categories.includes(key)
                      return (
                        <button key={key} type="button"
                          onClick={() => { toggleCategory(key); setFieldErrors(p => ({ ...p, categories: undefined })) }}
                          className="flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-all"
                          style={selected
                            ? { borderColor: color, background: bg, color }
                            : { borderColor: '#E5E7EB', background: '#fff', color: '#374151' }}>
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg"
                            style={{ background: selected ? bg : '#F9FAFB' }}>
                            <Icon size={18} color={selected ? color : '#9CA3AF'} strokeWidth={1.75} />
                          </span>
                          {key}
                        </button>
                      )
                    })}
                  </div>
                  {fieldErrors.categories && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {fieldErrors.categories}
                    </p>
                  )}
                </div>

                {/* Location + Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {o.locationLabel} <span className="text-red-400">*</span>
                    </label>
                    <div ref={locRef} className="relative">
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <input
                          type="text"
                          value={location}
                          onChange={e => { handleLocationChange(e.target.value); setFieldErrors(p => ({ ...p, location: undefined })) }}
                          onFocus={() => { if (location.length >= 1) setShowLocSuggestions(locSuggestions.length > 0) }}
                          placeholder="e.g. Oslo"
                          style={{ paddingLeft: '2.25rem' }}
                          className={`w-full rounded-xl border pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
                            fieldErrors.location ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
                          }`}
                        />
                      </div>
                      {showLocSuggestions && locSuggestions.length > 0 && (
                        <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          {locSuggestions.map(loc => (
                            <li key={loc}>
                              <button type="button" onMouseDown={() => selectLocation(loc)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                </svg>
                                {loc}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {fieldErrors.location && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {fieldErrors.location}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {o.rateLabel}
                    </label>
                    <input type="number" min="0" value={hourlyRate}
                      onChange={e => { setHourlyRate(e.target.value); setFieldErrors(p => ({ ...p, hourlyRate: undefined })) }}
                      placeholder="e.g. 350"
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${
                        fieldErrors.hourlyRate ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
                      }`} />
                    {fieldErrors.hourlyRate && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {fieldErrors.hourlyRate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Video intro URL (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Video intro <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="url" value={videoIntroUrl} onChange={e => setVideoIntroUrl(e.target.value)}
                    placeholder="YouTube link, e.g. https://youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                  <p className="text-xs text-gray-400 mt-1.5">A short 30–60 second video helps clients trust you. Paste a YouTube or Vimeo link.</p>
                </div>

                {serverError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{serverError}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  {loading ? o.saving : o.completeBtn}
                </button>

                <button type="button" onClick={() => setStep(1)}
                  className="text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  {o.goBack}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Success ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="p-8 text-center">
              {/* Success icon */}
              <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{o.allSet}</h2>
              <p className="text-gray-500 text-sm mb-6">
                {role === 'helper'
                  ? 'Your helper profile is live. Clients can now find and book you.'
                  : 'Your account is ready. Start posting tasks and find help near you.'}
              </p>

              {/* Profile completion (helpers only) */}
              {role === 'helper' && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">Profile strength</span>
                    <span className="text-sm font-extrabold" style={{ color: '#2563EB' }}>{completion}%</span>
                  </div>
                  <ProgressBar value={completion} />
                  {completion < 100 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Complete all fields to get more bookings and appear higher in search results.
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <Link href="/dashboard"
                  className="block w-full rounded-xl py-3.5 text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  {role === 'helper' ? 'Go to my dashboard →' : 'Browse helpers →'}
                </Link>
                {role === 'poster' && (
                  <Link href="/post"
                    className="block w-full rounded-xl py-3 text-sm font-bold text-blue-600 border-2 border-blue-200 text-center hover:bg-blue-50 transition-colors">
                    Post your first task
                  </Link>
                )}
                {role === 'helper' && (
                  <Link href="/taskers"
                    className="block w-full rounded-xl py-3 text-sm font-semibold text-gray-500 text-center hover:text-gray-700 transition-colors">
                    See how you appear to clients →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          You can update all of this later from your profile settings.
        </p>
      </div>
    </div>
  )
}
