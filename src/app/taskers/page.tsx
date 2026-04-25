import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import TaskersContent from './TaskersContent'
import { FEATURES } from '@/lib/features'

function resolveMetaLocale(acceptLanguage: string | null): 'no' | 'da' | 'sv' | 'en' {
  if (!acceptLanguage) return 'no'
  const lower = acceptLanguage.toLowerCase()
  if (lower.includes('nb') || lower.includes('nn') || lower.includes('no')) return 'no'
  if (lower.includes('da')) return 'da'
  if (lower.includes('sv')) return 'sv'
  return 'en'
}

function taskersMetaByLocale(locale: 'no' | 'da' | 'sv' | 'en') {
  switch (locale) {
    case 'no':
      return {
        title: 'Finn lokale hjelpere',
        description: 'Finn verifiserte hjelpere i ditt område. Søk etter tjeneste, sted, pris og vurdering. Book rengjoring, flytting, undervisning og mer i hele Norge.',
      }
    case 'da':
      return {
        title: 'Find lokale hjælpere',
        description: 'Find verificerede hjælpere i dit område. Sog efter service, sted, pris og vurdering. Book rengoring, flytning, undervisning og mere i hele Norge.',
      }
    case 'sv':
      return {
        title: 'Hitta lokala hjalpare',
        description: 'Hitta verifierade hjalpare i ditt omrade. Sok efter tjanst, plats, pris och betyg. Boka stadning, flytt, handledning och mer i hela Norge.',
      }
    default:
      return {
        title: 'Browse Local Helpers',
        description: 'Find verified helpers in your area. Search by service, location, price and rating. Book cleaners, movers, tutors, handymen and more across Norway.',
      }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const locale = resolveMetaLocale(headerStore.get('accept-language'))
  const copy = taskersMetaByLocale(locale)

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: `${copy.title} | Hire2Skill`,
      description: copy.description,
      url: 'https://hire2skill.com/taskers',
      locale: locale === 'no' ? 'nb_NO' : locale === 'da' ? 'da_DK' : locale === 'sv' ? 'sv_SE' : 'en_GB',
    },
  }
}

const SAMPLE_TASKERS = [
  { id: 's1',  display_name: 'Maria K.',   bio: 'Professional cleaner with 5 years experience. I bring my own supplies and love a spotless home.', hourly_rate: 350, categories: ['Cleaning'], location: 'Oslo', verified: true, tasks_done: 52, rating: 4.9, response_hours: 1, languages: ['no', 'en'], brings_tools: true, can_invoice: false },
  { id: 's2',  display_name: 'Erik R.',    bio: 'Strong and reliable. I have a van and help with moves, heavy lifting, and furniture assembly.', hourly_rate: 500, categories: ['Moving', 'Furniture Assembly'], location: 'Bergen', verified: true, tasks_done: 38, rating: 4.8, response_hours: 2, languages: ['no', 'en'], brings_tools: true, can_invoice: true },
  { id: 's3',  display_name: 'Amina S.',   bio: 'Math and science tutor for all ages. Native English speaker. 4 years tutoring experience.', hourly_rate: 400, categories: ['Tutoring', 'Music Lessons'], location: 'Oslo', verified: true, tasks_done: 74, rating: 5.0, response_hours: 1, languages: ['en'], brings_tools: false, can_invoice: false },
  { id: 's4',  display_name: 'Jonas B.',   bio: 'IT professional. I fix computers, set up networks, and help with phones and smart devices.', hourly_rate: 450, categories: ['IT & Tech'], location: 'Trondheim', verified: false, tasks_done: 29, rating: 4.7, response_hours: 3, languages: ['no', 'en'], brings_tools: true, can_invoice: true },
  { id: 's5',  display_name: 'Sara L.',    bio: 'Event coordinator and portrait photographer. Birthdays, corporate events, and photoshoots.', hourly_rate: 380, categories: ['Events', 'Photography'], location: 'Oslo', verified: true, tasks_done: 41, rating: 4.8, response_hours: 2, languages: ['no'], brings_tools: true, can_invoice: true },
  { id: 's6',  display_name: 'Mikkel T.',  bio: 'Handyman for all small repairs — painting, shelves, furniture assembly, plumbing fixes.', hourly_rate: 420, categories: ['Handyman', 'Furniture Assembly'], location: 'Stavanger', verified: true, tasks_done: 63, rating: 4.9, response_hours: 1, languages: ['no'], brings_tools: true, can_invoice: true },
  { id: 's7',  display_name: 'Leila H.',   bio: 'Dog walker and pet sitter. Available weekdays and weekends. Insured and first-aid certified.', hourly_rate: 250, categories: ['Dog Walking', 'Pet Care'], location: 'Oslo', verified: true, tasks_done: 87, rating: 5.0, response_hours: 1, languages: ['no', 'en'], brings_tools: false, can_invoice: false },
  { id: 's8',  display_name: 'Tor A.',     bio: 'Snow removal and garden maintenance all year round. I have my own equipment and a truck.', hourly_rate: 400, categories: ['Snow Removal', 'Gardening'], location: 'Oslo', verified: true, tasks_done: 115, rating: 4.9, response_hours: 2, languages: ['no'], brings_tools: true, can_invoice: true },
  { id: 's9',  display_name: 'Hana M.',    bio: 'Certified personal trainer. Home visits, park sessions, or online. All fitness levels welcome.', hourly_rate: 550, categories: ['Personal Training'], location: 'Bergen', verified: true, tasks_done: 33, rating: 4.8, response_hours: 3, languages: ['en'], brings_tools: false, can_invoice: false },
  { id: 's10', display_name: 'Kari N.',    bio: 'Friendly companion and errand runner for the elderly. Patience, care, and reliability are my strengths.', hourly_rate: 280, categories: ['Elder Care', 'Shopping'], location: 'Trondheim', verified: true, tasks_done: 58, rating: 5.0, response_hours: 1, languages: ['no'], brings_tools: false, can_invoice: false },
  { id: 's11', display_name: 'Lars P.',    bio: 'Professional window cleaner. Residential and commercial. Rope access certified for high buildings.', hourly_rate: 350, categories: ['Window Cleaning', 'Cleaning'], location: 'Oslo', verified: false, tasks_done: 44, rating: 4.7, response_hours: 4, languages: ['no', 'en'], brings_tools: true, can_invoice: true },
  { id: 's12', display_name: 'Nadia C.',   bio: 'IKEA-certified furniture assembler. Fast, tidy, and I always double-check the instructions.', hourly_rate: 320, categories: ['Furniture Assembly'], location: 'Oslo', verified: true, tasks_done: 72, rating: 4.9, response_hours: 2, languages: ['en'], brings_tools: true, can_invoice: false },
]

