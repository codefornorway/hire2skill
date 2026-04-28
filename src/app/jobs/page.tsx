import { createClient } from '@/lib/supabase/server'
import JobsContent, { type PublicJob } from './JobsContent'
import { loadProposalCountsForPosts } from './proposal-counts'

export const metadata = {
  title: 'Find Jobs',
  description: 'Browse open jobs posted by customers and send your proposal.',
  alternates: {
    canonical: '/jobs',
  },
}

export default async function JobsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, user_id, title, description, category, location, price, created_at, status')
    .or('status.is.null,status.eq.open')
    .order('created_at', { ascending: false })
    .limit(80)

  const posterIds = [...new Set((posts ?? []).map(p => p.user_id).filter(Boolean))]
  const postIds = (posts ?? []).map(p => p.id)
  const proposalCounts = await loadProposalCountsForPosts(supabase, postIds, posterIds)

  const { data: posterProfiles } = posterIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', posterIds)
    : { data: [] as { id: string; display_name: string | null }[] }

  const nameById = Object.fromEntries((posterProfiles ?? []).map(p => [p.id, p.display_name]))
  const jobs: PublicJob[] = (posts ?? []).map((p) => ({
    id: p.id,
    posterId: p.user_id,
    posterName: nameById[p.user_id] ?? 'Customer',
    title: p.title ?? 'Untitled job',
    description: p.description ?? '',
    category: p.category ?? 'General',
    location: p.location ?? 'Norway',
    budget: p.price ?? null,
    createdAt: p.created_at,
    proposalCount: proposalCounts[p.id] ?? 0,
  }))

  return <JobsContent jobs={jobs} currentUserId={user?.id ?? null} />
}

