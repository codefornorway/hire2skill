import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TaskerProfileContent from './TaskerProfileContent'
import JsonLd from '@/components/JsonLd'
import { buildTaskerProfileMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const SAMPLE_TASKERS = [
  { id: 's1', display_name: 'Maria K.',  categories: ['Cleaning'],    location: 'Oslo',      bio: 'Professional cleaner with 5 years of hands-on experience.' },
  { id: 's2', display_name: 'Erik R.',   categories: ['Moving'],      location: 'Bergen',    bio: 'Strong, reliable, and punctual. I own a large van.' },
  { id: 's3', display_name: 'Amina S.',  categories: ['Tutoring'],    location: 'Oslo',      bio: 'Experienced math, science, and English tutor.' },
  { id: 's4', display_name: 'Jonas B.',  categories: ['IT & Tech'],   location: 'Trondheim', bio: 'IT professional with 8 years of industry experience.' },
  { id: 's5', display_name: 'Sara L.',   categories: ['Events'],      location: 'Oslo',      bio: 'Professional event coordinator.' },
  { id: 's6', display_name: 'Mikkel T.', categories: ['Handyman'],    location: 'Stavanger', bio: 'Skilled handyman covering all small and medium repairs.' },
]

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles').select('display_name, bio, categories, location, avatar_url').eq('id', id).single()

  const tasker = profile ?? SAMPLE_TASKERS.find(t => t.id === id)
  if (!tasker) return {}

  const name = tasker.display_name ?? 'Local Helper'
  const category = (tasker.categories ?? [])[0] ?? 'Helper'
  const location = tasker.location ?? 'Norway'

  return buildTaskerProfileMetadata({
    id,
    name,
    category,
    location,
    bio: tasker.bio ?? '',
    avatarUrl: profile?.avatar_url ?? null,
  })
}

const SAMPLE_TASKERS_FULL = [
  { id: 's1', display_name: 'Maria K.', bio: 'Professional cleaner with 5 years of hands-on experience. I bring my own eco-friendly supplies and take real pride in leaving every home spotless. Available weekdays and weekends in Oslo and nearby areas. I specialise in deep cleans, move-in/move-out cleaning, and regular weekly visits.', hourly_rate: 350, categories: ['Cleaning'], location: 'Oslo', verified: true, tasks_done: 52, rating: 4.9, response_hours: 1, avatar_url: null },
  { id: 's2', display_name: 'Erik R.', bio: 'Strong, reliable, and punctual. I own a large van and help with residential moves, heavy lifting, furniture assembly, and IKEA build-outs. I have moved over 38 households in Bergen and always handle your belongings with care. Happy to quote for jobs of any size.', hourly_rate: 500, categories: ['Moving'], location: 'Bergen', verified: true, tasks_done: 38, rating: 4.8, response_hours: 2, avatar_url: null },
  { id: 's3', display_name: 'Amina S.', bio: 'Experienced math, science, and English tutor for students aged 8–25. I hold a Masters in Education and have 4 years of private tutoring experience. My students consistently improve at least one grade level within three months. I adapt to each students learning style and set clear goals.', hourly_rate: 400, categories: ['Tutoring'], location: 'Oslo', verified: true, tasks_done: 74, rating: 5.0, response_hours: 1, avatar_url: null },
  { id: 's4', display_name: 'Jonas B.', bio: 'IT professional with 8 years of industry experience. I fix slow computers, remove viruses, set up home networks, configure smart home devices, and help with smartphones and tablets. I explain everything in plain language — no jargon. Remote or on-site support available.', hourly_rate: 450, categories: ['IT & Tech'], location: 'Trondheim', verified: false, tasks_done: 29, rating: 4.7, response_hours: 3, avatar_url: null },
  { id: 's5', display_name: 'Sara L.', bio: 'Professional event coordinator with a passion for creating memorable experiences. From intimate birthday dinners to corporate conferences, I handle logistics, vendor coordination, and on-the-day management so you can relax and enjoy the occasion.', hourly_rate: 380, categories: ['Events'], location: 'Oslo', verified: true, tasks_done: 41, rating: 4.8, response_hours: 2, avatar_url: null },
  { id: 's6', display_name: 'Mikkel T.', bio: 'Skilled handyman covering all small and medium repairs: painting, wallpapering, shelf installation, furniture assembly, minor plumbing fixes, and general home maintenance. I come fully equipped with my own tools and always leave the work area clean.', hourly_rate: 420, categories: ['Handyman'], location: 'Stavanger', verified: true, tasks_done: 63, rating: 4.9, response_hours: 1, avatar_url: null },
]