export default async function TaskersPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, bio, hourly_rate, categories, location, verified, tasks_done, rating, avg_rating, review_count, response_hours, avatar_url, languages, brings_tools, can_invoice')
    .eq('role', 'helper')
    .not('display_name', 'is', null)
    .order('tasks_done', { ascending: false })
    .limit(100)

  type HelperProfileRow = {
    id: string
    display_name: string | null
    bio: string | null
    hourly_rate: number | null
    categories: string[] | null
    location: string | null
    verified: boolean | null
    tasks_done: number | null
    rating: number | null
    avg_rating: number | null
    review_count: number | null
    response_hours: number | null
    avatar_url: string | null
    languages: string[] | null
    brings_tools: boolean | null
    can_invoice: boolean | null
  }

  let ownHelperProfile: HelperProfileRow | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, bio, hourly_rate, categories, location, verified, tasks_done, rating, avg_rating, review_count, response_hours, avatar_url, languages, brings_tools, can_invoice, role')
      .eq('id', user.id)
      .single()
    if (data?.role === 'helper') {
      ownHelperProfile = {
        id: data.id,
        display_name: data.display_name,
        bio: data.bio,
        hourly_rate: data.hourly_rate,
        categories: data.categories,
        location: data.location,
        verified: data.verified,
        tasks_done: data.tasks_done,
        rating: data.rating,
        avg_rating: data.avg_rating,
        review_count: data.review_count,
        response_hours: data.response_hours,
        avatar_url: data.avatar_url,
        languages: data.languages,
        brings_tools: data.brings_tools,
        can_invoice: data.can_invoice,
      }
    }
  }

  const mergedProfiles = [...(profiles ?? [])]
  if (ownHelperProfile && !mergedProfiles.some(p => p.id === ownHelperProfile?.id)) {
    mergedProfiles.unshift(ownHelperProfile)
  }

  const hasRealData = mergedProfiles.length > 0
  const taskers = hasRealData
    ? mergedProfiles.map(p => ({ ...p, rating: (p.avg_rating ?? p.rating ?? 0) }))
    : (FEATURES.enableDemoData ? SAMPLE_TASKERS : [])

  return <TaskersContent taskers={taskers} activeCategory={category ?? null} />
}
