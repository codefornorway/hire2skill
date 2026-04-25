'use client'

import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import { logClientEvent } from '@/lib/telemetry'
import { postNotify } from '@/lib/client-notify'
import { CATEGORY_BY_KEY, toCategoryKey } from '@/lib/categories'
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
  response_hours: number
  avatar_url?: string | null
  video_intro_url?: string | null
}

function isElite(t: Tasker) {
  return t.verified && t.rating >= 4.8 && (t.tasks_done ?? 0) >= 10
}

type Review = {
  author: string
  date: string
  rating: number
  text: string
}

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function getTaskerProfileUi(locale: 'no' | 'en' | 'da' | 'sv') {
  if (locale === 'en') {
    return {
      findHelpers: 'Find Helpers',
      eliteHelper: 'Elite Helper',
      verified: 'Verified',
      reviews: (count: number) => `${count} reviews`,
      tasksDone: (count: number) => `${count} tasks done`,
      repliesInHours: (hours: number) => `Replies in < ${hours}h`,
      nokPerHour: 'NOK / hour',
      about: 'About',
      videoIntro: 'Video intro',
      skillsServices: 'Skills & Services',
      ratingBreakdown: 'Rating breakdown',
      reviewsTitle: 'Reviews',
      availableNow: 'Available now',
      respondsQuickly: 'Usually responds quickly',
      respondsFewHours: 'Responds within a few hours',
      typicallyRepliesWithin: (hours: number) => `Typically replies within ${hours === 1 ? '1 hour' : `${hours} hours`}`,
      quickStats: 'Quick stats',
      statTasksCompleted: 'Tasks completed',
      statAverageRating: 'Average rating',
      statResponseTime: 'Response time',
      statLocation: 'Location',
      perHour: 'per hour',
      thisIsYourProfile: 'This is your profile',
      sendRequest: 'Send request',
      loginToSendRequest: 'Log in to send request',
      freeToSend: 'Free to send - no payment needed yet',
      requestSent: 'Request sent!',
      willReplyWithin: (name: string, hours: number) => `${name} will reply within ${hours === 1 ? '1 hour' : `${hours} hours`}.`,
      done: 'Done',
      sendRequestTo: (name: string) => `Send request to ${name}`,
      needHelpWith: 'What do you need help with?',
      describeTaskFor: (name: string) => `Describe your task for ${name}...`,
      when: 'When?',
      budgetNok: 'Budget (NOK)',
      cancel: 'Cancel',
      sending: 'Sending...',
      profileVideoTitle: (name: string) => `${name} intro video`,
    }
  }

  return {
    findHelpers: 'Finn hjelpere',
    eliteHelper: 'Elite hjelper',
    verified: 'Verifisert',
    reviews: (count: number) => `${count} anmeldelser`,
    tasksDone: (count: number) => `${count} oppdrag fullfort`,
    repliesInHours: (hours: number) => `Svarer pa < ${hours}t`,
    nokPerHour: 'NOK / time',
    about: 'Om',
    videoIntro: 'Videointroduksjon',
    skillsServices: 'Ferdigheter og tjenester',
    ratingBreakdown: 'Vurderingsfordeling',
    reviewsTitle: 'Anmeldelser',
    availableNow: 'Tilgjengelig na',
    respondsQuickly: 'Svarer vanligvis raskt',
    respondsFewHours: 'Svarer innen noen timer',
    typicallyRepliesWithin: (hours: number) => `Svarer vanligvis innen ${hours === 1 ? '1 time' : `${hours} timer`}`,
    quickStats: 'Hurtigstatistikk',
    statTasksCompleted: 'Fullforte oppdrag',
    statAverageRating: 'Gjennomsnittlig vurdering',
    statResponseTime: 'Responstid',
    statLocation: 'Sted',
    perHour: 'per time',
    thisIsYourProfile: 'Dette er din profil',
    sendRequest: 'Send foresporsel',
    loginToSendRequest: 'Logg inn for a sende foresporsel',
    freeToSend: 'Gratis a sende - ingen betaling trengs ennå',
    requestSent: 'Foresporsel sendt!',
    willReplyWithin: (name: string, hours: number) => `${name} svarer innen ${hours === 1 ? '1 time' : `${hours} timer`}.`,
    done: 'Ferdig',
    sendRequestTo: (name: string) => `Send foresporsel til ${name}`,
    needHelpWith: 'Hva trenger du hjelp med?',
    describeTaskFor: (name: string) => `Beskriv oppdraget ditt for ${name}...`,
    when: 'Nar?',
    budgetNok: 'Budsjett (NOK)',
    cancel: 'Avbryt',
    sending: 'Sender...',
    profileVideoTitle: (name: string) => `${name} introduksjonsvideo`,
  }
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
  const router = useRouter()
  const { t, locale } = useLanguage()
  const d = t.dashboard
  const ui = getTaskerProfileUi(locale)
  const [showRequest, setShowRequest] = useState(false)
  const [message, setMessage] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [budget, setBudget] = useState('')
  const [sent, setSent] = useState(false)
  const [demoRequestSimulated, setDemoRequestSimulated] = useState(false)
  const [sending, setSending] = useState(false)
  const [reqError, setReqError] = useState('')
  const [notifyWarn, setNotifyWarn] = useState<string | null>(null)

  const initials = tasker.display_name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const avatarColor = AVATAR_COLORS[tasker.id.charCodeAt(tasker.id.length - 1) % AVATAR_COLORS.length]
  const breakdown = getRatingBreakdown(tasker.rating)
  const availBase = getAvailability(tasker.response_hours)
  const avail = {
    ...availBase,
    label:
      tasker.response_hours <= 1
        ? ui.availableNow
        : tasker.response_hours <= 2
          ? ui.respondsQuickly
          : ui.respondsFewHours,
  }
  const totalReviews = reviews.length

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?next=/taskers/${tasker.id}`)
      return
    }

    setSending(true)
    setReqError('')
    setDemoRequestSimulated(false)

    // Demo helpers use synthetic ids (e.g. "s7"), so we skip DB booking writes.
    if (!isUuid(tasker.id)) {
      setSending(false)
      setSent(true)
      setDemoRequestSimulated(true)
      setNotifyWarn(null)
      return
    }

    const { data: inserted, error } = await supabase.from('bookings').insert({
      poster_id: user.id,
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
      setDemoRequestSimulated(false)
      setNotifyWarn(null)
      const notify = await postNotify({
        type: 'new-booking',
        bookingId: inserted?.id,
        bookingData: { helper_id: tasker.id, poster_id: user.id },
      })
      if (!notify.ok) {
        setNotifyWarn(d.notifyEmailWarn)
        logClientEvent('tasker.request.notify', 'warn', 'New booking notify request failed', {
          taskerId: tasker.id,
          reason: notify.reason,
          status: notify.status,
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center gap-2 text-sm text-gray-500">
          <Link href="/taskers" className="hover:text-blue-600 transition-colors">{ui.findHelpers}</Link>
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
                  <Image src={tasker.avatar_url} alt={tasker.display_name}
                    width={96} height={96}
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
                    {isElite(tasker) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border"
                        style={{ background: 'linear-gradient(135deg,#fef9c3,#fde68a)', color: '#92400e', borderColor: '#fcd34d' }}>
                        ★ {ui.eliteHelper}
                      </span>
                    )}
                    {tasker.verified && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-100">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {ui.verified}
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
                    <span className="text-sm text-gray-400">({ui.reviews(totalReviews)})</span>
                  </div>

                  {/* Quick stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      {ui.tasksDone(tasker.tasks_done)}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {ui.repliesInHours(tasker.response_hours)}
                    </div>
                  </div>
                </div>

                {/* Price badge */}
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-extrabold text-gray-900">{tasker.hourly_rate}</p>
                  <p className="text-sm text-gray-400">{ui.nokPerHour}</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-base font-extrabold text-gray-900 mb-4">{ui.about}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{tasker.bio}</p>
            </div>

            {/* Video intro */}
            {tasker.video_intro_url && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <h2 className="text-base font-extrabold text-gray-900">{ui.videoIntro}</h2>
                </div>
                <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={tasker.video_intro_url.includes('youtube.com/watch?v=')
                      ? tasker.video_intro_url.replace('watch?v=', 'embed/')
                      : tasker.video_intro_url.includes('youtu.be/')
                      ? tasker.video_intro_url.replace('youtu.be/', 'youtube.com/embed/')
                      : tasker.video_intro_url}
                    title={ui.profileVideoTitle(tasker.display_name)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-base font-extrabold text-gray-900 mb-4">{ui.skillsServices}</h2>
              <div className="flex flex-wrap gap-2">
                {tasker.categories.map(cat => {
                  const meta = CATEGORY_BY_KEY[toCategoryKey(cat)]
                  return (
                    <span key={cat}
                      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
                      style={{ background: meta?.bg ?? '#EFF6FF', color: meta?.color ?? '#2563EB', borderColor: meta?.bg ?? '#EFF6FF' }}>
                      {meta ? <meta.Icon {...categoryIconProps(14, meta.color)} /> : null}
                      {cat}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-base font-extrabold text-gray-900 mb-6">{ui.ratingBreakdown}</h2>
              <div className="flex items-start gap-10">
                {/* Big score */}
                <div className="text-center shrink-0">
                  <p className="text-5xl font-extrabold text-gray-900">{tasker.rating.toFixed(1)}</p>
                  <Stars rating={tasker.rating} size={20} />
                  <p className="text-xs text-gray-400 mt-1">{ui.reviews(totalReviews)}</p>
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
                  {ui.reviewsTitle} <span className="text-gray-400 font-medium">({totalReviews})</span>
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
                {ui.typicallyRepliesWithin(tasker.response_hours)}
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-extrabold text-gray-700 mb-4">{ui.quickStats}</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
                    label: ui.statTasksCompleted, value: `${tasker.tasks_done}`,
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
                    label: ui.statAverageRating, value: `${tasker.rating.toFixed(1)} / 5.0`,
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
                    label: ui.statResponseTime, value: `< ${tasker.response_hours}h`,
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                    label: ui.statLocation, value: tasker.location,
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
                <span className="text-sm text-gray-400">{ui.perHour}</span>
              </div>

              {currentUserId === tasker.id ? (
                <div className="rounded-xl bg-gray-50 border border-gray-200 py-3 text-center text-sm text-gray-500">
                  {ui.thisIsYourProfile}
                </div>
              ) : isLoggedIn ? (
                <button
                  onClick={() => setShowRequest(true)}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--sl-gradient-primary)' }}>
                  {ui.sendRequest}
                </button>
              ) : (
                <Link
                  href={`/login?next=/taskers/${tasker.id}`}
                  className="block w-full rounded-xl py-3.5 text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
                  style={{ background: 'var(--sl-gradient-primary)' }}>
                  {ui.loginToSendRequest}
                </Link>
              )}

              <p className="text-xs text-gray-400 text-center mt-3">{ui.freeToSend}</p>
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
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{ui.requestSent}</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {ui.willReplyWithin(tasker.display_name, tasker.response_hours)}
                </p>
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-left mb-4">
                  <p className="text-xs font-bold text-blue-900 mb-1">{d.bookingNextTitle}</p>
                  <ol className="text-[11px] text-blue-900/80 space-y-1 list-decimal list-inside">
                    <li>{d.bookingNext1}</li>
                    <li>{d.bookingNext2}</li>
                    <li>{d.bookingNext3}</li>
                  </ol>
                </div>
                {notifyWarn && (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                    {notifyWarn}
                  </p>
                )}
                {demoRequestSimulated && (
                  <p className="text-xs text-blue-900 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-4">
                    {d.demoRequestSimulated}
                  </p>
                )}
                <button
                  onClick={() => { setShowRequest(false); setSent(false); setMessage(''); setNotifyWarn(null); setDemoRequestSimulated(false) }}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--sl-gradient-primary)' }}>
                  {ui.done}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold text-gray-900">{ui.sendRequestTo(tasker.display_name)}</h3>
                  <button onClick={() => setShowRequest(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSendRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{ui.needHelpWith}</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={ui.describeTaskFor(tasker.display_name)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{ui.when}</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{ui.budgetNok}</label>
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
                      {ui.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'var(--sl-gradient-primary)' }}>
                      {sending ? ui.sending : ui.sendRequest}
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
