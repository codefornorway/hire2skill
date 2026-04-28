import { createClient } from '@/lib/supabase/server'
import HomeContent from './HomeContent'
import JsonLd from '@/components/JsonLd'
import { FEATURES } from '@/lib/features'

export const metadata = {
  title: 'Hire2Skill — Find Local Helpers in Norway',
  description: 'Book verified local helpers for cleaning, moving, tutoring, handyman work and more. Serving Oslo, Bergen, Trondheim, Stavanger and across Norway.',
  openGraph: {
    title: 'Hire2Skill — Find Local Helpers in Norway',
    description: 'Book verified local helpers for cleaning, moving, tutoring, handyman work and more across Norway.',
    url: 'https://hire2skill.com',
    type: 'website',
  },
}

function formatPostedAgo(createdAt?: string) {
  if (!createdAt) return ''
  const ts = new Date(createdAt).getTime()
  if (!Number.isFinite(ts) || ts <= 0) return ''
  const deltaMs = Date.now() - ts
  if (deltaMs < 60_000) return 'Just now'
  const mins = Math.floor(deltaMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function Home() {
  const supabase = await createClient()

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, description, category, location, price, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  const jobs = (recentPosts ?? [])
    .filter((p) => {
      const status = (p.status ?? '').toLowerCase()
      return !status || status === 'open'
    })
    .slice(0, 5)
    .map((p) => ({ ...p, urgent: false, postedAgo: formatPostedAgo(p.created_at) }))

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hire2Skill',
    url: 'https://hire2skill.com',
    description: 'Hire2Skill connects people with verified local helpers across Norway.',
    areaServed: { '@type': 'Country', name: 'Norway' },
  }

  return (
    <>
      <JsonLd data={orgSchema} />
      <HomeContent jobs={jobs} enableDemoData={FEATURES.enableDemoData} />
    </>
  )
}
