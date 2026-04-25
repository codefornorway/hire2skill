'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FEATURES } from '@/lib/features'
import { useLanguage } from '@/context/LanguageContext'
import { formatDateByLocale } from '@/lib/i18n/date'

// ── Types ─────────────────────────────────────────────────────────────────────

type UserInfo = { id: string; email: string; created_at: string }

type Profile = {
  id: string
  role: string | null
  display_name: string | null
  bio: string | null
  hourly_rate: number | null
  categories: string[] | null
  location: string | null
  verified: boolean
  verification_status: string | null
  verification_note: string | null
  tasks_done: number
  rating: number
  avatar_url: string | null
  phone: string | null
  notifications: Record<string, boolean> | null
  business_name: string | null
  business_website: string | null
  business_description: string | null
  video_intro_url: string | null
  languages: string[] | null
  brings_tools: boolean | null
  can_invoice: boolean | null
}

type Post = {
  id: string
  title: string
  category: string
  status: string
  created_at: string
}

type Review = {
  id: string
  rating: number
  text: string
  created_at: string
  reviewer_name: string | null
  reviewer_avatar: string | null
}

type RoleType = 'poster' | 'helper'

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',       label: 'Profile' },
  { key: 'verification',  label: 'Verification' },
  { key: 'password',      label: 'Password' },
  { key: 'security',      label: 'Account Security' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'billing',       label: 'Billing Info' },
  { key: 'cancel',        label: 'Cancel a Task' },
  { key: 'business',      label: 'Business Information' },
  { key: 'balance',       label: 'Account Balance' },
  { key: 'transactions',  label: 'Transactions' },
  { key: 'delete',        label: 'Delete Account' },
]

const SERVICE_CATEGORIES = [
  'Cleaning','Moving','Tutoring','Delivery','Handyman','Events',
  'IT & Tech','Gardening','Pet Care','Cooking','Shopping','Knitting',
  'Sewing','Kids Care','Car Wash','Painting','Makeup Artist','Hair Dresser',
  'Snow Removal','Dog Walking','Furniture Assembly','Window Cleaning',
  'Photography','Personal Training','Elder Care','Music Lessons',
]

const AVATAR_COLORS = ['#2563EB','#16A34A','#7C3AED','#D97706','#E11D48','#0284C7']

const NORWAY_LOCATIONS = [
  'Oslo – Sentrum','Oslo – Grünerløkka','Oslo – Grønland','Oslo – Tøyen',
  'Oslo – Gamlebyen','Oslo – Sørenga','Oslo – Tjuvholmen','Oslo – Aker Brygge',
  'Oslo – Bislett','Oslo – St. Hanshaugen',
  'Oslo – Frogner','Oslo – Majorstuen','Oslo – Skøyen','Oslo – Lysaker',
  'Oslo – Bygdøy','Oslo – Ullern','Oslo – Montebello','Oslo – Smestad',
  'Oslo – Røa','Oslo – Vinderen','Oslo – Hovseter','Oslo – Holmenkollen',
  'Oslo – Sagene','Oslo – Sandaker','Oslo – Storo','Oslo – Nydalen',
  'Oslo – Sinsen','Oslo – Grefsen','Oslo – Kjelsås','Oslo – Tåsen',
  'Oslo – Alna','Oslo – Furuset','Oslo – Lindeberg','Oslo – Trosterud',
  'Oslo – Ellingsrudåsen','Oslo – Haugerud','Oslo – Teisen','Oslo – Rødtvet',
  'Oslo – Grorud','Oslo – Ammerud','Oslo – Romsås','Oslo – Kalbakken',
  'Oslo – Stovner','Oslo – Haugenstua','Oslo – Vestli','Oslo – Karihaugen',
  'Oslo – Bjerke','Oslo – Veitvet','Oslo – Carl Berner','Oslo – Helsfyr',
  'Oslo – Valle Hovin','Oslo – Nordstrand','Oslo – Ljan','Oslo – Ekeberg',
  'Oslo – Lambertseter','Oslo – Manglerud','Oslo – Ryen','Oslo – Bryn',
  'Oslo – Oppsal','Oslo – Bøler','Oslo – Holmlia','Oslo – Mortensrud',
  'Oslo – Bjørndal','Oslo – Prinsdal',
  'Bergen – Sentrum','Bergen – Sandviken','Bergen – Nordnes','Bergen – Møhlenpris',
  'Bergen – Fana','Bergen – Nesttun','Bergen – Paradis','Bergen – Rådal',
  'Bergen – Ytrebygda','Bergen – Fyllingsdalen','Bergen – Laksevåg',
  'Bergen – Loddefjord','Bergen – Åsane','Bergen – Arna','Bergen – Indre Arna',
  'Trondheim – Midtbyen','Trondheim – Møllenberg','Trondheim – Strindheim',
  'Trondheim – Ranheim','Trondheim – Lerkendal','Trondheim – Singsaker',
  'Trondheim – Nardo','Trondheim – Heimdal','Trondheim – Saupstad',
  'Stavanger – Sentrum','Stavanger – Storhaug','Stavanger – Hillevåg',
  'Stavanger – Hundvåg','Stavanger – Madla','Stavanger – Tasta','Stavanger – Eiganes',
  'Drammen – Bragernes','Drammen – Strømsø','Drammen – Konnerud',
  'Bærum','Asker','Jessheim','Lillestrøm','Lørenskog','Ski','Oppegård',
  'Kristiansand','Tromsø','Sandnes','Fredrikstad','Sarpsborg','Bodø',
  'Ålesund','Tønsberg','Moss','Hamar','Porsgrunn','Skien','Arendal',
  'Haugesund','Larvik','Halden','Lillehammer','Molde','Harstad','Gjøvik',
  'Alta','Hammerfest','Narvik','Tromsø','Mo i Rana',
]

