import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import webpush from 'web-push'
import { getClientIp, isRateLimited, sanitizeHtml } from '@/lib/api-security'
import { SERVER_ENV, getSupabaseServiceEnv } from '@/lib/env/server'
import { logServerEvent } from '@/lib/telemetry'
import {
  pushBookingAccepted,
  pushBookingDeclined,
  pushNewMessage,
} from '@/lib/notify/push-copy-no'

const RESEND_API_KEY = SERVER_ENV.RESEND_API_KEY
const APP_URL =
  SERVER_ENV.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === 'production' ? null : 'http://localhost:3000')
const FROM = 'Hire2Skill <no-reply@hire2skill.com>'

function configurePush() {
  const publicKey = SERVER_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = SERVER_ENV.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails('mailto:support@hire2skill.com', publicKey, privateKey)
  return true
}

type NotifyChannels = { email: boolean; push: boolean }
type MailLocale = 'no' | 'en' | 'da' | 'sv'
type MarketingRecipient = { id: string; email: string; name: string; locale: MailLocale }

/** Respect profile toggles; null/missing profile JSON defaults to both channels on (legacy). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadNotifyChannels(admin: any, userId: string): Promise<NotifyChannels> {
  const { data } = await admin.from('profiles').select('notifications').eq('id', userId).single()
  const raw = data?.notifications
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { email: true, push: true }
  }
  const n = raw as Record<string, unknown>
  return {
    email: n.task_email !== false,
    push: n.task_push !== false,
  }
}

/** Web push opens the in-app notifications screen; optional ?next= deep link. */
function pushLandingUrl(relatedPath: string): string {
  const path = relatedPath.startsWith('/') ? relatedPath : `/${relatedPath}`
  return `/notifications?next=${encodeURIComponent(path)}`
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

function actionBlock(label: string, href: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 8px;">
      <tr>
        <td style="border-radius:8px;background:#4f46e5;">
          <a href="${href}" target="_blank" rel="noopener noreferrer"
            style="display:inline-block;padding:12px 22px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:8px 0 0;color:#52525b;font-size:12px;line-height:1.5;">
      If the button does not work, open this link:<br/>
      <a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;word-break:break-all;">${href}</a>
    </p>
  `
}

function layout(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 36px;">
    <span style="color:#fff;font-size:22px;font-weight:700;">Hire2Skill</span>
  </td></tr>
  <tr><td style="padding:32px 36px;color:#18181b;font-size:15px;line-height:1.6;">${body}</td></tr>
  <tr><td style="padding:20px 36px;background:#f4f4f5;color:#71717a;font-size:12px;">
    © 2026 Hire2Skill. You received this because you have an account on Hire2Skill.
  </td></tr>
</table></td></tr></table></body></html>`
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    const providerBody = await res.text()
    logServerEvent('notify.email', 'warn', 'Email provider rejected request', {
      status: res.status,
      providerBody,
    })
    if (res.status === 401) throw new Error('EMAIL_PROVIDER_AUTH_FAILED')
    if (res.status === 403) throw new Error('EMAIL_PROVIDER_SENDER_FORBIDDEN')
    throw new Error(`EMAIL_PROVIDER_HTTP_${res.status}`)
  }
  return true
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadMarketingRecipients(admin: any, excludeUserId?: string): Promise<MarketingRecipient[]> {
  const allUsers: Array<{ id?: string; email?: string | null }> = []
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data?.users ?? []
    allUsers.push(...users)
    if (users.length < perPage) break
    page += 1
  }

  const withEmail = allUsers.filter((u) => u.id && u.email)
  const ids = withEmail.map((u) => u.id as string)
  if (!ids.length) return []

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name, notifications, languages')
    .in('id', ids)

  const profileById = new Map<string, { display_name: string | null; notifications: unknown; languages: string[] | null }>()
  for (const p of (profiles ?? []) as Array<{ id: string; display_name: string | null; notifications: unknown; languages: string[] | null }>) {
    profileById.set(p.id, { display_name: p.display_name, notifications: p.notifications, languages: p.languages })
  }

  const recipients: MarketingRecipient[] = []
  for (const u of withEmail) {
    const userId = u.id as string
    if (excludeUserId && userId === excludeUserId) continue
    const p = profileById.get(userId)
    const raw = p?.notifications
    const promoEmailEnabled =
      raw == null || typeof raw !== 'object' || Array.isArray(raw)
        ? true
        : (raw as Record<string, unknown>).promo_email !== false
    if (!promoEmailEnabled) continue
    const primary = (p?.languages?.[0] ?? '').toLowerCase()
    const locale: MailLocale =
      primary === 'no' || primary === 'nb' || primary === 'nn'
        ? 'no'
        : primary === 'da'
          ? 'da'
          : primary === 'sv'
            ? 'sv'
            : 'en'
    recipients.push({
      id: userId,
      email: u.email as string,
      name: p?.display_name?.trim() || 'there',
      locale,
    })
  }
  return recipients
}

