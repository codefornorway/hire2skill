function clean(value: string | undefined): string | undefined {
  return value && !value.startsWith('your_') ? value : undefined
}

export const PUBLIC_ENV = {
  NEXT_PUBLIC_SUPABASE_URL:     clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: clean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
  NEXT_PUBLIC_SITE_URL:         clean(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_APP_URL:          clean(process.env.NEXT_PUBLIC_APP_URL),
}

function requireValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getPublicSupabaseEnv() {
  return {
    url: requireValue('NEXT_PUBLIC_SUPABASE_URL', PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: requireValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  }
}
