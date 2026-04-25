import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import HomeContent from './HomeContent'
import JsonLd from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'SkillLink — Find Local Helpers in Norway',
  description: 'Book verified local helpers for cleaning, moving, tutoring, handyman work and more. Serving Oslo, Bergen, Trondheim, Stavanger and across Norway.',
  openGraph: {
    title: 'SkillLink — Find Local Helpers in Norway',
    description: 'Book verified local helpers for cleaning, moving, tutoring, handyman work and more across Norway.',
    url: 'https://skilllink.no',
    type: 'website',
  },
}

export type RealHelper = {
  id: string
  name: string
  avatarUrl: string | null
  location: string
  categories: string[]
  hourlyRate: number | null
}

const SAMPLE_JOBS = [
  { title: 'Help moving furniture',    location: 'Oslo',      price: 500, category: 'Moving',   urgent: true },
  { title: 'House cleaning – 3 rooms', location: 'Bergen',    price: 350, category: 'Cleaning', urgent: true },
  { title: 'Event assistant – weekend',location: 'Trondheim', price: 280, category: 'Events',   urgent: true },
  { title: 'English tutoring for kids',location: 'Oslo',      price: 400, category: 'Tutoring', urgent: false },
  { title: 'Grocery delivery – elderly',location: 'Stavanger',price: 150, category: 'Delivery', urgent: false },
]

export default async function Home() {
  const supabase = await createClient()

  const [
    { data: recentPosts },
    { data: helperProfiles },
  ] = await Promise.all([
    supabase.from('posts')
      .select('id, title, category, location, price, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('profiles')
      .select('id, display_name, avatar_url, categories, location, hourly_rate')
      .eq('role', 'helper')
      .not('display_name', 'is', null)
      .not('location', 'is', null)
      .not('categories', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const jobs = recentPosts && recentPosts.length >= 3
    ? recentPosts.map(p => ({ ...p, urgent: false }))
    : SAMPLE_JOBS

  const helpers: RealHelper[] | null =
    helperProfiles && helperProfiles.length >= 1
      ? helperProfiles.slice(0, 3).map(p => ({
          id: p.id,
          name: p.display_name ?? 'Helper',
          avatarUrl: p.avatar_url ?? null,
          location: p.location ?? 'Norway',
          categories: (p.categories as string[] | null) ?? [],
          hourlyRate: p.hourly_rate ?? null,
        }))
      : null

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SkillLink',
    url: 'https://skilllink.no',
    description: 'SkillLink connects people with verified local helpers across Norway.',
    areaServed: { '@type': 'Country', name: 'Norway' },
  }

  return (
    <>
      <JsonLd data={orgSchema} />
      <HomeContent jobs={jobs} helpers={helpers} />
    </>
  )
}
