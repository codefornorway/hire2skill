import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { SERVER_ENV } from '@/lib/env/server'

export async function GET() {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(
      {
        ok: true,
        env: {
          required: {
            NEXT_PUBLIC_SUPABASE_URL: Boolean(SERVER_ENV.NEXT_PUBLIC_SUPABASE_URL),
            NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(SERVER_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          },
          server: {
            SUPABASE_SERVICE_ROLE_KEY: Boolean(SERVER_ENV.SUPABASE_SERVICE_ROLE_KEY),
            RESEND_API_KEY: Boolean(SERVER_ENV.RESEND_API_KEY),
            VAPID_PRIVATE_KEY: Boolean(SERVER_ENV.VAPID_PRIVATE_KEY),
          },
          publicOptional: {
            NEXT_PUBLIC_VAPID_PUBLIC_KEY: Boolean(SERVER_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
            NEXT_PUBLIC_SITE_URL: Boolean(SERVER_ENV.NEXT_PUBLIC_SITE_URL),
            NEXT_PUBLIC_APP_URL: Boolean(SERVER_ENV.NEXT_PUBLIC_APP_URL),
          },
        },
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json({ error: 'Failed to read env health' }, { status: 500 })
  }
}