async function sendMarketingBroadcast(
  recipients: MarketingRecipient[],
  subject: string,
  renderBody: (recipient: MarketingRecipient) => string,
) {
  if (!APP_URL || !RESEND_API_KEY || recipients.length === 0) return
  for (const group of chunk(recipients, 40)) {
    await Promise.allSettled(
      group.map((recipient) =>
        sendEmail(recipient.email, subject, layout(renderBody(recipient))),
      ),
    )
  }
}

function tr(locale: MailLocale, key: string): string {
  const dict: Record<MailLocale, Record<string, string>> = {
    en: {
      hi: 'Hi',
      newJobPosted: 'A new job was posted on Hire2Skill.',
      browseJobs: 'Browse Jobs',
      newHelperJoined: 'A new helper has joined Hire2Skill.',
      findHelpers: 'Find Helpers',
    },
    no: {
      hi: 'Hei',
      newJobPosted: 'En ny jobb er lagt ut på Hire2Skill.',
      browseJobs: 'Se jobber',
      newHelperJoined: 'En ny hjelper har blitt med på Hire2Skill.',
      findHelpers: 'Finn hjelpere',
    },
    da: {
      hi: 'Hej',
      newJobPosted: 'Et nyt job er blevet lagt op på Hire2Skill.',
      browseJobs: 'Se job',
      newHelperJoined: 'En ny hjælper er kommet til Hire2Skill.',
      findHelpers: 'Find hjælpere',
    },
    sv: {
      hi: 'Hej',
      newJobPosted: 'Ett nytt jobb har lagts upp på Hire2Skill.',
      browseJobs: 'Utforska jobb',
      newHelperJoined: 'En ny hjälpare har gått med i Hire2Skill.',
      findHelpers: 'Hitta hjälpare',
    },
  }
  return dict[locale][key] ?? dict.en[key] ?? key
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

    let serviceEnv: { url: string; serviceRoleKey: string } | null = null
    try {
      serviceEnv = getSupabaseServiceEnv()
    } catch (err) {
      logServerEvent('notify.route', 'warn', 'Service role env missing; skipping email/push notify', {
        error: String(err),
      })
      return NextResponse.json({ ok: true, skipped: 'missing_service_role' })
    }

    const body = await req.json()
    const type = typeof body?.type === 'string' ? body.type : ''
    const bookingId = typeof body?.bookingId === 'string' ? body.bookingId : ''
    const bookingData = body?.bookingData ?? {}
    const senderId = typeof body?.senderId === 'string' ? body.senderId : ''
    const msgBookingId = typeof body?.bookingId === 'string' ? body.bookingId : ''
    const preview = typeof body?.preview === 'string' ? body.preview.trim() : ''

    if (!['new-booking', 'booking-accepted', 'booking-declined', 'new-message', 'platform-new-job', 'platform-new-worker'].includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // Use service role to read emails
    const supabase = createClient(
      serviceEnv.url,
      serviceEnv.serviceRoleKey,
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
      const posterName = sanitizeHtml(poster?.display_name ?? 'Someone')
      const subject = `New task request from ${posterName}`
      const channels = await loadNotifyChannels(supabase, booking.helper_id)
      const tasks: Promise<unknown>[] = []
      if (helperEmail && APP_URL && channels.email) {
        const requestUrl = `${APP_URL}/dashboard`
        tasks.push(sendEmail(helperEmail, subject, layout(`
          <p style="margin:0 0 16px;">
            <strong>${posterName}</strong> has sent you a booking request on Hire2Skill.
          </p>
          <p>Log in to accept or decline.</p>
          ${actionBlock('View Request', requestUrl)}
        `)))
      }
      if (configurePush() && channels.push) {
        tasks.push(sendPush(booking.helper_id, supabase, {
          title: `New request from ${posterName}`,
          body: 'Tap to view and accept the booking.',
          url: pushLandingUrl('/dashboard'),
        }))
      }
      await Promise.all(tasks)
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
      if (!booking) return NextResponse.json({ ok: true })

      const actorRole = user.id === booking.helper_id ? 'helper' : user.id === booking.poster_id ? 'poster' : null
      if (!actorRole) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const actorId = user.id
      const recipientId = actorRole === 'helper' ? booking.poster_id : booking.helper_id

      const [{ data: recipientAuth }, { data: actorProfile }] = await Promise.all([
        supabase.auth.admin.getUserById(recipientId),
        supabase.from('profiles').select('display_name').eq('id', actorId).single(),
      ])

      const recipientEmail = recipientAuth?.user?.email
      const actorName = sanitizeHtml(actorProfile?.display_name ?? (actorRole === 'helper' ? 'Your helper' : 'Your customer'))
      const pushActor = actorProfile?.display_name?.trim() || (actorRole === 'helper' ? 'Hjelperen' : 'Kunden')

      const subject =
        actorRole === 'helper'
          ? `${actorName} accepted your request!`
          : `${actorName} accepted your proposal!`

      const channels = await loadNotifyChannels(supabase, recipientId)
      const tasks: Promise<unknown>[] = []
      const recipientEmailSafe = recipientEmail ?? ''
      const appUrlSafe = APP_URL ?? ''
      // Transactional emails should always be delivered to the recipient's registered email.
      // Profile toggles are respected for push notifications only.
      const canSendEmail = Boolean(recipientEmailSafe && appUrlSafe)
      if (!canSendEmail) {
        logServerEvent('notify.route', 'warn', 'Email skipped (booking-accepted)', {
          recipientId,
          recipientEmailPresent: Boolean(recipientEmailSafe),
          appUrlPresent: Boolean(appUrlSafe),
          taskEmailEnabled: channels.email,
          resendApiKeyPresent: Boolean(RESEND_API_KEY),
        })
      }
      if (canSendEmail) {
        const chatUrl = `${appUrlSafe}/chat/${booking.id}`
        tasks.push(sendEmail(recipientEmailSafe, subject, layout(`
          <p style="margin:0 0 16px;">
            <strong>${actorName}</strong> ${actorRole === 'helper' ? 'accepted your booking request' : 'accepted your proposal'} on Hire2Skill.
          </p>
          <p>You can now chat with ${actorName}.</p>
          ${actionBlock('Open Chat', chatUrl)}
        `)))
      }
      if (configurePush() && channels.push) {
        const p = pushBookingAccepted(pushActor)
        tasks.push(sendPush(recipientId, supabase, {
          title: p.title,
          body: p.body,
          url: pushLandingUrl(`/chat/${booking.id}`),
        }))
      }
      await Promise.all(tasks)
    }

    else if (type === 'booking-declined') {
      const bookingIdForDecline = typeof bookingData?.id === 'string' ? bookingData.id : ''
      if (!bookingIdForDecline) {
        return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
      }
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, poster_id, helper_id')
        .eq('id', bookingIdForDecline)
        .single()
      if (!booking) return NextResponse.json({ ok: true })

      const actorRole = user.id === booking.helper_id ? 'helper' : user.id === booking.poster_id ? 'poster' : null
      if (!actorRole) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const actorId = user.id
      const recipientId = actorRole === 'helper' ? booking.poster_id : booking.helper_id

      const [{ data: recipientAuth }, { data: actorProfile }] = await Promise.all([
        supabase.auth.admin.getUserById(recipientId),
        supabase.from('profiles').select('display_name').eq('id', actorId).single(),
      ])

      const recipientEmail = recipientAuth?.user?.email
      const actorName = sanitizeHtml(actorProfile?.display_name ?? (actorRole === 'helper' ? 'Your helper' : 'Your customer'))
      const pushActor = actorProfile?.display_name?.trim() || (actorRole === 'helper' ? 'Hjelperen' : 'Kunden')

      const subject = actorRole === 'helper' ? `${actorName} declined your request` : `${actorName} declined your proposal`
      const channels = await loadNotifyChannels(supabase, recipientId)
      const tasks: Promise<unknown>[] = []
      const recipientEmailSafe = recipientEmail ?? ''
      const appUrlSafe = APP_URL ?? ''
      // Transactional emails should always be delivered to the recipient's registered email.
      // Profile toggles are respected for push notifications only.
      const canSendEmail = Boolean(recipientEmailSafe && appUrlSafe)
      if (!canSendEmail) {
        logServerEvent('notify.route', 'warn', 'Email skipped (booking-declined)', {
          recipientId,
          recipientEmailPresent: Boolean(recipientEmailSafe),
          appUrlPresent: Boolean(appUrlSafe),
          taskEmailEnabled: channels.email,
          resendApiKeyPresent: Boolean(RESEND_API_KEY),
        })
      }
      if (canSendEmail) {
        const nextUrl = actorRole === 'helper' ? `${appUrlSafe}/taskers` : `${appUrlSafe}/jobs`
        tasks.push(sendEmail(recipientEmailSafe, subject, layout(`
          <p style="margin:0 0 16px;">
            <strong>${actorName}</strong> ${actorRole === 'helper' ? 'declined your booking request' : 'declined your proposal'} on Hire2Skill.
          </p>
          <p>
            ${actorRole === 'helper'
              ? 'You can browse more helpers and send a new request anytime.'
              : 'You can browse more jobs and send a new proposal anytime.'}
          </p>
          ${actionBlock(actorRole === 'helper' ? 'Find Helpers' : 'Browse Jobs', nextUrl)}
        `)))
      }
      if (configurePush() && channels.push) {
        const p = pushBookingDeclined(pushActor)
        tasks.push(sendPush(recipientId, supabase, {
          title: p.title,
          body: p.body,
          url: pushLandingUrl(`/chat/${booking.id}`),
        }))
      }
      await Promise.all(tasks)
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
      const senderName = sanitizeHtml(sender?.display_name ?? 'Someone')
      const pushSender = sender?.display_name?.trim() || 'Noen'
      const safePreview = sanitizeHtml(preview).slice(0, 120)
      const subject = `New message from ${senderName}`
      const channels = await loadNotifyChannels(supabase, recipientId)
      const tasks: Promise<unknown>[] = []
      const recipientEmailSafe = recipientEmail ?? ''
      const appUrlSafe = APP_URL ?? ''
      // Transactional emails should always be delivered to the recipient's registered email.
      // Profile toggles are respected for push notifications only.
      const canSendEmail = Boolean(recipientEmailSafe && appUrlSafe)
      if (!canSendEmail) {
        logServerEvent('notify.route', 'warn', 'Email skipped (new-message)', {
          recipientId,
          recipientEmailPresent: Boolean(recipientEmailSafe),
          appUrlPresent: Boolean(appUrlSafe),
          taskEmailEnabled: channels.email,
          resendApiKeyPresent: Boolean(RESEND_API_KEY),
        })
      }
      if (canSendEmail) {
        const replyUrl = `${appUrlSafe}/chat/${msgBookingId}`
        tasks.push(sendEmail(recipientEmailSafe, subject, layout(`
          <p style="margin:0 0 8px;">You have a new message from <strong>${senderName}</strong>.</p>
          ${safePreview ? `<blockquote style="margin:16px 0;padding:12px 16px;background:#f4f4f5;
            border-left:3px solid #8b5cf6;border-radius:0 6px 6px 0;color:#3f3f46;font-style:italic;">
            "${safePreview}${preview.length > 120 ? '…' : ''}"</blockquote>` : ''}
          ${actionBlock('Reply in Hire2Skill', replyUrl)}
        `)))
      }
      if (configurePush() && channels.push) {
        const p = pushNewMessage(pushSender, preview.slice(0, 120))
        tasks.push(sendPush(recipientId, supabase, {
          title: p.title,
          body: p.body,
          url: pushLandingUrl(`/chat/${msgBookingId}`),
        }))
      }
      await Promise.all(tasks)
    }

    else if (type === 'platform-new-job') {
      const postId = typeof bookingData?.post_id === 'string' ? bookingData.post_id : ''
      if (!postId) return NextResponse.json({ error: 'Missing post id' }, { status: 400 })

      const { data: post } = await supabase
        .from('posts')
        .select('id, user_id, title, category, location')
        .eq('id', postId)
        .single()
      if (!post || post.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const recipients = await loadMarketingRecipients(supabase, user.id)
      const safeTitle = sanitizeHtml((post.title ?? 'New job post').trim() || 'New job post')
      const safeCategory = sanitizeHtml((post.category ?? 'General').trim() || 'General')
      const safeLocation = sanitizeHtml((post.location ?? 'Norway').trim() || 'Norway')
      const browseUrl = `${APP_URL}/jobs`

      await sendMarketingBroadcast(
        recipients,
        `New job posted: ${safeTitle}`,
        (recipient) => `
          <p style="margin:0 0 12px;">${tr(recipient.locale, 'hi')} ${sanitizeHtml(recipient.name)},</p>
          <p style="margin:0 0 14px;">${tr(recipient.locale, 'newJobPosted')}</p>
          <div style="margin:14px 0;padding:14px 16px;border:1px solid #e4e4e7;border-radius:10px;background:#fafafa;">
            <p style="margin:0 0 4px;font-weight:700;color:#111827;">${safeTitle}</p>
            <p style="margin:0;color:#4b5563;font-size:13px;">${safeCategory} · ${safeLocation}</p>
          </div>
          ${actionBlock(tr(recipient.locale, 'browseJobs'), browseUrl)}
        `,
      )
    }

    else if (type === 'platform-new-worker') {
      const workerId = typeof bookingData?.worker_id === 'string' ? bookingData.worker_id : ''
      if (!workerId || workerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

      const { data: worker } = await supabase
        .from('profiles')
        .select('id, role, display_name, categories, location')
        .eq('id', workerId)
        .single()
      if (!worker || worker.role !== 'helper') {
        return NextResponse.json({ error: 'Invalid worker profile' }, { status: 400 })
      }

      const recipients = await loadMarketingRecipients(supabase, user.id)
      const workerName = sanitizeHtml((worker.display_name ?? 'A new helper').trim() || 'A new helper')
      const workerCategory = sanitizeHtml(((worker.categories as string[] | null)?.[0] ?? 'General help').trim())
      const workerLocation = sanitizeHtml((worker.location ?? 'Norway').trim() || 'Norway')
      const helpersUrl = `${APP_URL}/taskers`

      await sendMarketingBroadcast(
        recipients,
        `New helper joined Hire2Skill`,
        (recipient) => `
          <p style="margin:0 0 12px;">${tr(recipient.locale, 'hi')} ${sanitizeHtml(recipient.name)},</p>
          <p style="margin:0 0 14px;">${tr(recipient.locale, 'newHelperJoined')}</p>
          <div style="margin:14px 0;padding:14px 16px;border:1px solid #e4e4e7;border-radius:10px;background:#fafafa;">
            <p style="margin:0 0 4px;font-weight:700;color:#111827;">${workerName}</p>
            <p style="margin:0;color:#4b5563;font-size:13px;">${workerCategory} · ${workerLocation}</p>
          </div>
          ${actionBlock(tr(recipient.locale, 'findHelpers'), helpersUrl)}
        `,
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logServerEvent('notify.route', 'error', 'Unhandled notify error', { error: String(err) })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
