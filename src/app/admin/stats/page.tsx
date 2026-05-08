import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { getSupabaseServiceEnv } from '@/lib/env/server'
import AdminStatsContent from './AdminStatsContent'

export const dynamic = 'force-dynamic'

function countSince(users: { created_at: string }[] | null, days: number): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return (users ?? []).filter(u => new Date(u.created_at) > cutoff).length
}

export type PlatformStats = {
  totalHelpers: number
  totalPosters: number
  totalPosts: number
  openPosts: number
  totalBookings: number
  bookingsByStatus: Record<string, number>
  pendingVerifications: number
  verifiedHelpers: number
  totalReviews: number
  newUsersLast7Days: number
  newUsersLast30Days: number
}

export default async function AdminStatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  const { url, serviceRoleKey } = getSupabaseServiceEnv()
  const admin = createAdmin(url, serviceRoleKey)

  const [
    { count: totalHelpers },
    { count: totalPosters },
    { count: totalPosts },
    { count: openPosts },
    { count: totalBookings },
    { data: bookingStatuses },
    { count: pendingVerifications },
    { count: verifiedHelpers },
    { count: totalReviews },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'helper'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'poster'),
    admin.from('posts').select('*', { count: 'exact', head: true }),
    admin.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('bookings').select('*', { count: 'exact', head: true }),
    admin.from('bookings').select('status'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('verified', true),
    admin.from('reviews').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('created_at').order('created_at', { ascending: false }).limit(500),
  ])

  const newUsersLast7Days = countSince(recentUsers, 7)
  const newUsersLast30Days = countSince(recentUsers, 30)

  const bookingsByStatus: Record<string, number> = {}
  for (const row of bookingStatuses ?? []) {
    const s = row.status ?? 'unknown'
    bookingsByStatus[s] = (bookingsByStatus[s] ?? 0) + 1
  }

  const stats: PlatformStats = {
    totalHelpers: totalHelpers ?? 0,
    totalPosters: totalPosters ?? 0,
    totalPosts: totalPosts ?? 0,
    openPosts: openPosts ?? 0,
    totalBookings: totalBookings ?? 0,
    bookingsByStatus,
    pendingVerifications: pendingVerifications ?? 0,
    verifiedHelpers: verifiedHelpers ?? 0,
    totalReviews: totalReviews ?? 0,
    newUsersLast7Days,
    newUsersLast30Days,
  }

  return <AdminStatsContent stats={stats} />
}
