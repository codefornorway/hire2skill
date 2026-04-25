'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { logClientEvent } from '@/lib/telemetry'
import { postNotify } from '@/lib/client-notify'
import { formatDateByLocale } from '@/lib/i18n/date'
import type { BookingItem, Post } from './page'

type Props = {
  email: string
  postCount: number
  recentPosts: Post[]
  posted: boolean
  requestSent: boolean
  role: 'helper' | 'poster' | null
  bookings: BookingItem[]
  pendingCount: number
  currentUserId: string
}

const STATUS_META: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#FFFBEB', color: '#92400E' },
  accepted:  { bg: '#F0FDF4', color: '#15803D' },
  declined:  { bg: '#FEF2F2', color: '#DC2626' },
  completed: { bg: '#EFF6FF', color: '#1D4ED8' },
  cancelled: { bg: '#F9FAFB', color: '#6B7280' },
}

const POST_STATUS_META: Record<string, { bg: string; color: string }> = {
  open:      { bg: '#F0FDF4', color: '#15803D' },
  closed:    { bg: '#F9FAFB', color: '#6B7280' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626' },
}

type FilterOption = 'all' | 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'
const ALL_FILTERS: FilterOption[] = ['all', 'pending', 'accepted', 'declined', 'completed', 'cancelled']

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function Avatar({ name, avatarUrl, size = 10 }: { name: string | null; avatarUrl: string | null; size?: number }) {
  const initials = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const colors = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']
  const bg = colors[(name ?? '').charCodeAt(0) % colors.length]
  const cls = `h-${size} w-${size} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`
  const px = size * 4
  if (avatarUrl) return <Image src={avatarUrl} alt={name ?? ''} width={px} height={px} className={`${cls} object-cover`} />
  return <div className={cls} style={{ background: bg }}>{initials}</div>
}

function FilterChips({
  bookings,
  active,
  onChange,
}: {
  bookings: BookingItem[]
  active: FilterOption
  onChange: (f: FilterOption) => void
}) {
  const { t } = useLanguage()
  const d = t.dashboard
  const chips = ALL_FILTERS
    .map(f => ({
      key: f,
      label:
        f === 'all' ? d.filterAll :
          f === 'pending' ? d.statusPending :
            f === 'accepted' ? d.statusAccepted :
              f === 'declined' ? d.statusDeclined :
                f === 'completed' ? d.statusCompleted :
                  d.statusCancelled,
      count: f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length,
    }))
    .filter(c => c.count > 0 || c.key === 'all')

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {chips.map(c => (
        <button key={c.key} onClick={() => onChange(c.key)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            active === c.key
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
          }`}>
          {c.label} <span className={active === c.key ? 'opacity-75' : 'opacity-60'}>({c.count})</span>
        </button>
      ))}
    </div>
  )
}

function ReviewModal({
  booking,
  currentUserId,
  isHelper,
  onClose,
  onDone,
}: {
  booking: BookingItem
  currentUserId: string
  isHelper: boolean
  onClose: () => void
  onDone: (bookingId: string) => void
}) {
  const { t } = useLanguage()
  const c = t.chatPage
  const d = t.dashboard
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return
    setSubmitting(true)
    setError('')
    const revieweeId = isHelper ? booking.poster_id : booking.helper_id
    const supabase = createClient()
    const { error: err } = await supabase.from('reviews').insert({
      booking_id: booking.id,
      reviewer_id: currentUserId,
      reviewee_id: revieweeId,
      rating,
      body: body.trim() || null,
    })
    setSubmitting(false)
    if (err) {
      setError(err.message)
    } else {
      setDone(true)
    }
  }

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {done ? (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#FFFBEB,#FDE68A)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#F59E0B">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{d.reviewSubmittedTitle}</h3>
            <p className="text-sm text-gray-500 mb-6">{d.reviewSubmittedBody}</p>
            <button onClick={() => { onDone(booking.id); onClose() }}
              className="w-full rounded-xl py-3 text-sm font-bold text-white hover:opacity-90"
              style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900">{d.reviewLeaveTitle}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              {d.reviewQuestion(booking.other_display_name ?? c.unknownUser)}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-1 justify-center py-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button"
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(s)}>
                    <svg width="40" height="40" viewBox="0 0 24 24"
                      fill={(hover || rating) >= s ? '#F59E0B' : '#E5E7EB'}
                      className="transition-colors duration-100">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                ))}
              </div>
              {(hover || rating) > 0 && (
                <p className="text-center text-sm font-semibold text-amber-500 -mt-1">
                  {LABELS[hover || rating]}
                </p>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {d.reviewWritten} <span className="font-normal text-gray-400">{d.optional}</span>
                </label>
                <textarea
                  rows={3}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={d.reviewPlaceholder}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 rounded-xl py-3 text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
                  {d.actionCancel}
                </button>
                <button type="submit" disabled={rating === 0 || submitting}
                  className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(90deg,#F59E0B,#FBBF24)' }}>
                  {submitting ? d.actionSubmitting : d.actionSubmitReview}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function PhotoUploadButton({ bookingId }: { bookingId: string }) {
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState<{ url: string; label: string }[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [type, setType] = useState<'before' | 'after'>('after')
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const path = `${user.id}/${bookingId}/${type}-${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('task-photos').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('task-photos').getPublicUrl(data.path)
      setPhotos(prev => [...prev, { url: urlData.publicUrl, label: type }])
    }
    setUploading(false)
    setShowPicker(false)
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />

      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              <Image src={p.url} alt={p.label} width={64} height={64} className="h-16 w-16 rounded-xl object-cover border border-gray-200" />
              <span className="absolute bottom-0.5 left-0.5 rounded text-[9px] font-bold px-1 py-0.5 capitalize"
                style={{ background: p.label === 'before' ? '#FFF7ED' : '#F0FDF4', color: p.label === 'before' ? '#EA580C' : '#16A34A' }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {showPicker ? (
        <div className="flex gap-2">
          {(['before', 'after'] as const).map(t => (
            <button key={t} type="button"
              onClick={() => { setType(t); inputRef.current?.click() }}
              disabled={uploading}
              className="flex-1 rounded-xl py-2 text-xs font-bold border capitalize transition-colors disabled:opacity-50"
              style={type === t
                ? { background: t === 'before' ? '#FFF7ED' : '#F0FDF4', borderColor: t === 'before' ? '#FED7AA' : '#BBF7D0', color: t === 'before' ? '#EA580C' : '#16A34A' }
                : { background: '#F9FAFB', borderColor: '#E5E7EB', color: '#6B7280' }}>
              {uploading && type === t ? 'Uploading…' : `+ ${t} photo`}
            </button>
          ))}
          <button type="button" onClick={() => setShowPicker(false)}
            className="rounded-xl px-3 py-2 text-xs text-gray-400 hover:text-gray-600 border border-gray-200">
            ✕
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowPicker(true)}
          className="w-full rounded-xl py-2 text-xs font-semibold border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Add before/after photos
        </button>
      )}
    </div>
  )
}

function RescheduleModal({
  booking,
  onClose,
  onDone,
}: {
  booking: BookingItem
  onClose: () => void
  onDone: (bookingId: string, newDate: string) => void
}) {
  const { t } = useLanguage()
  const c = t.chatPage
  const d = t.dashboard
  const [date, setDate] = useState(booking.scheduled_date?.split('T')[0] ?? '')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!date) { setError('Please select a new date.'); return }
    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('bookings')
      .update({ scheduled_date: date })
      .eq('id', booking.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    onDone(booking.id, date)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold text-gray-900">{d.rescheduleTitle}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          {d.rescheduleWith(booking.other_display_name ?? c.unknownUser)}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{d.newDate} <span className="text-red-500">*</span></label>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); setError('') }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{d.note} <span className="text-gray-400 font-normal text-xs">{d.optional}</span></label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder={d.notePlaceholder}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl py-3 text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
              {d.actionCancel}
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
              {saving ? d.actionSaving : d.actionConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookingCard({
  booking,
  isHelper,
  onUpdate,
  onReview,
  onReschedule,
  distanceKm,
  userCoords,
}: {
  booking: BookingItem
  isHelper: boolean
  onUpdate: (id: string, status: string) => void
  onReview: (booking: BookingItem) => void
  onReschedule: (booking: BookingItem) => void
  distanceKm?: number
  userCoords?: { lat: number; lon: number } | null
}) {
  const { t, locale } = useLanguage()
  const d = t.dashboard
  const c = t.chatPage
  const [updating, setUpdating] = useState(false)
  const [notifyWarn, setNotifyWarn] = useState<string | null>(null)
  const meta = STATUS_META[booking.status] ?? STATUS_META.pending
  const statusLabel =
    booking.status === 'pending' ? d.statusPending :
      booking.status === 'accepted' ? d.statusAccepted :
        booking.status === 'declined' ? d.statusDeclined :
          booking.status === 'completed' ? d.statusCompleted :
            d.statusCancelled

  async function updateStatus(status: string) {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('bookings').update({ status }).eq('id', booking.id)
    setUpdating(false)
    onUpdate(booking.id, status)
    if (status === 'accepted') {
      const notify = await postNotify({
        type: 'booking-accepted',
        bookingData: { id: booking.id, poster_id: booking.poster_id, helper_id: booking.helper_id },
      })
      if (!notify.ok) {
        setNotifyWarn(d.notifyEmailWarn)
        logClientEvent('dashboard.notify', 'warn', 'Booking accepted notify request failed', {
          bookingId: booking.id,
          reason: notify.reason,
          status: notify.status,
        })
      } else {
        setNotifyWarn(null)
      }
    }
  }

  function openDirections() {
    if (!booking.post_location || typeof window === 'undefined') return
    const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
    const prefersAppleMaps = /iPhone|iPad|iPod|Macintosh/i.test(ua)
    const href = prefersAppleMaps
      ? `https://maps.apple.com/?daddr=${encodeURIComponent(booking.post_location)}${
        userCoords ? `&saddr=${encodeURIComponent(`${userCoords.lat},${userCoords.lon}`)}` : ''
      }&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.post_location)}${
        userCoords
          ? `&origin=${encodeURIComponent(`${userCoords.lat},${userCoords.lon}`)}&travelmode=driving`
          : ''
      }`
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
      {notifyWarn && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          {notifyWarn}
        </p>
      )}
      <div className="flex items-start gap-3">
        <Avatar name={booking.other_display_name} avatarUrl={booking.other_avatar_url} size={10} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900 truncate">
              {isHelper ? `${d.from} ` : `${d.to} `}
              <span className="text-blue-600">{booking.other_display_name ?? c.unknownUser}</span>
            </p>
            <span className="text-xs text-gray-400 shrink-0">{timeAgo(booking.created_at)}</span>
          </div>
          <span className="inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: meta.bg, color: meta.color }}>
            {statusLabel}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 italic">&ldquo;{booking.message}&rdquo;</p>
      {(booking.post_title || booking.post_category || booking.post_location) && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
          {booking.post_title && (
            <p className="text-xs font-semibold text-gray-700 truncate">{booking.post_title}</p>
          )}
          {(booking.post_category || booking.post_location) && (
            <p className="text-[11px] text-gray-500 mt-0.5">
              {[booking.post_location, booking.post_category].filter(Boolean).join(' · ')}
            </p>
          )}
          {booking.post_location && (
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <button
                type="button"
                onClick={openDirections}
                className="inline-flex text-[11px] font-semibold text-blue-600 hover:underline"
              >
                {d.actionDirections}
              </button>
              {typeof distanceKm === 'number' && Number.isFinite(distanceKm) && (
                <span className="text-[11px] text-gray-500">
                  {d.distanceKmAway(new Intl.NumberFormat(
                    locale === 'no' ? 'nb-NO' : locale === 'da' ? 'da-DK' : locale === 'sv' ? 'sv-SE' : 'en-GB',
                    { maximumFractionDigits: 1 },
                  ).format(distanceKm))}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {(booking.scheduled_date || booking.budget) && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {booking.scheduled_date && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formatDateByLocale(booking.scheduled_date, locale, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {booking.budget && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4H14"/></svg>
              {booking.budget.toLocaleString()} NOK
            </span>
          )}
        </div>
      )}

      {/* Pending: helper accepts/declines */}
      {booking.status === 'pending' && isHelper && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Link href={`/chat/${booking.id}`}
            className="rounded-xl py-2 text-sm font-bold border-2 border-blue-200 text-blue-700 text-center hover:bg-blue-50 transition-colors">
            {d.actionMessage}
          </Link>
          <button onClick={() => updateStatus('declined')} disabled={updating}
            className="rounded-xl py-2 text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50">
            {d.actionDecline}
          </button>
          <button onClick={() => updateStatus('accepted')} disabled={updating}
            className="rounded-xl py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,#16A34A,#22C55E)' }}>
            {updating ? d.actionSaving : d.actionAccept}
          </button>
        </div>
      )}

      {/* Pending: poster cancels */}
      {booking.status === 'pending' && !isHelper && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link href={`/chat/${booking.id}`}
            className="rounded-xl py-2 text-sm font-bold border-2 border-blue-200 text-blue-700 text-center hover:bg-blue-50 transition-colors">
            {d.actionMessage}
          </Link>
          <button onClick={() => updateStatus('cancelled')} disabled={updating}
            className="rounded-xl py-2 text-sm font-bold border-2 border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50">
            {updating ? d.actionCancelling : d.actionCancelRequest}
          </button>
        </div>
      )}

      {/* Accepted: message + reschedule + complete */}
      {booking.status === 'accepted' && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
            <p className="text-xs font-bold text-blue-900 mb-1">{d.bookingNextTitle}</p>
            <ol className="text-[11px] text-blue-900/80 space-y-1 list-decimal list-inside">
              <li>{d.bookingNext1}</li>
              <li>{d.bookingNext2}</li>
              <li>{d.bookingNext3}</li>
            </ol>
          </div>
          <div className="flex gap-2">
            {!isHelper && (
              <Link href="/chat"
                className="flex-1 rounded-xl py-2 text-sm font-bold text-white text-center hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                {d.messageWithName(booking.other_display_name?.split(' ')[0] ?? d.helperFallback)}
              </Link>
            )}
            <button onClick={() => updateStatus('completed')} disabled={updating}
              className="flex-1 rounded-xl py-2 text-sm font-bold border-2 border-green-300 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50">
              {updating ? d.actionSaving : d.actionMarkComplete}
            </button>
          </div>
          <button onClick={() => onReschedule(booking)}
            className="w-full rounded-xl py-2 text-sm font-semibold border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {d.actionReschedule}
          </button>
        </div>
      )}

      {/* Completed: photos + review */}
      {booking.status === 'completed' && (
        <div className="flex flex-col gap-2">
          {!booking.has_review && (
            <button onClick={() => onReview(booking)}
              className="w-full rounded-xl py-2 text-sm font-bold border-2 border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors">
              {d.reviewCta}
            </button>
          )}
          {booking.has_review && (
            <p className="text-center text-xs text-gray-400 py-1">{d.reviewSubmittedShort}</p>
          )}
          <PhotoUploadButton bookingId={booking.id} />
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, heading, sub, cta }: {
  icon: React.ReactNode
  heading: string
  sub: string
  cta?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{heading}</p>
      <p className="text-sm text-gray-400 mb-4">{sub}</p>
      {cta}
    </div>
  )
}

const ClipboardIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
  </svg>
)

export default function DashboardContent({ email, postCount, recentPosts, posted, requestSent, role, bookings: initialBookings, currentUserId }: Props) {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const d = t.dashboard
  const firstName = email.split('@')[0]
  const isHelper = role === 'helper'

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview')
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings)
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all')
  const [reviewTarget, setReviewTarget] = useState<BookingItem | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingItem | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [distanceByLocation, setDistanceByLocation] = useState<Record<string, number>>({})

  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  function handleTabChange(tab: 'overview' | 'tasks') {
    setActiveTab(tab)
    setActiveFilter('all')
  }

  function handleBookingUpdate(id: string, status: string) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  function handleReviewDone(bookingId: string) {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, has_review: true } : b))
  }

  function handleRescheduleDone(bookingId: string, newDate: string) {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, scheduled_date: newDate } : b))
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  // For helpers: show pending badge (need to action). For posters: show accepted badge (helper said yes!).
  const notifCount = isHelper ? pendingCount : bookings.filter(b => b.status === 'accepted').length

  const filteredBookings = activeFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === activeFilter)

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 120000 },
    )
  }, [])

  useEffect(() => {
    if (!userCoords) return
    const origin = userCoords
    const locations = [...new Set(
      bookings
        .map(b => b.post_location?.trim())
        .filter((v): v is string => Boolean(v)),
    )]
    const missing = locations.filter(loc => distanceByLocation[loc] == null)
    if (missing.length === 0) return

    let cancelled = false
    const controller = new AbortController()

    async function loadDistances() {
      const updates: Record<string, number> = {}
      for (const loc of missing) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=no&limit=1&q=${encodeURIComponent(loc)}`,
            { signal: controller.signal },
          )
          if (!res.ok) continue
          const data = (await res.json()) as Array<{ lat?: string; lon?: string }>
          const first = data[0]
          if (!first?.lat || !first?.lon) continue
          const km = haversineKm(origin, { lat: Number(first.lat), lon: Number(first.lon) })
          if (Number.isFinite(km)) updates[loc] = km
        } catch {
          // Ignore geocoder/network failures per location.
        }
      }
      if (!cancelled && Object.keys(updates).length > 0) {
        setDistanceByLocation(prev => ({ ...prev, ...updates }))
      }
    }

    void loadDistances()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [bookings, distanceByLocation, userCoords])

  // Keep helper/poster request lists fresh without manual reload.
  useEffect(() => {
    if (!role || !currentUserId) return
    const supabase = createClient()
    const filter = role === 'helper'
      ? `helper_id=eq.${currentUserId}`
      : `poster_id=eq.${currentUserId}`
    const channel = supabase
      .channel(`dashboard-bookings-${role}-${currentUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter },
        () => {
          router.refresh()
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [currentUserId, role, router])

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 w-full">
      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          currentUserId={currentUserId}
          isHelper={isHelper}
          onClose={() => setReviewTarget(null)}
          onDone={handleReviewDone}
        />
      )}
      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onDone={handleRescheduleDone}
        />
      )}
      {posted && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {t.dashboard.posted}
        </div>
      )}
      {requestSent && (
        <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {t.dashboard.requestSent}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.welcome}, {firstName}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.dashboard.subtitle}</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-8 border-b border-gray-200">
        {([
          { key: 'overview' as const, label: t.dashboard.tabOverview },
          { key: 'tasks' as const, label: isHelper ? t.dashboard.tabRequests : t.dashboard.tabMyTasks },
        ]).map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
            {tab.key === 'tasks' && notifCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-600 w-5 h-5 text-[11px] font-bold text-white shrink-0">
                {notifCount}
              </span>
            )}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: t.dashboard.stats.posts, value: postCount },
              { label: isHelper ? t.dashboard.requestsReceived : t.dashboard.requestsSent, value: bookings.length },
              { label: t.dashboard.stats.messages, value: 0 },
              { label: t.dashboard.stats.views, value: 0 },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl bg-white border border-gray-200 p-5">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              {t.dashboard.quickActions}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/post"
                className="flex items-center gap-4 rounded-xl p-5 text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.dashboard.postJob}</p>
                  <p className="text-xs text-blue-100">{t.dashboard.postJobSub}</p>
                </div>
              </Link>
              <Link href="/chat" className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.nav.messages}</p>
                  <p className="text-xs text-gray-400">{t.dashboard.chatSub}</p>
                </div>
              </Link>
              <Link href="/profile" className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.nav.profile}</p>
                  <p className="text-xs text-gray-400">{t.dashboard.profileSub}</p>
                </div>
              </Link>
              <Link href="/referral" className="flex items-center gap-4 rounded-xl bg-white border border-amber-200 p-5 hover:border-amber-400 hover:bg-amber-50 transition-colors">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFFBEB' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{d.inviteFriends}</p>
                  <p className="text-xs text-amber-600 font-medium">{t.dashboard.referralEarn}</p>
                </div>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {t.dashboard.recentPosts}
              </h2>
              <Link href="/post" className="text-xs text-blue-600 hover:underline">{t.dashboard.newPost}</Link>
            </div>
            {recentPosts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.location} · {post.category}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDateByLocale(post.created_at, locale, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="text-sm text-gray-400 mb-3">{t.dashboard.noPosts}</p>
                <Link href="/post"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  {t.dashboard.createFirst}
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── HELPER: REQUESTS TAB ── */}
      {activeTab === 'tasks' && isHelper && (
        <div>
          {bookings.length === 0 ? (
            <EmptyState
              icon={ClipboardIcon}
              heading={t.dashboard.noRequestsYet}
              sub={t.dashboard.noRequestsYetHint}
            />
          ) : (
            <>
              <FilterChips bookings={bookings} active={activeFilter} onChange={setActiveFilter} />
              {filteredBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                  {d.noFilteredRequests(activeFilter)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBookings.map(b => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      isHelper={true}
                      onUpdate={handleBookingUpdate}
                      onReview={setReviewTarget}
                      onReschedule={setRescheduleTarget}
                      distanceKm={b.post_location ? distanceByLocation[b.post_location] : undefined}
                      userCoords={userCoords}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── POSTER: MY TASKS TAB ── */}
      {activeTab === 'tasks' && !isHelper && (
        <div className="flex flex-col gap-10">

          {/* Section 1: Posted tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {t.dashboard.postedTasksCount(recentPosts.length)}
              </h2>
              <Link href="/post" className="text-xs font-semibold text-blue-600 hover:underline">
                {t.dashboard.newTask}
              </Link>
            </div>

            {recentPosts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentPosts.map(post => {
                  const pm = POST_STATUS_META[post.status] ?? POST_STATUS_META.open
                  const postStatusLabel =
                    post.status === 'open' ? d.statusOpen :
                      post.status === 'closed' ? d.statusClosed :
                        d.statusCancelled
                  return (
                    <div key={post.id}
                      className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-5 py-4 hover:border-blue-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{post.location} · {post.category}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="hidden sm:inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: pm.bg, color: pm.color }}>
                          {postStatusLabel}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateByLocale(post.created_at, locale, { day: 'numeric', month: 'short' })}
                        </span>
                        <Link
                          href={`/taskers?category=${encodeURIComponent(post.category)}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap hover:opacity-90 transition-opacity"
                          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                          {d.findHelper}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardIcon}
                heading={t.dashboard.noTasksPostedYet}
                sub={t.dashboard.noTasksPostedYetHint}
                cta={
                  <Link href="/post"
                    className="inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                    {t.dashboard.postFirstTask}
                  </Link>
                }
              />
            )}
          </section>

          {/* Section 2: Helpers contacted */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              {t.dashboard.helpersContactedCount(bookings.length)}
            </h2>

            {bookings.length === 0 ? (
              <EmptyState
                icon={ClipboardIcon}
                heading={t.dashboard.noHelpersContactedYet}
                sub={t.dashboard.noHelpersContactedYetHint}
                cta={
                  <Link href="/taskers"
                    className="inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                    {t.dashboard.browseHelpers}
                  </Link>
                }
              />
            ) : (
              <>
                <FilterChips bookings={bookings} active={activeFilter} onChange={setActiveFilter} />
                {filteredBookings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                    {t.dashboard.noFilteredRequests(activeFilter)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredBookings.map(b => (
                      <BookingCard
                        key={b.id}
                        booking={b}
                        isHelper={false}
                        onUpdate={handleBookingUpdate}
                        onReview={setReviewTarget}
                        onReschedule={setRescheduleTarget}
                        distanceKm={b.post_location ? distanceByLocation[b.post_location] : undefined}
                        userCoords={userCoords}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
