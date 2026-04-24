'use client'

import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
  response_hours: number
  avatar_url?: string | null
}

type Review = {
  author: string
  date: string
  rating: number
  text: string
}

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']

const CAT_META: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  Cleaning:   { bg: '#F0FDF4', color: '#16A34A', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg> },
  Moving:     { bg: '#EFF6FF', color: '#2563EB', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  Tutoring:   { bg: '#FFFBEB', color: '#D97706', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  Delivery:   { bg: '#FFF7ED', color: '#EA580C', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
  Handyman:   { bg: '#F5F3FF', color: '#7C3AED', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  Events:     { bg: '#FFF1F2', color: '#E11D48', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
  'IT & Tech':{ bg: '#F0F9FF', color: '#0284C7', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  Gardening:  { bg: '#F0FDF4', color: '#15803D', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M12 12C12 7 8 4 3 5c0 5 3 9 9 7M12 12c0-5 4-8 9-7-1 5-4 9-9 7"/></svg> },
  'Pet Care': { bg: '#FFF7ED', color: '#F97316', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="5.5" r="1.8"/><circle cx="16.5" cy="5.5" r="1.8"/><circle cx="4.5" cy="11" r="1.8"/><circle cx="19.5" cy="11" r="1.8"/><path d="M12 21c-3.5 0-6-2-6-5 0-1.5.5-2.8 2-4h8c1.5 1.2 2 2.5 2 4 0 3-2.5 5-6 5z"/></svg> },
  Cooking:    { bg: '#FEF2F2', color: '#DC2626', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/><path d="M21 15v7"/></svg> },
  Shopping:   { bg: '#F5F3FF', color: '#8B5CF6', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  Knitting:   { bg: '#FDF4FF', color: '#C026D3', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C026D3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="6"/><path d="M8 8L4 2"/><path d="M16 8L20 2"/><path d="M6 14Q9 11 12 14Q15 17 18 14"/></svg> },
  Sewing:     { bg: '#ECFEFF', color: '#0891B2', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
  'Kids Care':{ bg: '#FEFCE8', color: '#CA8A04', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="#CA8A04"/><circle cx="15" cy="9" r="1" fill="#CA8A04"/></svg> },
  'Car Wash': { bg: '#F0F9FF', color: '#0EA5E9', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14L7 8h10l3 6H4z"/><line x1="3" y1="14" x2="21" y2="14"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><path d="M8 3v3M12 2v3M16 3v3"/></svg> },
  Painting:       { bg: '#EEF2FF', color: '#4F46E5', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="7" rx="2"/><path d="M12 10v5"/><path d="M9 15h6"/><path d="M9 15v6M15 15v6"/></svg> },
  'Makeup Artist':{ bg: '#FDF2F8', color: '#DB2777', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20V9l2-5 2 5v11H10z"/><path d="M8 20h8"/><path d="M10 13h4"/></svg> },
  'Hair Dresser':  { bg: '#F3E8FF', color: '#7E22CE', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7E22CE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="2"/><path d="M6 8v11M10 8v11M14 8v11M18 8v11"/><path d="M3 19h18"/></svg> },
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

function getRatingBreakdown(rating: number): number[] {
  if (rating >= 4.9) return [85, 10, 4, 1, 0]
  if (rating >= 4.8) return [78, 15, 5, 2, 0]
  if (rating >= 4.7) return [70, 20, 7, 2, 1]
  if (rating >= 4.5) return [60, 28, 8, 3, 1]
  return [50, 30, 12, 5, 3]
}

function getAvailability(hours: number): { label: string; color: string; bg: string; dot: string } {
  if (hours <= 1) return { label: 'Available now', color: '#15803D', bg: '#F0FDF4', dot: '#22C55E' }
  if (hours <= 2) return { label: 'Usually responds quickly', color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' }
  return { label: 'Responds within a few hours', color: '#92400E', bg: '#FFFBEB', dot: '#F59E0B' }
}

export default function TaskerProfileContent({
  tasker,
  reviews,
  isLoggedIn,
  currentUserId,
}: {
  tasker: Tasker
  reviews: Review[]
  isLoggedIn: boolean
  currentUserId: string | null
}) {
  const [showRequest, setShowRequest] = useState(false)
  const [message, setMessage] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [budget, setBudget] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [reqError, setReqError] = useState('')

  const initials = tasker.display_name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const avatarColor = AVATAR_COLORS[tasker.id.charCodeAt(tasker.id.length - 1) % AVATAR_COLORS.length]
  const breakdown = getRatingBreakdown(tasker.rating)
  const avail = getAvailability(tasker.response_hours)
  const totalReviews = reviews.length

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId) return
    setSending(true)
    setReqError('')

    const supabase = createClient()
    const { data: inserted, error } = await supabase.from('bookings').insert({
      poster_id: currentUserId,
      helper_id: tasker.id,
      message: message.trim(),
      scheduled_date: scheduledDate || null,
      budget: budget ? Number(budget) : null,
      status: 'pending',
    }).select('id').single()

    setSending(false)
    if (error) {
      setReqError(error.message)
    } else {
      setSent(true)
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new-booking',
          bookingId: inserted?.id,
          bookingData: { helper_id: tasker.id, poster_id: currentUserId },
        }),
      }).catch(() => {})
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center gap-2 text-sm text-gray-500">
          <Link href="/taskers" className="hover:text-blue-600 transition-colors">Find Helpers</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          <span className="font-semibold text-gray-800">{tasker.display_name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Hero card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                {tasker.avatar_url ? (
                  <img src={tasker.avatar_url} alt={tasker.display_name}
                    className="h-24 w-24 rounded-2xl object-cover shrink-0 shadow-md" />
                ) : (
                  <div className="h-24 w-24 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-2xl shadow-md"
                    style={{ background: avatarColor }}>
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-2xl font-extrabold text-gray-900">{tasker.display_name}</h1>
                    {tasker.verified && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-100">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="text-sm text-gray-500">{tasker.location}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Stars rating={tasker.rating} size={18} />
                    <span className="text-base font-extrabold text-gray-900">{tasker.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({totalReviews} reviews)</span>
                  </div>

                  {/* Quick stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      <span className="font-semibold">{tasker.tasks_done}</span> tasks done
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      Replies in &lt; {tasker.response_hours}h
                    </div>
                  </div>
                </div>

                {/* Price badge */}
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-extrabold text-gray-900">{tasker.hourly_rate}</p>
                  <p className="text-sm text-gray-400">NOK / hour</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-base font-extrabold text-gray-900 mb-4">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{tasker.bio}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-base font-extrabold text-gray-900 mb-4">Skills & Services</h2>
              <div className="flex flex-wrap gap-2">
                {tasker.categories.map(cat => {
                  const m = CAT_META[cat]
                  return (
                    <span key={cat}
                      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
                      style={{ background: m?.bg ?? '#EFF6FF', color: m?.color ?? '#2563EB', borderColor: m?.bg ?? '#EFF6FF' }}>
                      {m?.icon}
                      {cat}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-base font-extrabold text-gray-900 mb-6">Rating breakdown</h2>
              <div className="flex items-start gap-10">
                {/* Big score */}
                <div className="text-center shrink-0">
                  <p className="text-5xl font-extrabold text-gray-900">{tasker.rating.toFixed(1)}</p>
                  <Stars rating={tasker.rating} size={20} />
                  <p className="text-xs text-gray-400 mt-1">{totalReviews} reviews</p>
                </div>
                {/* Bars */}
                <div className="flex-1 space-y-2">
                  {breakdown.map((pct, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500 w-4 text-right">{5 - i}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#F59E0B,#FBBF24)' }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-extrabold text-gray-900">
                  Reviews <span className="text-gray-400 font-medium">({totalReviews})</span>
                </h2>
              </div>
              <div className="space-y-6">
                {reviews.map((review, i) => (
                  <div key={i} className={i < reviews.length - 1 ? 'pb-6 border-b border-gray-100' : ''}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{review.author}</p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      </div>
                      <Stars rating={review.rating} size={13} />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pl-12">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
          <div className="lg:w-80 shrink-0 space-y-4">

            {/* Availability card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: avail.dot }} />
                  <span className="relative inline-flex rounded-full h-3 w-3"
                    style={{ background: avail.dot }} />
                </span>
                <span className="text-sm font-bold" style={{ color: avail.color }}>{avail.label}</span>
              </div>
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: avail.bg, color: avail.color }}>
                Typically replies within {tasker.response_hours === 1 ? '1 hour' : `${tasker.response_hours} hours`}
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-extrabold text-gray-700 mb-4">Quick stats</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
                    label: 'Tasks completed', value: `${tasker.tasks_done}`,
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
                    label: 'Average rating', value: `${tasker.rating.toFixed(1)} / 5.0`,
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
                    label: 'Response time', value: `< ${tasker.response_hours}h`,
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                    label: 'Location', value: tasker.location,
                  },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {s.icon}
                      {s.label}
                    </div>
                    <span className="text-sm font-bold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-2xl font-extrabold text-gray-900">{tasker.hourly_rate} NOK</span>
                <span className="text-sm text-gray-400">per hour</span>
              </div>

              {currentUserId === tasker.id ? (
                <div className="rounded-xl bg-gray-50 border border-gray-200 py-3 text-center text-sm text-gray-500">
                  This is your profile
                </div>
              ) : isLoggedIn ? (
                <button
                  onClick={() => setShowRequest(true)}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  Send request
                </button>
              ) : (
                <Link
                  href={`/login?next=/taskers/${tasker.id}`}
                  className="block w-full rounded-xl py-3.5 text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  Log in to send request
                </Link>
              )}

              <p className="text-xs text-gray-400 text-center mt-3">Free to send — no payment needed yet</p>
            </div>

          </div>
        </div>
      </div>

      {/* ── SEND REQUEST MODAL ──────────────────────────────────────────────── */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

            {sent ? (
              <div className="text-center">
                <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Request sent!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {tasker.display_name} will reply within {tasker.response_hours === 1 ? '1 hour' : `${tasker.response_hours} hours`}.
                </p>
                <button
                  onClick={() => { setShowRequest(false); setSent(false); setMessage('') }}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold text-gray-900">Send request to {tasker.display_name}</h3>
                  <button onClick={() => setShowRequest(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSendRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">What do you need help with?</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={`Describe your task for ${tasker.display_name}...`}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">When?</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget (NOK)</label>
                      <input
                        type="number"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        placeholder={String(tasker.hourly_rate)}
                        min="0"
                        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  {reqError && (
                    <p className="text-xs text-red-500 rounded-lg bg-red-50 px-3 py-2">{reqError}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRequest(false)}
                      className="flex-1 rounded-xl py-3 text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                      {sending ? 'Sending...' : 'Send request'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
