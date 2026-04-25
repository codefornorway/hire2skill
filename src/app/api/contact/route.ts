import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, isRateLimited, isValidEmail, sanitizeHtml } from '@/lib/api-security'
import { SERVER_ENV } from '@/lib/env/server'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (isRateLimited('contact', ip, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const payload = await req.json()
    const name = typeof payload?.name === 'string' ? payload.name.trim() : ''
    const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : ''
    const subject = typeof payload?.subject === 'string' ? payload.subject.trim() : ''
    const message = typeof payload?.message === 'string' ? payload.message.trim() : ''

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (name.length > 120 || subject.length > 180 || message.length > 5000) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const RESEND_API_KEY = SERVER_ENV.RESEND_API_KEY
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service is not configured' }, { status: 503 })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SkillLink Contact <no-reply@skilllink.no>',
        to: 'asmakhanasma@hotmail.co.uk',
        reply_to: sanitizeHtml(email),
        subject: `[Contact] ${sanitizeHtml(subject || 'General question')} - from ${sanitizeHtml(name)}`,
        html: `
          <p><strong>From:</strong> ${sanitizeHtml(name)} &lt;${sanitizeHtml(email)}&gt;</p>
          <p><strong>Subject:</strong> ${sanitizeHtml(subject || 'General question')}</p>
          <hr/>
          <p style="white-space:pre-wrap">${sanitizeHtml(message)}</p>
        `,
      }),
    })
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
