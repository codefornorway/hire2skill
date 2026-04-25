'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ServiceDef } from '@/lib/services'
import { getRelatedServices } from '@/lib/services'

type Helper = {
  id: string
  display_name: string | null
  bio: string | null
  hourly_rate: number | null
  categories: string[] | null
  location: string | null
  verified: boolean
  tasks_done: number | null
  rating: number
  review_count?: number | null
  response_hours?: number | null
  avatar_url?: string | null
}

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#F59E0B' : 'none'}
          stroke="#F59E0B" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

function HelperCard({ helper }: { helper: Helper }) {
  const initials = (helper.display_name ?? 'H').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const color = AVATAR_COLORS[(helper.id?.charCodeAt(helper.id.length - 1) ?? 0) % AVATAR_COLORS.length]
  return (
    <Link href={`/taskers/${helper.id}`}
      className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {helper.avatar_url ? (
          <Image src={helper.avatar_url} alt={helper.display_name ?? ''} width={48} height={48}
            className="h-12 w-12 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: color }}>
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
            {helper.display_name}
          </p>
          <p className="text-xs text-gray-400 truncate">{helper.location ?? 'Norway'}</p>
        </div>
        {helper.verified && (
          <span className="ml-auto shrink-0 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-100">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Verified
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 line-clamp-2">{helper.bio}</p>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5">
          <Stars rating={helper.rating} />
          {(helper.review_count ?? 0) > 0 && (
            <span className="text-xs text-gray-400">({helper.review_count})</span>
          )}
        </div>
        <span className="text-sm font-bold text-gray-900">
          {helper.hourly_rate ? `${helper.hourly_rate} NOK/hr` : 'Quote on request'}
        </span>
      </div>
    </Link>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>}
    </div>
  )
}

const BRAND_GRADIENT = 'linear-gradient(135deg,#1E3A8A,#38BDF8)'
const BRAND_BLUE = '#1E3A8A'
const BRAND_MID = '#2563EB'
const BRAND_BG = '#EFF6FF'

function PriceCalculator({ svc }: { svc: ServiceDef }) {
  const [hours, setHours] = useState(2)
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium')
  const multiplier = size === 'small' ? 0.8 : size === 'large' ? 1.35 : 1
  const low  = Math.round(svc.priceMin * hours * multiplier / 50) * 50
  const high = Math.round(svc.priceMax * hours * multiplier / 50) * 50

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: BRAND_BG }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND_MID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <div>
          <h3 className="text-base font-extrabold text-gray-900">Price estimator</h3>
          <p className="text-xs text-gray-400">Get an instant cost estimate for your job</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Hours slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Estimated hours</label>
            <span className="text-sm font-bold text-blue-600">{hours}h</span>
          </div>
          <input type="range" min={1} max={8} step={0.5} value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1h</span><span>4h</span><span>8h</span>
          </div>
        </div>

        {/* Job size */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Job size</label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map(s => (
              <button key={s} type="button" onClick={() => setSize(s)}
                className="rounded-xl py-2 text-sm font-semibold border transition-all capitalize"
                style={size === s
                  ? { background: BRAND_GRADIENT, color: '#fff', borderColor: 'transparent' }
                  : { background: '#F9FAFB', color: '#374151', borderColor: '#E5E7EB' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="rounded-2xl p-5 text-center" style={{ background: BRAND_BG }}>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Estimated cost</p>
          <p className="text-3xl font-extrabold text-gray-900">
            {low.toLocaleString()}–{high.toLocaleString()} <span className="text-lg text-gray-500 font-semibold">NOK</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Based on {hours}h at {svc.priceMin}–{svc.priceMax} NOK/hr</p>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Estimate only — final price agreed with your helper.
        </p>
      </div>
    </div>
  )
}

export default function ServicePageContent({
  svc, helpers, isLoggedIn,
}: {
  svc: ServiceDef
  helpers: Helper[]
  isLoggedIn: boolean
}) {
  const related = getRelatedServices(svc.relatedSlugs)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="text-white" style={{ background: BRAND_GRADIENT }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{svc.emoji}</span>
            <nav className="text-sm opacity-75">
              <Link href="/services" className="hover:underline">Services</Link>
              <span className="mx-2">/</span>
              <span>{svc.title}</span>
            </nav>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">{svc.headline}</h1>
          <p className="text-lg opacity-90 max-w-2xl mb-8">{svc.subheadline}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/post"
              className="rounded-xl px-7 py-3.5 font-bold text-sm bg-white hover:opacity-90 transition-opacity"
              style={{ color: BRAND_BLUE }}>
              Post a Task
            </Link>
            <Link href={`/taskers?category=${encodeURIComponent(svc.category)}`}
              className="rounded-xl px-7 py-3.5 font-bold text-sm text-white transition-colors"
              style={{ border: '2px solid rgba(255,255,255,0.6)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              Browse Helpers
            </Link>
          </div>

          {/* Price badge */}
          <div className="mt-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'rgba(255,255,255,0.18)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            From {svc.priceMin} NOK — {svc.priceMax} NOK {svc.priceUnit}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-14">

        {/* ── PRICE CALCULATOR + WHAT'S INCLUDED ───────────────────────────────── */}
        <section className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="order-2 lg:order-1">
            <PriceCalculator svc={svc} />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">What&apos;s included</h2>
            <ul className="space-y-3">
              {svc.included.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ background: BRAND_BG }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BRAND_MID} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            {svc.notIncluded && (
              <div className="mt-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Not included (add-ons)</p>
                <ul className="space-y-1">
                  {svc.notIncluded.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400"><span className="text-gray-300">—</span> {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
        <section className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">How it works</h2>
            <div className="space-y-4">
              {svc.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: BRAND_GRADIENT }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, bg: '#F0FDF4', label: 'ID Verified helpers' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, bg: '#FFFBEB', label: 'Rated & reviewed' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, bg: '#F0F9FF', label: 'Secure payments' },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 bg-white gap-2">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: b.bg }}>
                  {b.icon}
                </div>
                <p className="text-xs font-semibold text-gray-600 leading-tight">{b.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HELPERS ──────────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {helpers.length > 0 ? `Top ${svc.title.toLowerCase()} helpers` : `Find ${svc.title.toLowerCase()} helpers`}
            </h2>
            <Link href={`/taskers?category=${encodeURIComponent(svc.category)}`}
              className="text-sm font-semibold hover:underline" style={{ color: BRAND_MID }}>
              See all →
            </Link>
          </div>

          {helpers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {helpers.map(h => <HelperCard key={h.id} helper={h} />)}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">{svc.emoji}</p>
              <p className="font-bold text-gray-700 mb-1">No helpers listed yet in this category</p>
              <p className="text-sm text-gray-400 mb-6">Post your task and helpers will reach out to you.</p>
              <Link href="/post"
                className="inline-block rounded-xl px-6 py-3 text-sm font-bold text-white"
                style={{ background: BRAND_GRADIENT }}>
                Post a Task
              </Link>
            </div>
          )}
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Frequently asked questions</h2>
          <div className="bg-white border border-gray-200 rounded-2xl px-6 divide-y divide-gray-100">
            {svc.faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </section>

        {/* ── RELATED SERVICES ─────────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Related services</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.slug} href={`/services/${r.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: BRAND_BG }}>
                    {r.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">From {r.priceMin} NOK</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── BOTTOM CTA ───────────────────────────────────────────────────────── */}
        <section className="rounded-2xl p-10 text-center text-white" style={{ background: BRAND_GRADIENT }}>
          <h2 className="text-2xl font-extrabold mb-2">Ready to book {svc.title.toLowerCase()}?</h2>
          <p className="opacity-90 mb-6 text-sm">Post your task in 2 minutes and get matched with verified helpers near you.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/post"
              className="rounded-xl px-7 py-3 font-bold text-sm bg-white hover:opacity-90 transition-opacity"
              style={{ color: BRAND_BLUE }}>
              Post a Task
            </Link>
            <Link href={isLoggedIn ? '/dashboard' : '/signup'}
              className="rounded-xl px-7 py-3 font-bold text-sm border-2 border-white border-opacity-60 text-white hover:bg-white hover:bg-opacity-10 transition-colors">
              {isLoggedIn ? 'My Dashboard' : 'Create Account'}
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
