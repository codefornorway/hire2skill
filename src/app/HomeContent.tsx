'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bolt, CheckCircle2, Search } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { RealHelper } from './page'

type Job = { id?: string; title: string; location: string; price: number | null; category: string; urgent?: boolean }

const JOB_CARD_IMAGES: Record<string, string> = {
  cleaning: '/home/cleaning-apartment-modern-1.png',
  petcare: '/home/petcare-real-life-1.png',
  dogwalking: '/home/dog-walking-real-life-1.png',
  tutoring: '/home/tutoring-home-1.png',
  childcare: '/home/child-care-real-life-1.png',
  moving: '/home/moving-furniture-apartment-1.png',
  handyman: '/home/handyman-real-life-1.png',
  delivery: '/home/delivery-real-life-1.png',
  cooking: '/home/cooking-real-life-1.png',
  shopping: '/home/shopping-real-life-1.png',
  events: '/home/events-real-life-1.png',
}

const POPULAR_SERVICES = [
  { label: 'Cleaning', image: '/home/cleaning-apartment-modern-2.png', href: '/taskers?category=Cleaning' },
  { label: 'Moving', image: '/home/moving-furniture-apartment-2.png', href: '/taskers?category=Moving' },
  { label: 'Handyman', image: '/home/handyman-real-life-3.png', href: '/taskers?category=Handyman' },
  { label: 'Delivery', image: '/home/delivery-real-life-2.png', href: '/taskers?category=Delivery' },
  { label: 'Cooking', image: '/home/cooking-real-life-2.png', href: '/taskers?category=Cooking' },
]

const BROWSE_CATEGORIES = [
  { title: 'Home Services', desc: 'Cleaning, moving, repairs', href: '/services?group=home' },
  { title: 'Outdoor', desc: 'Gardening, snow removal', href: '/services?group=outdoor' },
  { title: 'Personal Care', desc: 'Kids care, pet care, elder care', href: '/services?group=care' },
  { title: 'Learning & Skills', desc: 'Tutoring, lessons, training', href: '/services?group=learning' },
  { title: 'Creative & Lifestyle', desc: 'Photography, baking, events', href: '/services?group=creative' },
  { title: 'More Services', desc: 'IT & tech, delivery, shopping', href: '/services?group=more' },
]
const HERO_LOCATIONS = [
  'All Norway',
  'Oslo',
  'Bergen',
  'Trondheim',
  'Stavanger',
  'Kristiansand',
  'Tromso',
]

const DEFAULT_JOBS: Job[] = [
  { title: 'Cleaning help needed', location: 'Grunerlokka, Oslo', price: 1200, category: 'Cleaning', urgent: true },
  { title: 'Moving help needed', location: 'Sentrum, Oslo', price: 1800, category: 'Moving', urgent: true },
  { title: 'Handyman needed', location: 'St. Hanshaugen, Oslo', price: 900, category: 'Handyman', urgent: false },
  { title: 'Grocery shopping', location: 'Majorstuen, Oslo', price: 500, category: 'Shopping', urgent: false },
  { title: 'Home cooking today', location: 'Frogner, Oslo', price: 700, category: 'Cooking', urgent: false },
]

function getImageForCategory(category: string) {
  const key = category.toLowerCase().replace(/[^a-z]/g, '')
  if (JOB_CARD_IMAGES[key]) return JOB_CARD_IMAGES[key]
  if (key.includes('event') || key.includes('party') || key.includes('wedding') || key.includes('birthday') || key.includes('decor')) return '/home/events-real-life-2.png'
  if (key.includes('pet') || key.includes('dog') || key.includes('cat')) return '/home/petcare-real-life-2.png'
  if (key.includes('tutor') || key.includes('lesson') || key.includes('study') || key.includes('school')) return '/home/tutoring-home-3.png'
  if (key.includes('child') || key.includes('kid') || key.includes('baby') || key.includes('nanny') || key.includes('daycare')) return '/home/child-care-real-life-2.png'
  if (key.includes('move')) return '/home/moving-furniture-apartment-2.png'
  if (key.includes('clean')) return '/home/cleaning-apartment-modern-3.png'
  return '/home/cleaning-apartment-modern-3.png'
}

