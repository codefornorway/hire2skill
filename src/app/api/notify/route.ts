import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const RESEND_API_KEY = process.env.RESEND_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const FROM = 'SkillLink <no-reply@skilllink.no>'

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
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

export async function POST(req: NextRequest) {
  try {
    if (!RESEND_API_KEY) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })

    const body = await req.json()
    const { type, bookingId } = body

    // Use service role to read emails
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    if (type === 'new-booking') {
      const { bookingData } = body
      // bookingData: { helper_id, poster_id, title? }
      const [{ data: helperAuth }, { data: poster }] = await Promise.all([
        supabase.auth.admin.getUserById(bookingData.helper_id),
        supabase.from('profiles').select('display_name').eq('id', bookingData.poster_id).single(),
      ])
      const helperEmail = helperAuth?.user?.email
      if (!helperEmail) return NextResponse.json({ ok: true })
      const posterName = poster?.display_name ?? 'Someone'
      const subject = `New task request from ${posterName}`
      await sendEmail(helperEmail, subject, layout(`
        <p style="margin:0 0 16px;">
          <strong>${posterName}</strong> has sent you a booking request on SkillLink.
        </p>
        <p>Log in to accept or decline.</p>
        ${btn('View Request', `${APP_URL}/dashboard`)}
      `))
    }

    else if (type === 'booking-accepted') {
      const { bookingData } = body
      // bookingData: { poster_id, helper_id, id, title? }
      const [{ data: posterAuth }, { data: helper }] = await Promise.all([
        supabase.auth.admin.getUserById(bookingData.poster_id),
        supabase.from('profiles').select('display_name').eq('id', bookingData.helper_id).single(),
      ])
      const posterEmail = posterAuth?.user?.email
      if (!posterEmail) return NextResponse.json({ ok: true })
      const helperName = helper?.display_name ?? 'Your helper'
      const subject = `${helperName} accepted your request!`
      await sendEmail(posterEmail, subject, layout(`
        <p style="margin:0 0 16px;">
          <strong>${helperName}</strong> accepted your booking request on SkillLink.
        </p>
        <p>You can now chat with ${helperName}.</p>
        ${btn('Open Chat', `${APP_URL}/chat/${bookingData.id}`)}
      `))
    }

    else if (type === 'new-message') {
      const { senderId, bookingId: msgBookingId, preview } = body
      const { data: booking } = await supabase
        .from('bookings').select('poster_id, helper_id').eq('id', msgBookingId).single()
      if (!booking) return NextResponse.json({ ok: true })
      const recipientId = senderId === booking.poster_id ? booking.helper_id : booking.poster_id
      const [{ data: recipientAuth }, { data: sender }] = await Promise.all([
        supabase.auth.admin.getUserById(recipientId),
        supabase.from('profiles').select('display_name').eq('id', senderId).single(),
      ])
      const recipientEmail = recipientAuth?.user?.email
      if (!recipientEmail) return NextResponse.json({ ok: true })
      const senderName = sender?.display_name ?? 'Someone'
      const subject = `New message from ${senderName}`
      await sendEmail(recipientEmail, subject, layout(`
        <p style="margin:0 0 8px;">You have a new message from <strong>${senderName}</strong>.</p>
        ${preview ? `<blockquote style="margin:16px 0;padding:12px 16px;background:#f4f4f5;
          border-left:3px solid #8b5cf6;border-radius:0 6px 6px 0;color:#3f3f46;font-style:italic;">
          "${preview.slice(0, 120)}${preview.length > 120 ? '…' : ''}"</blockquote>` : ''}
        ${btn('Reply', `${APP_URL}/chat/${msgBookingId}`)}
      `))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