const DEFAULT_NOTIF: Record<string, boolean> = {
  task_email: false, task_sms: true,   task_push: false,
  promo_email: true,  promo_sms: true,  promo_push: true,
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-100">
      <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function SaveBar({
  saving, saved, onSave, onCancel,
}: { saving: boolean; saved: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-6">
      <button onClick={onCancel}
        className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-300 transition-colors">
        Cancel
      </button>
      <button onClick={onSave} disabled={saving}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
      </button>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700 mb-1.5">{children}</label>
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  )
}

function TextInput({ value, onChange, placeholder, readOnly, type = 'text' }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean; type?: string
}) {
  return (
    <input type={type} value={value} readOnly={readOnly}
      onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${
        readOnly
          ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
          : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
      }`} />
  )
}

// ── Verification tab ──────────────────────────────────────────────────────────

function VerificationTab({ profile, userId }: { profile: Profile | null; userId: string }) {
  const [method, setMethod] = useState<'id' | 'bankid'>('id')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [bankIdStep, setBankIdStep] = useState<'idle' | 'input' | 'loading' | 'awaiting' | 'done'>('idle')
  const [personalNumber, setPersonalNumber] = useState('')
  const [personalNumberError, setPersonalNumberError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const status = profile?.verification_status ?? 'unverified'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setError('')
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('id-documents').upload(path, file, { upsert: true })
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return }
    const { error: updateErr } = await supabase.from('profiles').update({
      verification_status: 'pending',
      verification_doc_url: path,
      verification_submitted_at: new Date().toISOString(),
    }).eq('id', userId)
    setUploading(false)
    if (updateErr) { setError(updateErr.message); return }
    setDone(true)
  }

  function submitPersonalNumber(e: React.FormEvent) {
    e.preventDefault()
    if (!FEATURES.enableBankId) {
      setPersonalNumberError('BankID verification is currently unavailable.')
      return
    }
    const digits = personalNumber.replace(/\s/g, '')
    if (digits.length !== 11 || !/^\d{11}$/.test(digits)) {
      setPersonalNumberError('Enter your 11-digit personal number (fødselsnummer)')
      return
    }
    setPersonalNumberError('')
    setBankIdStep('loading')
    setTimeout(() => setBankIdStep('awaiting'), 1400)
  }

  function cancelBankId() {
    setBankIdStep('idle')
    setPersonalNumber('')
    setPersonalNumberError('')
  }

  const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string; title: string; desc: string }> = {
    unverified: { icon: '○', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', title: 'Not verified', desc: 'Choose a verification method below to get your Verified badge.' },
    pending:    { icon: '⏳', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', title: 'Under review', desc: 'Your document has been submitted and is being reviewed. This usually takes 1–2 business days.' },
    verified:   { icon: '✓', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', title: 'Verified', desc: 'Your identity has been verified. Your profile now shows the Verified badge.' },
    rejected:   { icon: '✗', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', title: 'Verification rejected', desc: profile?.verification_note ?? 'Your document could not be verified. Please re-submit a clearer image.' },
  }

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unverified

  return (
    <div>
      <SectionTitle title="Identity Verification" />
      <div className="max-w-lg space-y-6">
        {/* Status banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: cfg.bg, borderColor: cfg.border }}>
          <span className="text-lg font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.icon}</span>
          <div>
            <p className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.title}</p>
            <p className="text-sm text-gray-600 mt-0.5">{cfg.desc}</p>
          </div>
        </div>

        {/* Verification method selector — show for unverified + rejected */}
        {(status === 'unverified' || status === 'rejected') && !done && bankIdStep !== 'done' && (
          <>
            {/* Method tabs */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMethod('id')}
                className="flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 text-left transition-all"
                style={method === 'id'
                  ? { borderColor: '#6366F1', background: '#EEF2FF' }
                  : { borderColor: '#E5E7EB', background: '#fff' }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: method === 'id' ? '#E0E7FF' : '#F3F4F6' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={method === 'id' ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <circle cx="8" cy="12" r="2"/>
                    <path d="M12 9h4M12 12h4M12 15h4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: method === 'id' ? '#4F46E5' : '#374151' }}>ID Document</p>
                  <p className="text-xs text-gray-400 mt-0.5">Passport, national ID or driver&apos;s licence</p>
                </div>
              </button>

              <button type="button" onClick={() => setMethod('bankid')}
                disabled={!FEATURES.enableBankId}
                className="flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 text-left transition-all"
                style={method === 'bankid'
                  ? { borderColor: '#1D4ED8', background: '#EFF6FF' }
                  : { borderColor: '#E5E7EB', background: '#fff' }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: method === 'bankid' ? '#DBEAFE' : '#F3F4F6' }}>
                  {/* BankID shield icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={method === 'bankid' ? '#1D4ED8' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L3 7v5c0 5 3.5 9.6 9 11 5.5-1.4 9-6 9-11V7L12 2z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: method === 'bankid' ? '#1D4ED8' : '#374151' }}>BankID</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {FEATURES.enableBankId ? 'Instant verification via Norwegian BankID' : 'Temporarily unavailable'}
                  </p>
                </div>
              </button>
            </div>

            {/* ID Document upload */}
            {method === 'id' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Accepted documents</p>
                  <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                    <li>National ID card (front + back)</li>
                    <li>Passport (photo page)</li>
                    <li>Driver&apos;s licence</li>
                  </ul>
                </div>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  {file ? (
                    <p className="text-sm font-semibold text-blue-600">{file.name}</p>
                  ) : (
                    <>
                      <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <p className="text-sm text-gray-500">Click to upload your ID document</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · max 10 MB</p>
                    </>
                  )}
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={!file || uploading}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {uploading ? 'Uploading…' : 'Submit for verification'}
                </button>
              </form>
            )}

            {/* BankID flow — step 1: personal number entry */}
            {method === 'bankid' && (bankIdStep === 'idle' || bankIdStep === 'input') && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L3 7v5c0 5 3.5 9.6 9 11 5.5-1.4 9-6 9-11V7L12 2z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Verify with BankID</p>
                    <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">Enter your Norwegian personal number to receive a BankID verification request on your phone.</p>
                  </div>
                </div>

                <form onSubmit={submitPersonalNumber} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-900 mb-1.5">
                      Personal number <span className="font-normal text-blue-600">(fødselsnummer)</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={13}
                      value={personalNumber}
                      onChange={e => {
                        setPersonalNumberError('')
                        // format as "DDMMYY NNNNN"
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
                        setPersonalNumber(raw.length > 6 ? `${raw.slice(0, 6)} ${raw.slice(6)}` : raw)
                      }}
                      placeholder="DDMMYY NNNNN"
                      className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-mono tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                    {personalNumberError && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {personalNumberError}
                      </p>
                    )}
                    <p className="text-xs text-blue-600 mt-1.5">11 digits — date of birth + individual number</p>
                  </div>

                  <ul className="text-xs text-blue-700 space-y-1.5">
                    {['Instant — no waiting for manual review', 'Works with BankID app or mobile BankID', 'Most secure verification method available'].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button type="submit"
                    className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(90deg,#1D4ED8,#3B82F6)' }}>
                    Send BankID request →
                  </button>
                </form>
              </div>
            )}

            {/* BankID — loading */}
            {method === 'bankid' && bankIdStep === 'loading' && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-blue-800">Sending BankID request…</p>
                <p className="text-xs text-blue-600">Check your BankID app in a moment</p>
              </div>
            )}

            {/* BankID — awaiting confirmation */}
            {method === 'bankid' && bankIdStep === 'awaiting' && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 space-y-4">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2"/>
                      <path d="M12 18h.01"/>
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-blue-900">Open your BankID app</p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    A verification request has been sent to your BankID app.<br/>
                    Open the app and approve it to complete verification.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {[
                    'Open the BankID app on your phone',
                    'Tap the pending request notification',
                    'Confirm with your PIN or biometrics',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-blue-100">
                      <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' }}>
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <p className="text-xs text-amber-800">Waiting for your approval… This page will update automatically.</p>
                </div>

                <button type="button" onClick={cancelBankId}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 transition-colors">
                  Cancel
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Having trouble?{' '}
                  <button type="button" onClick={() => { setMethod('id'); cancelBankId() }} className="text-blue-600 hover:underline">
                    Use ID document instead
                  </button>
                </p>
              </div>
            )}
          </>
        )}

        {done && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <p className="text-sm font-semibold text-green-700">Document submitted — we&apos;ll review it within 1–2 business days.</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs text-gray-500">
            Your identity information is stored securely and only used to verify your account. It will not be shared with other users.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProfileContent({
  user,
  profile: init,
  posts: initPosts,
  reviews,
}: {
  user: UserInfo
  profile: Profile | null
  posts: Post[]
  reviews: Review[]
}) {
  const { locale } = useLanguage()
  const router = useRouter()
  const [tab, setTab] = useState('profile')

  // ── Profile tab state
  const [name, setName]           = useState(init?.display_name ?? '')
  const [bio, setBio]             = useState(init?.bio ?? '')
  const [location, setLocation]   = useState(init?.location ?? '')
  const [rate, setRate]           = useState(String(init?.hourly_rate ?? ''))
  const [cats, setCats]           = useState<string[]>(init?.categories ?? [])
  const [avatar, setAvatar]       = useState<string | null>(init?.avatar_url ?? null)
  const [role,   setRole]         = useState<RoleType>((init?.role as RoleType) ?? 'poster')
  const [videoUrl, setVideoUrl]   = useState(init?.video_intro_url ?? '')
  const [helperLanguages, setHelperLanguages] = useState<string[]>(init?.languages ?? [])
  const [bringsTools, setBringsTools] = useState(Boolean(init?.brings_tools))
  const [canInvoice, setCanInvoice] = useState(Boolean(init?.can_invoice))
  const [avatarErr, setAvatarErr] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [profSaving, setProfSaving] = useState(false)
  const [profSaved,  setProfSaved]  = useState(false)
  const fileRef  = useRef<HTMLInputElement>(null)
  const locRef   = useRef<HTMLDivElement>(null)
  const [locSuggestions,     setLocSuggestions]     = useState<string[]>([])
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)

  // ── Password tab state
  const [curPw,  setCurPw]  = useState('')
  const [newPw,  setNewPw]  = useState('')
  const [confPw, setConfPw] = useState('')
  const [pwErr,  setPwErr]  = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved,  setPwSaved]  = useState(false)

  // ── Security (phone / 2FA)
  const [phone,       setPhone]     = useState(init?.phone ?? '')
  const [phoneStep,   setPhoneStep] = useState<'input' | 'otp' | 'done'>(init?.phone ? 'done' : 'input')
  const [otp,         setOtp]       = useState('')
  const [phoneBusy,   setPhoneBusy] = useState(false)
  const [phoneErr,    setPhoneErr]  = useState('')

  // ── Notifications
  const [notif,       setNotif]       = useState<Record<string, boolean>>(init?.notifications ?? DEFAULT_NOTIF)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSaved,  setNotifSaved]  = useState(false)

  // ── Business
  const [bizName, setBizName] = useState(init?.business_name ?? '')
  const [bizWeb,  setBizWeb]  = useState(init?.business_website ?? '')
  const [bizDesc, setBizDesc] = useState(init?.business_description ?? '')
  const [bizSaving, setBizSaving] = useState(false)
  const [bizSaved,  setBizSaved]  = useState(false)

  // ── Cancel a task
  const [posts,         setPosts]         = useState<Post[]>(initPosts)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [cancelBusy,    setCancelBusy]    = useState<string | null>(null)

  // ── Delete account modal
  const [showDelete,   setShowDelete]   = useState(false)
  const [deleteStep,   setDeleteStep]   = useState<'phone' | 'otp'>('phone')
  const [delPhone,     setDelPhone]     = useState(init?.phone ?? '')
  const [delOtp,       setDelOtp]       = useState('')
  const [delBusy,      setDelBusy]      = useState(false)
  const [delErr,       setDelErr]       = useState('')

  // ── Derived
  const initials = (init?.display_name ?? user.email)
    .split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('') ||
    user.email[0]?.toUpperCase()
  const avatarColor = AVATAR_COLORS[user.id.charCodeAt(user.id.length - 1) % AVATAR_COLORS.length]

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node))
        setShowLocSuggestions(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleLocationChange(val: string) {
    setLocation(val)
    if (val.trim().length >= 1) {
      const matches = NORWAY_LOCATIONS.filter(l =>
        l.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8)
      setLocSuggestions(matches)
      setShowLocSuggestions(matches.length > 0)
    } else {
      setShowLocSuggestions(false)
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function uploadAvatar(file: File) {
    setAvatarErr('')
    const sb  = createClient()
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { setAvatarErr('Upload failed — make sure the "avatars" bucket exists in Supabase Storage.'); return }
    const { data } = sb.storage.from('avatars').getPublicUrl(path)
    setAvatar(data.publicUrl)
  }

  async function saveProfile() {
    setProfileErr('')
    setProfSaving(true)
    const { error } = await createClient().from('profiles').upsert({
      id: user.id, role, display_name: name, bio, location,
      hourly_rate: rate ? Number(rate) : null, categories: cats, avatar_url: avatar,
      video_intro_url: videoUrl.trim() || null,
      languages: helperLanguages,
      brings_tools: bringsTools,
      can_invoice: canInvoice,
    })
    setProfSaving(false)
    if (error) {
      setProfileErr(error.message)
      return
    }
    setProfSaved(true)
    setTimeout(() => setProfSaved(false), 3000)
  }

  async function savePassword() {
    setPwErr('')
    if (newPw.length < 8) { setPwErr('Password must be at least 8 characters'); return }
    if (newPw !== confPw)  { setPwErr('Passwords do not match'); return }
    setPwSaving(true)
    const { error } = await createClient().auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) { setPwErr(error.message); return }
    setPwSaved(true); setCurPw(''); setNewPw(''); setConfPw('')
    setTimeout(() => setPwSaved(false), 3000)
  }

  async function sendPhoneCode() {
    if (!FEATURES.enableSms2fa) {
      setPhoneErr('SMS verification is currently unavailable.')
      return
    }
    setPhoneBusy(true); setPhoneErr('')
    await new Promise(r => setTimeout(r, 900))
    setPhoneBusy(false); setPhoneStep('otp'); setOtp('')
  }

  async function verifyPhone() {
    setPhoneBusy(true); setPhoneErr('')
    const { error } = await createClient().from('profiles').upsert({ id: user.id, phone })
    setPhoneBusy(false)
    if (error) { setPhoneErr(error.message); return }
    setPhoneStep('done')
  }

  async function saveNotifications() {
    setNotifSaving(true)
    await createClient().from('profiles').upsert({ id: user.id, notifications: notif })
    setNotifSaving(false); setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 3000)
  }

  async function saveBusiness() {
    setBizSaving(true)
    await createClient().from('profiles').upsert({
      id: user.id, business_name: bizName, business_website: bizWeb, business_description: bizDesc,
    })
    setBizSaving(false); setBizSaved(true)
    setTimeout(() => setBizSaved(false), 3000)
  }

  async function cancelPost(id: string) {
    setCancelBusy(id)
    await createClient().from('posts').update({ status: 'cancelled' }).eq('id', id)
    setPosts(p => p.filter(x => x.id !== id))
    setCancelBusy(null); setConfirmCancel(null)
  }

  async function handleDeleteSendCode() {
    if (!FEATURES.enableSms2fa) {
      setDelErr('SMS verification is currently unavailable.')
      return
    }
    setDelBusy(true); setDelErr('')
    await new Promise(r => setTimeout(r, 900))
    setDelBusy(false); setDeleteStep('otp')
  }

  async function handleDeleteConfirm() {
    setDelBusy(true); setDelErr('')
    const sb = createClient()
    const { error } = await sb.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', user.id)
    if (error) { setDelErr(error.message); setDelBusy(false); return }
    await sb.auth.signOut()
    router.push('/')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Account</h1>

        <div className="flex gap-8 items-start">

          {/* ── Sidebar ── */}
          <aside className="w-52 shrink-0">
            <nav className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {TABS.map((t, i) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`relative block w-full text-left px-4 py-3 text-sm font-medium transition-all
                    ${i < TABS.length - 1 ? 'border-b border-gray-100' : ''}
                    ${t.key === 'delete'
                      ? tab === t.key
                        ? 'text-red-600 font-bold bg-red-50'
                        : 'text-red-500 hover:bg-red-50'
                      : tab === t.key
                        ? 'text-blue-600 font-bold bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}>
                  {tab === t.key && (
                    <span className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r ${t.key === 'delete' ? 'bg-red-500' : 'bg-blue-600'}`} />
                  )}
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content panel ── */}
          <main className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 min-h-135">

            {/* ─── PROFILE ─── */}
            {tab === 'profile' && (
              <div>
                <SectionTitle title="Profile" sub="Update your personal information and how you appear to others." />

                {/* Avatar row */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    {avatar
                      ? <Image src={avatar} alt="avatar" width={80} height={80} className="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-md" />
                      : (
                        <div className="h-20 w-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md"
                          style={{ background: avatarColor }}>
                          {initials}
                        </div>
                      )
                    }
                    <button onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-blue-400 transition-colors shadow-sm">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{name || user.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Member since {formatDateByLocale(user.created_at, locale, { month: 'long', year: 'numeric' })}
                    </p>
                    <button onClick={() => fileRef.current?.click()}
                      className="mt-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
                      Change photo
                    </button>
                  </div>
                </div>

                {avatarErr && (
                  <p className="mb-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{avatarErr}</p>
                )}
                {profileErr && (
                  <p className="mb-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{profileErr}</p>
                )}

                {/* Role switcher */}
                <div className="mb-6">
                  <FieldLabel>Account type</FieldLabel>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {([
                      { key: 'poster', label: 'Task Poster', sub: 'I need help',
                        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/><path d="M9 10h6"/></svg>,
                        active: 'border-blue-500 bg-blue-50 text-blue-700', iconBg: 'bg-blue-100 text-blue-600' },
                      { key: 'helper', label: 'Helper', sub: 'I can help',
                        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
                        active: 'border-green-500 bg-green-50 text-green-700', iconBg: 'bg-green-100 text-green-600' },
                    ] as const).map(opt => (
                      <button key={opt.key} type="button" onClick={() => setRole(opt.key as RoleType)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          role === opt.key ? opt.active : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}>
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          role === opt.key ? opt.iconBg : 'bg-gray-100 text-gray-500'
                        }`}>
                          {opt.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{opt.label}</p>
                          <p className="text-xs opacity-60">{opt.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div><FieldLabel>Display name</FieldLabel><TextInput value={name} onChange={setName} placeholder="Your full name" /></div>
                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <TextInput value={user.email} readOnly />
                    <p className="mt-1 text-xs text-gray-400">Email cannot be changed here</p>
                  </div>
                  <div>
                    <FieldLabel>About me</FieldLabel>
                    <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)}
                      placeholder="Tell people about yourself and what makes you great…"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none" />
                  </div>
                  <div>
                    <FieldLabel>Location</FieldLabel>
                    <div ref={locRef} className="relative">
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <input type="text" value={location}
                          onChange={e => handleLocationChange(e.target.value)}
                          onFocus={() => location.trim().length >= 1 && setShowLocSuggestions(locSuggestions.length > 0)}
                          placeholder="e.g. Oslo – Grünerløkka"
                          style={{ paddingLeft: '2.25rem' }}
                          className="w-full rounded-xl border border-gray-200 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                      </div>
                      {showLocSuggestions && (
                        <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                          {locSuggestions.map(s => (
                            <li key={s}>
                              <button type="button"
                                onMouseDown={() => { setLocation(s); setShowLocSuggestions(false) }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                </svg>
                                <span className="text-gray-700">{s}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {role === 'helper' && (
                    <>
                      <div><FieldLabel>Hourly rate (NOK)</FieldLabel><TextInput type="number" value={rate} onChange={setRate} placeholder="e.g. 350" /></div>
                      <div>
                        <FieldLabel>Services offered</FieldLabel>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {SERVICE_CATEGORIES.map(c => (
                            <button key={c} type="button"
                              onClick={() => setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                                cats.includes(c)
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                              }`}>
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Video intro URL <span className="font-normal text-gray-400">(optional)</span></FieldLabel>
                        <TextInput
                          value={videoUrl}
                          onChange={setVideoUrl}
                          placeholder="YouTube or Vimeo link, e.g. https://youtube.com/watch?v=…"
                        />
                        <p className="mt-1 text-xs text-gray-400">A short 30–60 s video boosts trust with clients and appears on your profile.</p>
                      </div>
                      <div>
                        <FieldLabel>Languages</FieldLabel>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {[
                            { key: 'no', label: 'Norsk' },
                            { key: 'en', label: 'English' },
                          ].map(opt => (
                            <button key={opt.key} type="button"
                              onClick={() => setHelperLanguages(prev =>
                                prev.includes(opt.key) ? prev.filter(v => v !== opt.key) : [...prev, opt.key]
                              )}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                                helperLanguages.includes(opt.key)
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                              }`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700">
                          <span>Brings own tools</span>
                          <input type="checkbox" checked={bringsTools} onChange={e => setBringsTools(e.target.checked)} />
                        </label>
                        <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700">
                          <span>Can invoice (VAT/business)</span>
                          <input type="checkbox" checked={canInvoice} onChange={e => setCanInvoice(e.target.checked)} />
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <SaveBar saving={profSaving} saved={profSaved} onSave={saveProfile}
                  onCancel={() => {
                    setName(init?.display_name ?? ''); setBio(init?.bio ?? '')
                    setLocation(init?.location ?? ''); setRate(String(init?.hourly_rate ?? ''))
                    setCats(init?.categories ?? []); setRole((init?.role as RoleType) ?? 'poster')
                    setVideoUrl(init?.video_intro_url ?? '')
                    setHelperLanguages(init?.languages ?? [])
                    setBringsTools(Boolean(init?.brings_tools))
                    setCanInvoice(Boolean(init?.can_invoice))
                    setAvatarErr('')
                    setProfileErr('')
                  }} />

                {/* ── Reviews received ── */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-extrabold text-gray-900">Reviews received</h2>
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Stars rating={reviews.reduce((s, r) => s + r.rating, 0) / reviews.length} size={15} />
                        <span className="text-sm font-bold text-gray-900">
                          {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-5">Reviews left for you by people you helped.</p>

                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl bg-gray-50 border border-gray-100">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
                      <p className="text-xs text-gray-400 mt-1">Reviews will appear here after you complete tasks.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {reviews.map((rev, i) => (
                        <div key={rev.id} className={i < reviews.length - 1 ? 'pb-5 border-b border-gray-100' : ''}>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3">
                              {rev.reviewer_avatar ? (
                                <Image src={rev.reviewer_avatar} alt={`${rev.reviewer_name ?? 'Anonymous'} avatar`} width={36} height={36} className="h-9 w-9 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                  {(rev.reviewer_name ?? 'A')[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-gray-900">{rev.reviewer_name ?? 'Anonymous'}</p>
                                <p className="text-xs text-gray-400">
                                  {formatDateByLocale(rev.created_at, locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <Stars rating={rev.rating} size={13} />
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed pl-12">{rev.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── PASSWORD ─── */}
            {tab === 'password' && (
              <div>
                <SectionTitle title="Password" sub="Keep your account secure by using a strong password." />
                <div className="max-w-md space-y-5">
                  <div><FieldLabel>Current password</FieldLabel><TextInput type="password" value={curPw} onChange={setCurPw} placeholder="••••••••" /></div>
                  <div><FieldLabel>New password</FieldLabel><TextInput type="password" value={newPw} onChange={setNewPw} placeholder="Min. 8 characters" /></div>
                  <div><FieldLabel>Confirm new password</FieldLabel><TextInput type="password" value={confPw} onChange={setConfPw} placeholder="Repeat new password" /></div>
                  {pwErr && (
                    <p className="flex items-center gap-1.5 text-sm text-red-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {pwErr}
                    </p>
                  )}
                </div>
                <SaveBar saving={pwSaving} saved={pwSaved} onSave={savePassword}
                  onCancel={() => { setCurPw(''); setNewPw(''); setConfPw(''); setPwErr('') }} />
              </div>
            )}

            {/* ─── SECURITY ─── */}
            {tab === 'security' && (
              <div>
                <SectionTitle title="Account Security" sub="Manage two-factor authentication and your verified email." />

                {/* Email verified badge */}
                <div className="flex items-center justify-between p-5 rounded-xl bg-gray-50 border border-gray-100 mb-8">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Email address</p>
                    <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-100">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Verified
                  </span>
                </div>

                {/* Phone / 2FA */}
                <h3 className="text-sm font-extrabold text-gray-900 mb-1">Two-factor authentication</h3>
                <p className="text-sm text-gray-500 mb-5">Add your phone number to receive a security code when signing in.</p>

                {phoneStep === 'done' ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <div>
                      <p className="text-sm font-bold text-green-800">Phone verified</p>
                      <p className="text-xs text-green-600">+47 {phone}</p>
                    </div>
                    <button onClick={() => setPhoneStep('input')} className="ml-auto text-xs font-semibold text-green-700 hover:text-green-800">Change</button>
                  </div>
                ) : phoneStep === 'input' ? (
                  <div className="max-w-sm space-y-4">
                    <div>
                      <FieldLabel>Phone number</FieldLabel>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 shrink-0">
                          <span>🇳🇴</span>
                          <span className="text-sm font-semibold text-gray-700">+47</span>
                        </div>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="91 23 45 67"
                          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                      </div>
                    </div>
                    {phoneErr && <p className="text-xs text-red-500">{phoneErr}</p>}
                    <button onClick={sendPhoneCode} disabled={!phone || phoneBusy}
                      className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                      {phoneBusy ? 'Sending…' : FEATURES.enableSms2fa ? 'Send Code' : 'SMS unavailable'}
                    </button>
                  </div>
                ) : (
                  <div className="max-w-sm space-y-4">
                    <p className="text-sm text-gray-500">Enter the 6-digit code sent to +47 {phone}</p>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6} placeholder="000000"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-bold text-center tracking-[0.6em] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                    {!FEATURES.enableSms2fa && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        SMS verification is currently unavailable.
                      </p>
                    )}
                    {phoneErr && <p className="text-xs text-red-500">{phoneErr}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => { setPhoneStep('input'); setPhoneErr('') }}
                        className="flex-1 rounded-xl py-2.5 text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">Back</button>
                      <button onClick={verifyPhone} disabled={otp.length < 6 || phoneBusy}
                        className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                        {phoneBusy ? 'Verifying…' : 'Verify'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── NOTIFICATIONS ─── */}
            {tab === 'notifications' && (
              <div>
                <SectionTitle title="Notifications" sub="Choose how you want to be notified about activity on Hire2Skill." />

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 pr-8 font-semibold text-gray-700">Form of Communication</th>
                        {(['Email','SMS','Push Notification'] as const).map(h => (
                          <th key={h} className="text-center py-3 px-6 font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'task',  label: 'Task Updates' },
                        { key: 'promo', label: 'Promotional Emails and Notifications' },
                      ].map((row, ri) => (
                        <tr key={row.key} className={ri === 0 ? 'border-b border-gray-100' : ''}>
                          <td className="py-4 pr-8 text-gray-700">{row.label}</td>
                          {(['email','sms','push'] as const).map(ch => (
                            <td key={ch} className="py-4 px-6 text-center">
                              <input type="checkbox"
                                checked={notif[`${row.key}_${ch}`] ?? false}
                                onChange={e => setNotif(p => ({ ...p, [`${row.key}_${ch}`]: e.target.checked }))}
                                className="h-4 w-4 rounded accent-blue-600 cursor-pointer" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <SaveBar saving={notifSaving} saved={notifSaved} onSave={saveNotifications}
                  onCancel={() => setNotif(init?.notifications ?? DEFAULT_NOTIF)} />
              </div>
            )}

            {/* ─── BILLING ─── */}
            {tab === 'billing' && (
              <div>
                <SectionTitle title="Billing Info" sub="Manage your payment methods and billing details." />
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <p className="text-base font-extrabold text-gray-900 mb-2">Payment methods</p>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                    {FEATURES.enablePayments
                      ? 'Connect your payment method and manage billing for bookings.'
                      : 'Stripe and Vipps payment integration is currently unavailable.'}
                  </p>
                </div>
              </div>
            )}

            {/* ─── CANCEL A TASK ─── */}
            {tab === 'cancel' && (
              <div>
                <SectionTitle title="Cancel a Task" sub="View and cancel your open task requests." />

                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 border border-gray-100">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No active tasks</p>
                    <p className="text-xs text-gray-400 mt-1">Your open task posts will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map(post => (
                      <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{post.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">{post.category}</span>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400">
                              {formatDateByLocale(post.created_at, locale, { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                          post.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>{post.status}</span>

                        {confirmCancel === post.id ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setConfirmCancel(null)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors">
                              Keep
                            </button>
                            <button onClick={() => cancelPost(post.id)} disabled={cancelBusy === post.id}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
                              {cancelBusy === post.id ? '…' : 'Yes, cancel'}
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmCancel(post.id)}
                            className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            Cancel task
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── BUSINESS INFORMATION ─── */}
            {tab === 'business' && (
              <div>
                <SectionTitle title="Business Information" sub="Add your business details to build trust with customers." />
                <div className="max-w-md space-y-5">
                  <div><FieldLabel>Business name</FieldLabel><TextInput value={bizName} onChange={setBizName} placeholder="e.g. Oslo Clean Pro AS" /></div>
                  <div><FieldLabel>Website</FieldLabel><TextInput type="url" value={bizWeb} onChange={setBizWeb} placeholder="https://yourwebsite.no" /></div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea rows={4} value={bizDesc} onChange={e => setBizDesc(e.target.value)}
                      placeholder="Brief description of your business, services, and experience…"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none" />
                  </div>
                </div>
                <SaveBar saving={bizSaving} saved={bizSaved} onSave={saveBusiness}
                  onCancel={() => { setBizName(init?.business_name ?? ''); setBizWeb(init?.business_website ?? ''); setBizDesc(init?.business_description ?? '') }} />
              </div>
            )}

            {/* ─── ACCOUNT BALANCE ─── */}
            {tab === 'balance' && (
              <div>
                <SectionTitle title="Account Balance" sub="Your Hire2Skill credit balance." />
                <div className="flex items-center gap-6 p-6 rounded-2xl mb-8"
                  style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' }}>
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-white shadow-sm shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Current balance</p>
                    <p className="text-4xl font-extrabold text-blue-900 mt-0.5">
                      0 <span className="text-2xl font-bold text-blue-400">NOK</span>
                    </p>
                  </div>
                </div>
                <button disabled
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white opacity-50 cursor-not-allowed"
                  style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                  Add Credits — Currently unavailable
                </button>
                <p className="text-xs text-gray-400 mt-2">Vipps and card top-up are currently unavailable.</p>
              </div>
            )}

            {/* ─── TRANSACTIONS ─── */}
            {tab === 'transactions' && (
              <div>
                <SectionTitle title="Transactions" sub="History of all payments and credits on your account." />
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 bg-gray-50 border border-gray-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">No transactions yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your payment history will appear here once payments are enabled.</p>
                </div>
              </div>
            )}

            {/* ─── VERIFICATION ─── */}
            {tab === 'verification' && (
              <VerificationTab profile={init} userId={user.id} />
            )}

            {/* ─── DELETE ACCOUNT ─── */}
            {tab === 'delete' && (
              <div>
                <SectionTitle title="Account Deletion" />
                <div className="max-w-lg">
                  <div className="flex gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-6">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p className="text-sm text-red-700">
                      Once you have deleted your account, you will no longer be able to log in to the Hire2Skill site or apps.{' '}
                      <strong>This action cannot be undone.</strong>
                    </p>
                  </div>
                  <button onClick={() => { setShowDelete(true); setDeleteStep('phone'); setDelErr('') }}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── Delete Account Modal ──────────────────────────────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="relative border-b border-gray-100 px-6 py-4">
              <button onClick={() => setShowDelete(false)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <h3 className="text-base font-extrabold text-gray-900 text-center">Authentication Required</h3>
            </div>

            {/* Modal body */}
            <div className="px-6 py-6">
              {deleteStep === 'phone' ? (
                <>
                  <p className="text-sm text-blue-600 text-center mb-6 leading-relaxed">
                    To keep your account secure, enter your phone number to receive a security code and confirm account deletion.
                  </p>

                  <div className="flex gap-2 mb-5">
                    <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 shrink-0">
                      <span>🇳🇴</span>
                      <span className="text-sm font-semibold text-gray-700">+47</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                    <input type="tel" value={delPhone} onChange={e => setDelPhone(e.target.value)}
                      placeholder="91 23 45 67"
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                  </div>

                  {delErr && <p className="text-xs text-red-500 mb-3 text-center">{delErr}</p>}

                  <button onClick={handleDeleteSendCode} disabled={!delPhone || delBusy}
                    className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
                    {delBusy ? 'Sending…' : 'Send Code'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    Enter the 6-digit code sent to +47 {delPhone}
                  </p>

                  <input type="text" value={delOtp} onChange={e => setDelOtp(e.target.value)}
                    maxLength={6} placeholder="000000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-center tracking-[0.5em] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition mb-3" />

                  <p className="text-xs text-gray-400 text-center mb-5">
                    By continuing, you permanently delete your Hire2Skill account and all data.
                  </p>

                  {delErr && <p className="text-xs text-red-500 mb-3 text-center">{delErr}</p>}

                  <button onClick={handleDeleteConfirm} disabled={delOtp.length < 4 || delBusy}
                    className="w-full rounded-xl py-3.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 mb-2">
                    {delBusy ? 'Deleting…' : 'Permanently Delete Account'}
                  </button>

                  <button onClick={() => setDeleteStep('phone')}
                    className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    Back
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
