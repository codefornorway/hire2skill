'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Gift, Copy, Check, Users, BadgeCheck, Wallet } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skilllink.no'

export default function ReferralContent({ userId, displayName }: { userId: string; displayName: string | null }) {
  const { locale, t } = useLanguage()
  const r = t.referral
  const referralCode = userId.slice(0, 8).toUpperCase()
  const referralLink = `${BASE_URL}/signup?ref=${referralCode}`
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const firstName = displayName?.split(' ')[0] ?? 'You'

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(r.whatsappText(firstName, referralLink))}`
  const emailHref =
    `mailto:?subject=${encodeURIComponent(r.emailSubject)}` +
    `&body=${encodeURIComponent(r.emailBody(firstName, referralLink))}`

  const howItWorks = useMemo(() => {
    const loc = locale === 'no' ? 'no' : 'en'
    const copy = {
      en: [
        { title: 'Share your link', desc: 'Copy your unique referral link and send it to friends.' },
        { title: 'Friend signs up', desc: 'They create a SkillLink account using your link.' },
        { title: 'They complete a booking', desc: 'Your friend completes their first task or booking.' },
        { title: 'You both earn 100 NOK', desc: 'Credits appear in your account within 24 hours.' },
      ],
      no: [
        { title: 'Del lenken din', desc: 'Kopier din unike vervelenke og send den til venner.' },
        { title: 'Vennen registrerer seg', desc: 'De oppretter en SkillLink-konto med lenken din.' },
        { title: 'Første booking fullføres', desc: 'Vennen fullfører sitt første oppdrag på plattformen.' },
        { title: 'Dere får 100 NOK hver', desc: 'Kreditt dukker opp på kontoen innen 24 timer.' },
      ],
    }[loc]
    const icons = [
      { icon: <Copy size={20} color="#2563EB" strokeWidth={1.75} />, bg: '#EFF6FF' },
      { icon: <Users size={20} color="#7C3AED" strokeWidth={1.75} />, bg: '#F5F3FF' },
      { icon: <BadgeCheck size={20} color="#16A34A" strokeWidth={1.75} />, bg: '#F0FDF4' },
      { icon: <Wallet size={20} color="#D97706" strokeWidth={1.75} />, bg: '#FFFBEB' },
    ] as const
    return copy.map((step, i) => ({ ...step, ...icons[i] }))
  }, [locale])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="text-white py-16 px-6 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 55%,#38BDF8 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
            <Gift size={32} color="white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">{r.heroTitle}</h1>
          <p className="text-blue-100 text-base leading-relaxed">
            {r.heroSub}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10 space-y-8">

        {/* Credits balance card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
            <Wallet size={26} color="#D97706" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your referral credits</p>
            <p className="text-3xl font-extrabold text-gray-900">0 <span className="text-lg text-gray-400 font-semibold">NOK</span></p>
            <p className="text-xs text-gray-400 mt-0.5">Credits apply automatically at checkout</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">Friends referred</p>
            <p className="text-2xl font-extrabold text-gray-900">0</p>
          </div>
        </div>

        {/* Referral link */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm font-bold text-gray-700 mb-3">Your unique referral link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 font-mono truncate">
              {referralLink}
            </div>
            <button onClick={copyLink}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all"
              style={{ background: copied ? 'linear-gradient(90deg,#16A34A,#22C55E)' : 'linear-gradient(90deg,#2563EB,#38BDF8)' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3">Your referral code: <span className="font-bold text-gray-600">{referralCode}</span></p>

          {/* Share buttons */}
          <div className="flex gap-3 mt-5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: '#25D366' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.997 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.135-1.318A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.997 2zm.003 18a7.946 7.946 0 0 1-4.086-1.133l-.293-.174-3.047.783.806-2.965-.192-.305A7.946 7.946 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={emailHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: '#6B7280' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email
            </a>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-base font-extrabold text-gray-900 mb-4">{locale === 'no' ? 'Slik fungerer det' : 'How it works'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: step.bg }}>
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="rounded-xl bg-gray-100 px-5 py-4 text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-700">Terms: </span>
          Credits are awarded when your referred friend creates an account using your link and completes their first booking (minimum 300 NOK). Credits expire 12 months after issue. Not combinable with other promotional codes. SkillLink reserves the right to modify the referral programme.
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
