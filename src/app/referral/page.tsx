import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReferralContent from './ReferralContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refer a friend — SkillLink',
  description: 'Invite friends to SkillLink and earn 100 NOK credit for every friend who completes their first booking.',
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
