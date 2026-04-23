import { createClient } from '@/lib/supabase/server'
import HomeContent from './HomeContent'

const SAMPLE_JOBS = [
  { title: 'Help moving furniture', location: 'Oslo', price: 500, category: 'Jobs', urgent: true },
  { title: 'House cleaning – 3 rooms', location: 'Bergen', price: 350, category: 'Services', urgent: true },
  { title: 'Event assistant – weekend', location: 'Trondheim', price: 280, category: 'Jobs', urgent: true },
  { title: 'English tutoring for kids', location: 'Oslo', price: 400, category: 'Tutoring', urgent: false },
  { title: 'Grocery delivery – elderly', location: 'Stavanger', price: 150, category: 'Services', urgent: false },
]

export default async function Home() {
  const supabase = await createClient()

  const { count: jobCount } = await supabase.from('posts').select('*', { count: 'exact', head: true })
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, category, location, price, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const jobs = recentPosts && recentPosts.length >= 3
    ? recentPosts.map(p => ({ ...p, urgent: false }))
    : SAMPLE_JOBS

  const totalJobs = jobCount && jobCount > 10 ? jobCount : 1200

  return <HomeContent jobs={jobs} totalJobs={totalJobs} />
}
