import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardContent from './DashboardContent'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { posted } = await searchParams

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, category, location, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardContent
      email={user.email ?? ''}
      postCount={postCount ?? 0}
      recentPosts={recentPosts ?? []}
      posted={posted === '1'}
    />
  )
}
