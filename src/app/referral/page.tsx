import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReferralContent from './ReferralContent'

export const metadata = {
  title: 'Refer a friend — Hire2Skill',
  description: 'Invite friends to Hire2Skill and earn 100 NOK credit for every friend who completes their first booking.',
}

export default async function ReferralPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/referral')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return <ReferralContent userId={user.id} displayName={profile?.display_name ?? null} />
}
