import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getClientIp, isRateLimited } from '@/lib/api-security'
import { getSupabaseServiceEnv } from '@/lib/env/server'

// Save a push subscription for the current user
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (isRateLimited('push-post', ip, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await req.json()
  const endpoint = typeof payload?.endpoint === 'string' ? payload.endpoint.trim() : ''
  const p256dh = typeof payload?.p256dh === 'string' ? payload.p256dh.trim() : ''
  const auth = typeof payload?.auth === 'string' ? payload.auth.trim() : ''
  const isHttpsEndpoint = endpoint.startsWith('https://')
  if (!endpoint || !p256dh || !auth || !isHttpsEndpoint)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (endpoint.length > 1024 || p256dh.length > 256 || auth.length > 256) {
    return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 })
  }
  const { url, serviceRoleKey } = getSupabaseServiceEnv()

  const admin = createAdminClient(
    url,
    serviceRoleKey,
  )

  await admin.from('push_subscriptions').upsert(
    { user_id: user.id, endpoint, p256dh, auth },
    { onConflict: 'endpoint' },
  )

  return NextResponse.json({ ok: true })
}

// Remove a push subscription (called on SW unregister)
export async function DELETE(req: NextRequest) {
  const ip = getClientIp(req)
  if (isRateLimited('push-delete', ip, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await req.json()
  const endpoint = typeof payload?.endpoint === 'string' ? payload.endpoint.trim() : ''
  if (!endpoint || endpoint.length > 1024) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }
  const { url, serviceRoleKey } = getSupabaseServiceEnv()

  const admin = createAdminClient(
    url,
    serviceRoleKey,
  )
  await admin.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
