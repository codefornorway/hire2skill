import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl.startsWith('your_')) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
}
if (!supabaseAnonKey || supabaseAnonKey.startsWith('your_')) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
