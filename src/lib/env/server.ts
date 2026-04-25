import 'server-only'
import { PUBLIC_ENV, getPublicSupabaseEnv } from '@/lib/env/public'

function requiredServerEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.startsWith('your_')) {
    throw new Error(`Missing required server environment variable: ${name}`)
  }
  return value
}

function optionalServerEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && !value.startsWith('your_') ? value : undefined
}

export const SERVER_ENV = {
  ...PUBLIC_ENV,
  SUPABASE_SERVICE_ROLE_KEY: optionalServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
  RESEND_API_KEY: optionalServerEnv('RESEND_API_KEY'),
  VAPID_PRIVATE_KEY: optionalServerEnv('VAPID_PRIVATE_KEY'),
}

export function getSupabaseServiceEnv() {
  const { url } = getPublicSupabaseEnv()
  return {
    url,
    serviceRoleKey: requiredServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
  }
}
