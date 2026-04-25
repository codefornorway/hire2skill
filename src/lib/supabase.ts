import { createClient } from '@supabase/supabase-js'
import { getPublicSupabaseEnv } from '@/lib/env/public'

const { url, anonKey } = getPublicSupabaseEnv()

export const supabase = createClient(
  url,
  anonKey,
)