const SAMPLE_REVIEWS: Record<string, { author: string; date: string; rating: number; text: string }[]> = {
  s1: [
    { author: 'Kari M.', date: 'March 2026', rating: 5, text: 'Maria did an incredible deep clean before I moved in. Every corner was spotless. Will definitely book again!' },
    { author: 'Thomas A.', date: 'February 2026', rating: 5, text: 'Punctual, professional, and thorough. She noticed things I would never have thought to clean. Highly recommend.' },
    { author: 'Ingrid B.', date: 'January 2026', rating: 4, text: 'Very good work. Arrived on time and finished faster than expected. A couple of small spots were missed but overall great.' },
  ],
  s2: [
    { author: 'Lars P.', date: 'March 2026', rating: 5, text: 'Erik moved our entire 3-bedroom apartment in one trip. Nothing was damaged, super fast and friendly.' },
    { author: 'Silje H.', date: 'February 2026', rating: 5, text: 'Helped with a heavy sofa that two other companies refused. Absolute legend!' },
    { author: 'Nils K.', date: 'January 2026', rating: 4, text: 'Great job overall. Arrived 20 minutes late but called ahead to let me know, which I appreciated.' },
  ],
  s3: [
    { author: 'Fatima Z.', date: 'April 2026', rating: 5, text: 'My daughter went from failing maths to topping her class in two months. Amina is a miracle worker.' },
    { author: 'Henrik S.', date: 'March 2026', rating: 5, text: 'Best tutor I have ever had. Explains things clearly and makes the subject actually interesting.' },
    { author: 'Camilla R.', date: 'February 2026', rating: 5, text: 'Patient, knowledgeable, and flexible with scheduling. 100% would recommend to any parent.' },
  ],
  s4: [
    { author: 'Olav D.', date: 'March 2026', rating: 5, text: 'Fixed my laptop in under an hour and explained exactly what was wrong. Honest and knowledgeable.' },
    { author: 'Marte J.', date: 'February 2026', rating: 4, text: 'Set up my whole home network. Took longer than expected but the result is perfect.' },
  ],
  s5: [
    { author: 'Petter L.', date: 'April 2026', rating: 5, text: 'Sara organised our company summer party and it was flawless. Every detail was perfect.' },
    { author: 'Anette V.', date: 'March 2026', rating: 5, text: 'She turned my daughter\'s 10th birthday into something magical. Guests are still talking about it.' },
    { author: 'Bjørn G.', date: 'January 2026', rating: 4, text: 'Very professional and creative. A few small miscommunications early on but she resolved them quickly.' },
  ],
  s6: [
    { author: 'Rune T.', date: 'March 2026', rating: 5, text: 'Mikkel put up shelves, fixed a leaky tap, and repainted a wall — all in one visit. Extremely efficient.' },
    { author: 'Hilde N.', date: 'February 2026', rating: 5, text: 'Friendly, tidy, and fair price. My go-to handyman from now on.' },
    { author: 'Eirik F.', date: 'January 2026', rating: 5, text: 'Assembled 6 pieces of IKEA furniture in record time. Excellent work and great chat too.' },
  ],
}

export default async function TaskerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  const tasker = profile ?? SAMPLE_TASKERS_FULL.find(t => t.id === id)
  if (!tasker) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real reviews for real profiles; keep sample data for demo taskers
  let reviews: { author: string; date: string; rating: number; text: string }[] = []
  if (profile) {
    try {
      const { data: rawReviews } = await supabase
        .from('reviews')
        .select('rating, body, created_at, reviewer_id')
        .eq('reviewee_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (rawReviews && rawReviews.length > 0) {
        const reviewerIds = [...new Set(rawReviews.map(r => r.reviewer_id))]
        const { data: reviewerProfiles } = await supabase
          .from('profiles').select('id, display_name').in('id', reviewerIds)
        const nameMap = Object.fromEntries((reviewerProfiles ?? []).map(p => [p.id, p.display_name]))
        reviews = rawReviews.map(r => ({
          author: nameMap[r.reviewer_id] ?? 'Anonymous',
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          rating: r.rating,
          text: r.body ?? '',
        }))
      }
    } catch {
      // reviews table not yet created
    }
  } else {
    reviews = SAMPLE_REVIEWS[id] ?? SAMPLE_REVIEWS.s1
  }

  // Map avg_rating → rating field for real profiles
  const resolvedTasker = profile
    ? { ...profile, rating: (profile as Record<string, unknown>).avg_rating as number ?? profile.rating ?? 0 }
    : tasker

  const rating = (resolvedTasker as Record<string, unknown>).rating as number ?? 0
  const reviewCount = reviews.length

  const serviceSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${resolvedTasker.display_name} — ${(resolvedTasker.categories ?? [])[0] ?? 'Local Helper'} in ${resolvedTasker.location ?? 'Norway'}`,
    description: resolvedTasker.bio,
    areaServed: { '@type': 'City', name: resolvedTasker.location ?? 'Norway' },
    serviceType: (resolvedTasker.categories ?? [])[0] ?? 'Local Service',
    provider: {
      '@type': 'Person',
      name: resolvedTasker.display_name,
      ...(resolvedTasker.avatar_url ? { image: resolvedTasker.avatar_url } : {}),
    },
    ...(reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  }

  return (
    <>
      <JsonLd data={serviceSchema} />
      <TaskerProfileContent
        tasker={resolvedTasker}
        reviews={reviews}
        isLoggedIn={!!user}
        currentUserId={user?.id ?? null}
      />
    </>
  )
}