export default function HomeContent({
  jobs,
  helpers,
}: {
  jobs: Job[]
  helpers: RealHelper[] | null
  enableDemoData: boolean
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const h = t.home
  const [query, setQuery] = useState('')
  const [heroLocation, setHeroLocation] = useState('Oslo')

  const jobsStrip = useMemo(() => {
    const source = jobs.length > 0 ? jobs : DEFAULT_JOBS
    const q = query.trim().toLowerCase()
    const loc = heroLocation.trim().toLowerCase()
    const filtered = q
      ? source.filter((job) =>
          `${job.title} ${job.category} ${job.location}`.toLowerCase().includes(q) &&
          (loc === 'all norway' || !loc || job.location.toLowerCase().includes(loc)),
        )
      : source.filter((job) => loc === 'all norway' || !loc || job.location.toLowerCase().includes(loc))
    return filtered.slice(0, 5)
  }, [jobs, query, heroLocation])

  function handleHeroSearch() {
    const q = query.trim()
    const loc = heroLocation.trim()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (loc && loc.toLowerCase() !== 'all norway') params.set('location', loc)
    const qs = params.toString()
    router.push(qs ? `/jobs?${qs}` : '/jobs')
  }

  const trustText = h?.subtitle?.trim() || 'Hire trusted local people for moving, cleaning, quick tasks and more.'

  return (
    <main className="w-full overflow-x-clip bg-[#f5f7fb] px-2 pb-8 pt-3 dark:bg-slate-950 sm:px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-4 p-4 md:grid-cols-[1.05fr_1fr] md:p-6">
            <div className="flex flex-col justify-center">
              <span className="mb-2 inline-flex w-fit rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Built for Norway
              </span>
              <h1 className="max-w-lg text-3xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-5xl">
                Get help fast in your area
              </h1>
              <p className="mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-300">{trustText}</p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleHeroSearch()
                    }}
                    placeholder={h?.categorySearchPlaceholder || 'What do you need help with?'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
                  />
                </div>
                <select
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  {HERO_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link href="/post" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                  Post a Job
                </Link>
                <button
                  type="button"
                  onClick={handleHeroSearch}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:text-blue-300"
                >
                  Find Work
                </button>
              </div>

              <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">Need help now? Post a job in 30 seconds</p>
            </div>

            <div className="relative h-56 overflow-hidden rounded-3xl md:h-full md:min-h-[320px]">
              <Image
                src="/home/moving-furniture-apartment-4.png"
                alt="People moving boxes"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Jobs happening now</h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">Real people. Real jobs. Right now.</p>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-300">See all jobs</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {jobsStrip.map((job, idx) => (
              <Link
                key={`${job.id ?? job.title}-${idx}`}
                href={job.id ? `/jobs?jobId=${encodeURIComponent(job.id)}` : `/jobs?q=${encodeURIComponent(job.title)}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="relative h-24">
                  <Image
                    src={getImageForCategory(job.category)}
                    alt={job.category}
                    fill
                    sizes="(max-width: 1280px) 50vw, 20vw"
                    className="object-cover"
                  />
                  <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                    {job.urgent ? 'Urgent' : 'Open'}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-slate-100">{job.title}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-300">{job.location}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-extrabold text-emerald-600">{job.price ? `${job.price} NOK` : 'Budget TBD'}</p>
                    <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">View Job</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Popular services</h2>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-300">Most requested by people in your area</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {POPULAR_SERVICES.map((service) => (
              <Link key={service.label} href={service.href} className="group relative h-24 overflow-hidden rounded-2xl">
                <Image
                  src={service.image}
                  alt={service.label}
                  fill
                  sizes="(max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-2 left-2 text-sm font-bold text-white">{service.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-xl font-extrabold text-slate-900 dark:text-white">Browse by category</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {BROWSE_CATEGORIES.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <Link href="/services" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-300">Explore all services</Link>
          </div>
        </section>

        <section className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '8,000+', label: 'Tasks completed' },
            { value: '2,400+', label: 'Verified helpers' },
            { value: '4.9+', label: 'Average rating' },
            { value: '100%', label: 'Safe & secure' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-emerald-900">Earn money your way</h3>
              <p className="text-sm text-emerald-800">Work when you want, choose jobs you like, and get paid quickly.</p>
            </div>
          </div>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
            <Bolt className="h-4 w-4" />
            Start Earning
          </Link>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 p-5 text-white shadow-sm">
          <h2 className="text-2xl font-extrabold">Ready to get started?</h2>
          <p className="mt-1 text-sm text-blue-100">Post a job and get help in minutes.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/post" className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">
              Post a Job
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-xl border border-white/60 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
              Start Earning
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
