import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import webpush from 'web-push'
import { getClientIp, isRateLimited, sanitizeHtml } from '@/lib/api-security'
import { SERVER_ENV, getSupabaseServiceEnv } from '@/lib/env/server'
import { logServerEvent } from '@/lib/telemetry'

const RESEND_API_KEY = SERVER_ENV.RESEND_API_KEY
const APP_URL = SERVER_ENV.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const FROM = 'SkillLink <no-reply@skilllink.no>'

function configurePush() {
  const publicKey = SERVER_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = SERVER_ENV.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails('mailto:support@skilllink.no', publicKey, privateKey)
  return true
}

type PushSub = { endpoint: string; p256dh: string; auth: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendPush(userId: string, admin: any, payload: { title: string; body: string; url: string }) {
  try {
    const { data } = await admin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId)
    const subs = (data ?? []) as PushSub[]
    if (!subs.length) return
    await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        )
      ),
    )
  } catch (err) {
    logServerEvent('notify.push', 'warn', 'Failed to send push notification', { userId, error: String(err) })
  }
}

function layout(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 36px;">
    <span style="color:#fff;font-size:22px;font-weight:700;">SkillLink</span>
  </td></tr>
  <tr><td style="padding:32px 36px;color:#18181b;font-size:15px;line-height:1.6;">${body}</td></tr>
  <tr><td style="padding:20px 36px;background:#f4f4f5;color:#71717a;font-size:12px;">
    © 2026 SkillLink. You received this because you have an account on SkillLink.
  </td></tr>
</table></td></tr></table></body></html>`
}

function btn(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 28px;
    background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:15px;
    font-weight:600;text-decoration:none;border-radius:8px;">${label}</a>`
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = await createSupabaseClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(req)
    if (isRateLimited('notify', `${user.id}:${ip}`, 40, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service is not configured' }, { status: 503 })
    }
    const { url, serviceRoleKey } = getSupabaseServiceEnv()

    const body = await req.json()
    const type = typeof body?.type === 'string' ? body.type : ''
    const bookingId = typeof body?.bookingId === 'string' ? body.bookingId : ''
    const bookingData = body?.bookingData ?? {}
    const senderId = typeof body?.senderId === 'string' ? body.senderId : ''
    const msgBookingId = typeof body?.bookingId === 'string' ? body.bookingId : ''
    const preview = typeof body?.preview === 'string' ? body.preview.trim() : ''

    if (!['new-booking', 'booking-accepted', 'new-message'].includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // Use service role to read emails
    const supabase = createClient(
      url,
      serviceRoleKey,
    )

    if (type === 'new-booking') {
      if (!bookingId) {
        return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
      }
      const helperId = typeof bookingData?.helper_id === 'string' ? bookingData.helper_id : ''
      if (!helperId) {
        return NextResponse.json({ error: 'Missing helper_id' }, { status: 400 })
      }
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, poster_id, helper_id')
        .eq('id', bookingId)
        .single()
      if (!booking || booking.poster_id !== user.id || booking.helper_id !== helperId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const [{ data: helperAuth }, { data: poster }] = await Promise.all([
        supabase.auth.admin.getUserById(booking.helper_id),
        supabase.from('profiles').select('display_name').eq('id', booking.poster_id).single(),
      ])
      const helperEmail = helperAuth?.user?.email
      if (!helperEmail) return NextResponse.json({ ok: true })
      const posterName = sanitizeHtml(poster?.display_name ?? 'Someone')
      const subject = `New task request from ${posterName}`
      await Promise.all([
        sendEmail(helperEmail, subject, layout(`
          <p style="margin:0 0 16px;">
            <strong>${posterName}</strong> has sent you a booking request on SkillLink.
          </p>
          <p>Log in to accept or decline.</p>
          ${btn('View Request', `${APP_URL}/dashboard`)}
        `)),
        configurePush() ? sendPush(booking.helper_id, supabase, {
          title: `New request from ${posterName}`,
          body: 'Tap to view and accept the booking.',
          url: '/dashboard',
        }) : Promise.resolve(),
      ])
    }

    else if (type === 'booking-accepted') {
      const bookingIdForAccept = typeof bookingData?.id === 'string' ? bookingData.id : ''
      if (!bookingIdForAccept) {
        return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
      }
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, poster_id, helper_id')
        .eq('id', bookingIdForAccept)
        .single()
      if (!booking || booking.helper_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const [{ data: posterAuth }, { data: helper }] = await Promise.all([
        supabase.auth.admin.getUserById(booking.poster_id),
        supabase.from('profiles').select('display_name').eq('id', booking.helper_id).single(),
      ])
      const posterEmail = posterAuth?.user?.email
      if (!posterEmail) return NextResponse.json({ ok: true })
      const helperName = sanitizeHtml(helper?.display_name ?? 'Your helper')
      const subject = `${helperName} accepted your request!`
      await Promise.all([
        sendEmail(posterEmail, subject, layout(`
          <p style="margin:0 0 16px;">
            <strong>${helperName}</strong> accepted your booking request on SkillLink.
          </p>
          <p>You can now chat with ${helperName}.</p>
          ${btn('Open Chat', `${APP_URL}/chat/${booking.id}`)}
        `)),
        configurePush() ? sendPush(booking.poster_id, supabase, {
          title: `${helperName} accepted your booking!`,
          body: 'Tap to open the chat.',
          url: `/chat/${booking.id}`,
        }) : Promise.resolve(),
      ])
    }

    else if (type === 'new-message') {
      if (!msgBookingId || !senderId || senderId !== user.id) {
        return NextResponse.json({ error: 'Invalid sender or booking' }, { status: 400 })
      }
      const { data: booking } = await supabase
        .from('bookings').select('poster_id, helper_id').eq('id', msgBookingId).single()
      if (!booking) return NextResponse.json({ ok: true })
      if (user.id !== booking.poster_id && user.id !== booking.helper_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const recipientId = senderId === booking.poster_id ? booking.helper_id : booking.poster_id
      const [{ data: recipientAuth }, { data: sender }] = await Promise.all([
        supabase.auth.admin.getUserById(recipientId),
        supabase.from('profiles').select('display_name').eq('id', senderId).single(),
      ])
      const recipientEmail = recipientAuth?.user?.email
      if (!recipientEmail) return NextResponse.json({ ok: true })
      const senderName = sanitizeHtml(sender?.display_name ?? 'Someone')
      const safePreview = sanitizeHtml(preview).slice(0, 120)
      const subject = `New message from ${senderName}`
      await Promise.all([
        sendEmail(recipientEmail, subject, layout(`
          <p style="margin:0 0 8px;">You have a new message from <strong>${senderName}</strong>.</p>
          ${safePreview ? `<blockquote style="margin:16px 0;padding:12px 16px;background:#f4f4f5;
            border-left:3px solid #8b5cf6;border-radius:0 6px 6px 0;color:#3f3f46;font-style:italic;">
            "${safePreview}${preview.length > 120 ? '…' : ''}"</blockquote>` : ''}
          ${btn('Reply', `${APP_URL}/chat/${msgBookingId}`)}
        `)),
        configurePush() ? sendPush(recipientId, supabase, {
          title: `${senderName} sent you a message`,
          body: safePreview ? safePreview.slice(0, 100) : 'Tap to reply.',
          url: `/chat/${msgBookingId}`,
        }) : Promise.resolve(),
      ])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logServerEvent('notify.route', 'error', 'Unhandled notify error', { error: String(err) })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
