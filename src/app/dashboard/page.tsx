import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardContent from './DashboardContent'

export type Post = {
  id: string
  title: string
  category: string
  location: string
  status: string
  created_at: string
}

export type BookingItem = {
  id: string
  created_at: string
  status: string
  message: string
  post_id: string | null
  post_title: string | null
  post_category: string | null
  post_location: string | null
  scheduled_date: string | null
  budget: number | null
  poster_id: string
  helper_id: string
  other_display_name: string | null
  other_avatar_url: string | null
  has_review: boolean
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string; requestSent?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { posted, requestSent } = await searchParams

  const [{ count: postCount }, { data: recentPosts }, { data: profile }] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('posts').select('id, title, category, location, status, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('profiles').select('role').eq('id', user.id).single(),
  ])

  const role = (profile?.role ?? null) as 'helper' | 'poster' | null

  let bookings: BookingItem[] = []

  try {
    if (role === 'helper') {
      const { data: raw } = await supabase
        .from('bookings')
        .select('*')
        .eq('helper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (raw && raw.length > 0) {
        // Always keep base bookings visible, even if enrichment queries fail.
        bookings = raw.map((b: any) => ({
          id: b.id,
          created_at: b.created_at,
          status: b.status,
          message: b.message ?? '',
          post_id: b.post_id ?? null,
          post_title: null,
          post_category: null,
          post_location: null,
          scheduled_date: b.scheduled_date ?? null,
          budget: b.budget ?? null,
          poster_id: b.poster_id,
          helper_id: b.helper_id,
          other_display_name: null,
          other_avatar_url: null,
          has_review: false,
        }))

        const ids = [...new Set(raw.map(b => b.poster_id))]
        const postIds = [...new Set(raw.map(b => b.post_id).filter(Boolean) as string[])]
        const { data: profiles } = await supabase
          .from('profiles').select('id, display_name, avatar_url').in('id', ids)
        const { data: posts } = postIds.length > 0
          ? await supabase.from('posts').select('id, title, category, location').in('id', postIds)
          : { data: [] as { id: string; title: string | null; category: string | null; location: string | null }[] }
        const map = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
        const postMap = Object.fromEntries((posts ?? []).map(p => [p.id, p]))
        bookings = bookings.map((b) => ({
          id: b.id,
          created_at: b.created_at,
          status: b.status,
          message: b.message ?? '',
          post_id: b.post_id ?? null,
          post_title: b.post_id ? postMap[b.post_id]?.title ?? null : null,
          post_category: b.post_id ? postMap[b.post_id]?.category ?? null : null,
          post_location: b.post_id ? postMap[b.post_id]?.location ?? null : null,
          scheduled_date: b.scheduled_date ?? null,
          budget: b.budget ?? null,
          poster_id: b.poster_id,
          helper_id: b.helper_id,
          other_display_name: map[b.poster_id]?.display_name ?? null,
          other_avatar_url: map[b.poster_id]?.avatar_url ?? null,
          has_review: false,
        }))
      }
    } else {
      const { data: raw } = await supabase
        .from('bookings')
        .select('*')
        .eq('poster_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (raw && raw.length > 0) {
        // Always keep base bookings visible, even if enrichment queries fail.
        bookings = raw.map((b: any) => ({
          id: b.id,
          created_at: b.created_at,
          status: b.status,
          message: b.message ?? '',
          post_id: b.post_id ?? null,
          post_title: null,
          post_category: null,
          post_location: null,
          scheduled_date: b.scheduled_date ?? null,
          budget: b.budget ?? null,
          poster_id: b.poster_id,
          helper_id: b.helper_id,
          other_display_name: null,
          other_avatar_url: null,
          has_review: false,
        }))

        const ids = [...new Set(raw.map(b => b.helper_id))]
        const postIds = [...new Set(raw.map(b => b.post_id).filter(Boolean) as string[])]
        const { data: profiles } = await supabase
          .from('profiles').select('id, display_name, avatar_url').in('id', ids)
        const { data: posts } = postIds.length > 0
          ? await supabase.from('posts').select('id, title, category, location').in('id', postIds)
          : { data: [] as { id: string; title: string | null; category: string | null; location: string | null }[] }
        const map = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
        const postMap = Object.fromEntries((posts ?? []).map(p => [p.id, p]))
        bookings = bookings.map((b) => ({
          id: b.id,
          created_at: b.created_at,
          status: b.status,
          message: b.message ?? '',
          post_id: b.post_id ?? null,
          post_title: b.post_id ? postMap[b.post_id]?.title ?? null : null,
          post_category: b.post_id ? postMap[b.post_id]?.category ?? null : null,
          post_location: b.post_id ? postMap[b.post_id]?.location ?? null : null,
          scheduled_date: b.scheduled_date ?? null,
          budget: b.budget ?? null,
          poster_id: b.poster_id,
          helper_id: b.helper_id,
          other_display_name: map[b.helper_id]?.display_name ?? null,
          other_avatar_url: map[b.helper_id]?.avatar_url ?? null,
          has_review: false,
        }))
      }
    }
  } catch {
    // bookings table not yet created — degrade gracefully
  }

  // Mark which completed bookings the current user has already reviewed
  try {
    const completedIds = bookings.filter(b => b.status === 'completed').map(b => b.id)
    if (completedIds.length > 0) {
      const { data: done } = await supabase
        .from('reviews').select('booking_id')
        .eq('reviewer_id', user.id).in('booking_id', completedIds)
      const reviewed = new Set((done ?? []).map(r => r.booking_id))
      bookings = bookings.map(b => ({ ...b, has_review: reviewed.has(b.id) }))
    }
  } catch {
    // reviews table not yet created
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <DashboardContent
      email={user.email ?? ''}
      postCount={postCount ?? 0}
      recentPosts={recentPosts ?? []}
      posted={posted === '1'}
      requestSent={requestSent === '1'}
      role={role}
      bookings={bookings}
      pendingCount={pendingCount}
      currentUserId={user.id}
    />
  )
}
