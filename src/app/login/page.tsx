'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { getEmailGuardReason, normalizeEmail } from '@/lib/email-guard'
import { getAuthOtpLength } from '@/lib/auth/otp-config'
import { verifyEmailOtpWithFallback } from '@/lib/auth/verify-email-otp'
import { LogoIcon } from '@/components/SkillLinkLogo'
import { OtpDigitInput } from '@/components/OtpDigitInput'
import { fetchEmailRegistered, isLoginOtpNoExistingUserMessage } from '@/lib/auth/fetch-email-registered'

function resolveNextPath(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/')) return null
  if (raw.startsWith('//')) return null
  return raw
}

function AuthMark() {
  return (
    <div className="mx-auto mb-2 flex justify-center" aria-hidden>
      <LogoIcon size={44} />
    </div>
  )
}

function LoginPageContent() {
  const { t, locale } = useLanguage()
  const L = t.login
  const searchParams = useSearchParams()
  const emailRef = useRef<HTMLInputElement>(null)
  const otpLen = getAuthOtpLength()
  const [step, setStep] = useState<1 | 2 | 'pw'>('pw')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [noAccount, setNoAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step1Busy, setStep1Busy] = useState(false)
  const [resending, setResending] = useState(false)
  const [password, setPassword] = useState('')
  const nextPath = resolveNextPath(searchParams.get('next'))
  const signupHref = nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : '/signup'
  const passwordJustReset = searchParams.get('reset') === 'success'
  const useCodeInsteadLabel =
    locale === 'no'
      ? 'Bruk e-postkode i stedet'
      : locale === 'da'
        ? 'Brug e-mailkode i stedet'
        : locale === 'sv'
          ? 'Använd e-postkod istället'
          : 'Use email code instead'

  useEffect(() => {
    if (step !== 2) return
    const tid = window.setTimeout(() => document.getElementById('login-otp')?.focus(), 50)
    return () => window.clearTimeout(tid)
  }, [step])

  async function sendLoginOtp() {
    setError('')
    setNoAccount(false)
    const el = emailRef.current
    if (el && !el.checkValidity()) {
      el.reportValidity()
      return
    }

    const normalizedEmail = normalizeEmail(email.trim())
    const emailGuardReason = getEmailGuardReason(normalizedEmail)
    if (emailGuardReason === 'invalid_format') {
      setError(t.signup.invalidEmailFormat ?? 'Please enter a valid email address.')
      return
    }
    if (emailGuardReason === 'blocked_domain') {
      setError(t.signup.invalidEmailDomain ?? 'Please use a real email inbox.')
      return
    }

    setStep1Busy(true)
    try {
      const eligibilityRes = await fetch('/api/auth/email-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      if (eligibilityRes.ok) {
        const eligibility = (await eligibilityRes.json()) as { blocked?: boolean }
        if (eligibility.blocked) {
          setError(
            t.signup.emailBlocked
              ?? 'This email cannot be used right now. Please use another email or contact support.',
          )
          return
        }
      }

      const registered = await fetchEmailRegistered(normalizedEmail)
      if (registered === false) {
        setNoAccount(true)
        return
      }

      const supabase = createClient()
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      if (nextPath) callbackUrl.searchParams.set('next', nextPath)
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: callbackUrl.toString(),
        },
      })

      if (otpErr) {
        setError(otpErr.message)
        return
      }

      setEmail(normalizedEmail)
      setOtp('')
      setStep(2)
    } finally {
      setStep1Busy(false)
    }
  }

  async function resendLoginOtp() {
    if (!email || resending) return
    setResending(true)
    setError('')
    setNoAccount(false)
    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (nextPath) callbackUrl.searchParams.set('next', nextPath)
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: callbackUrl.toString(),
      },
    })
    if (otpErr) {
      if (isLoginOtpNoExistingUserMessage(otpErr.message ?? '')) {
        setNoAccount(true)
      } else {
        setError(otpErr.message)
      }
    }
    setResending(false)
  }

  async function verifyOtpAndFinish(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNoAccount(false)
    const code = otp.replace(/\D/g, '')
    if (code.length !== otpLen) {
      setError(L.otpIncomplete)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error: vErr } = await verifyEmailOtpWithFallback(supabase, email, code)

    if (vErr || !data?.session?.user) {
      setError(vErr?.message ?? L.invalidOtp)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.session.user.id)
      .maybeSingle()

    window.location.href = profile ? (nextPath ?? '/') : '/onboarding'
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNoAccount(false)
    setLoading(true)
    const supabase = createClient()
    const normalized = normalizeEmail(email.trim())
    const { error: signErr, data } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    })
    if (signErr) {
      const low = signErr.message.toLowerCase()
      const invalidCreds =
        low.includes('invalid login credentials')
        || low.includes('invalid credentials')
        || (low.includes('invalid') && low.includes('email or password'))
      if (invalidCreds) {
        const registered = await fetchEmailRegistered(normalized)
        if (registered === false) {
          setNoAccount(true)
        } else if (registered === true) {
          setError(L.wrongPassword)
        } else {
          setError(signErr.message)
        }
      } else {
        setError(signErr.message)
      }
      setLoading(false)
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle()
    window.location.href = profile ? (nextPath ?? '/') : '/onboarding'
  }

  function goToPasswordLogin() {
    setError('')
    const el = emailRef.current
    if (el && !el.checkValidity()) {
      el.reportValidity()
      return
    }
    setEmail(normalizeEmail(email.trim()))
    setPassword('')
    setStep('pw')
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#eef0f3] px-4 py-10 sm:py-14">
      <div
        className="w-full max-w-[420px] rounded-3xl border border-gray-200/80 bg-white px-6 py-8 sm:px-10 sm:py-9"
        style={{ boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)' }}
      >
        <AuthMark />
        <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl">{L.title}</h1>
        <div className="mx-auto mt-0.5 max-w-[16.25rem] text-balance sm:max-w-md">
          <p className="text-center text-[11px] leading-snug text-gray-500 sm:text-xs">{L.subtitle}</p>
          {step === 1 ? (
            <p className="mt-1 text-center text-[11px] leading-snug text-gray-600 sm:text-xs">{L.step1Intro}</p>
          ) : step === 2 ? (
            <p className="mt-1 text-center text-[11px] leading-snug text-gray-600 sm:text-xs">{L.step2Intro}</p>
          ) : (
            <p className="mt-1 text-center text-[11px] leading-snug text-gray-600 sm:text-xs">{L.passwordStepIntro}</p>
          )}
        </div>

        {passwordJustReset && (
          <div
            className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
            role="status"
          >
            {L.passwordResetSuccess}
          </div>
        )}

        {noAccount && (
          <div
            className="mt-3 flex gap-2.5 rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-800" aria-hidden>
              !
            </span>
            <p className="min-w-0 leading-snug">
              {L.accountNotFoundIntro}{' '}
              <Link
                href={signupHref}
                className="font-semibold text-blue-700 underline decoration-blue-600/40 underline-offset-2 hover:text-blue-900"
              >
                {L.accountNotFoundLink}
              </Link>
              .
            </p>
          </div>
        )}

        {error && !noAccount && (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="mt-3 sm:mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="login-email" className="text-sm font-semibold text-gray-900">
                {L.email}
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                {L.forgotPassword}
              </Link>
            </div>
            <input
              id="login-email"
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                setNoAccount(false)
              }}
              placeholder={L.placeholder.email}
              className="w-full rounded-xl border border-gray-200 bg-[#f0f7ff]/60 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              disabled={step1Busy}
              onClick={() => void sendLoginOtp()}
              className={`mt-5 w-full rounded-full bg-gray-900 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800 active:scale-[0.99] ${step1Busy ? 'opacity-60' : ''}`}
            >
              {step1Busy ? L.sendingCode : L.continue}
            </button>
            <button
              type="button"
              onClick={goToPasswordLogin}
              className="mt-3 w-full text-center text-sm font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
            >
              {L.usePasswordInstead}
            </button>
          </div>
        ) : step === 'pw' ? (
          <form onSubmit={e => void handlePasswordLogin(e)} className="mt-3 sm:mt-4">
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="login-password-email" className="text-sm font-semibold text-gray-900">
                  {L.email}
                </label>
              </div>
              <input
                id="login-password-email"
                ref={emailRef}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setNoAccount(false)
                }}
                placeholder={L.placeholder.email}
                className="w-full rounded-xl border border-gray-200 bg-[#f0f7ff]/60 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="login-password" className="text-sm font-semibold text-gray-900">
                  {L.password}
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                  {L.forgotPassword}
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={L.placeholder.password}
                className="w-full rounded-xl border border-gray-200 bg-[#f0f7ff]/60 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`mt-5 w-full rounded-full py-3.5 text-sm font-bold text-white transition active:scale-[0.99] ${loading ? 'opacity-60' : 'hover:opacity-95'}`}
              style={{ background: 'linear-gradient(90deg,#111827,#1f2937)' }}
            >
              {loading ? L.submitting : L.submit}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setOtp('')
                setPassword('')
                setError('')
                setNoAccount(false)
              }}
              className="mt-3 w-full text-center text-sm font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
            >
              {useCodeInsteadLabel}
            </button>
          </form>
        ) : (
          <form onSubmit={e => void verifyOtpAndFinish(e)} className="mt-3 sm:mt-4">
            <p className="text-center text-xs font-medium text-gray-900 sm:text-sm">{L.signingInAs(email)}</p>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setOtp('')
                setError('')
                setNoAccount(false)
              }}
              className="mt-3 w-full text-center text-sm font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
            >
              {L.back}
            </button>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{L.otpLabel}</span>
                <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                  {L.forgotPassword}
                </Link>
              </div>
              <OtpDigitInput
                id="login-otp"
                length={otpLen}
                value={otp}
                onChange={setOtp}
                disabled={loading}
                groupAriaLabel={L.otpAria}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.replace(/\D/g, '').length !== otpLen}
              className={`mt-6 w-full rounded-full py-3.5 text-sm font-bold text-white transition active:scale-[0.99] ${loading || otp.replace(/\D/g, '').length !== otpLen ? 'opacity-60' : 'hover:opacity-95'}`}
              style={{ background: 'linear-gradient(90deg,#111827,#1f2937)' }}
            >
              {loading ? L.verifyingOtp : L.submit}
            </button>

            <p className="mt-4 text-center text-[11px] text-gray-500 sm:text-xs">{L.otpResendHint}</p>
            <button
              type="button"
              onClick={() => void resendLoginOtp()}
              disabled={resending}
              className="mt-1 w-full text-center text-sm font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-2 disabled:opacity-60"
            >
              {resending ? L.resendingOtp : L.resendOtp}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-600 sm:text-sm">
          {L.noAccount}{' '}
          <Link
            href={signupHref}
            className="font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
          >
            {L.signup}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-full flex flex-1 items-center justify-center bg-[#eef0f3] px-4 py-10" />}>
      <LoginPageContent />
    </Suspense>
  )
}
