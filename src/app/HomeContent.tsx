'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bolt, CheckCircle2, Search } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

type Job = {
  id?: string
  title: string
  description?: string | null
  location: string
  price: number | null
  category: string
  urgent?: boolean
  created_at?: string
  postedAgo?: string
}

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

function cleanJobTitle(title: string) {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\s+in\s+[a-z]{1,3}\s*$/i, '')
    .trim()
}

function cleanLocation(location: string) {
  return location
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, ' - ')
    .trim()
}

function cleanJobDescription(description?: string | null) {
  if (!description) return ''
  return description
    .replace(/task photos:\s*[\s\S]*$/i, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getProposalHref(job: Job) {
  if (job.id) return `/jobs?proposalJobId=${encodeURIComponent(job.id)}`
  const params = new URLSearchParams()
  if (job.title.trim()) params.set('q', job.title.trim())
  if (job.location.trim()) params.set('location', job.location.trim())
  const qs = params.toString()
  return qs ? `/jobs?${qs}` : '/jobs'
}

export default function HomeContent({
  jobs,
}: {
  jobs: Job[]
  enableDemoData: boolean
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const h = t.home
  const [query, setQuery] = useState('')
  const [heroLocation, setHeroLocation] = useState('All Norway')

  const jobsStrip = useMemo(() => {
    const source = jobs
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

  function goToCurrentJobs() {
    const loc = heroLocation.trim()
    const params = new URLSearchParams()
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
                {h?.badge ?? 'Built for Norway'}
              </span>
              <h1 className="max-w-lg text-3xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-5xl">
                {h?.title1 ? `${h.title1} ${h?.title2 ?? ''}`.trim() : 'Get help fast in your area'}
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
                  {t.nav.postJob}
                </Link>
                <Link
                  href="/taskers"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:text-blue-300"
                >
                  {h?.findWorkerCta ?? 'Find Helper'}
                </Link>
                <button
                  type="button"
                  onClick={goToCurrentJobs}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:text-blue-300"
                >
                  {h?.seeCurrentJobsCta ?? 'See Current Jobs'}
                </button>
              </div>

              <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">{h?.seasonalSummerBody ?? 'Need help now? Post a job in 30 seconds'}</p>
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
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{h?.jobsNowTitle ?? 'Jobs happening now'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">{h?.jobsNowSub ?? 'Real people. Real jobs. Right now.'}</p>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-300">{h?.seeAllJobs ?? 'See all jobs'}</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jobsStrip.map((job, idx) => (
              <article
                key={`${job.id ?? job.title}-${idx}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <Link
                  href={job.id ? `/jobs?jobId=${encodeURIComponent(job.id)}` : `/jobs?q=${encodeURIComponent(job.title)}`}
                  className="block"
                >
                  <div className="relative h-44">
                    <Image
                      src={getImageForCategory(job.category)}
                      alt={job.category}
                      fill
                      sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-semibold text-white">
                      {job.urgent ? `🔥 ${h?.urgent ?? 'Urgent'}` : `🔥 ${h?.openTag ?? 'Open'}`}
                    </div>
                    {job.postedAgo ? (
                      <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                        {job.postedAgo}
                      </div>
                    ) : null}
                  </div>
                </Link>
                <div className="space-y-2 p-4">
                  <Link
                    href={job.id ? `/jobs?jobId=${encodeURIComponent(job.id)}` : `/jobs?q=${encodeURIComponent(job.title)}`}
                    className="block"
                  >
                    <h3 className="line-clamp-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {cleanJobTitle(job.title)}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                    <span className="line-clamp-1">📍 {cleanLocation(job.location)}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">💰 {job.price ? `${job.price} NOK` : (h?.budgetTbd ?? 'Budget TBD')}</span>
                  </div>
                  <p className="line-clamp-1 text-sm text-slate-600 dark:text-slate-300">
                    {cleanJobDescription(job.description) || cleanJobTitle(job.title)}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                      {job.category}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                      {h?.openTag ?? 'Open'}
                    </span>
                  </div>
                  <Link
                    href={getProposalHref(job)}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    {h?.sendProposalCta ?? 'Send proposal'}
                  </Link>
                </div>
              </article>
            ))}
            {jobsStrip.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:col-span-2 xl:col-span-5">
                <p>{h?.noCurrentJobs ?? 'No current open jobs in this location yet.'}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Link href="/jobs" className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:text-blue-300">
                    {h?.seeAllJobs ?? 'See all jobs'}
                  </Link>
                  <Link href="/post" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                    {t.nav.postJob}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{h?.popularServicesTitle ?? 'Popular services'}</h2>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-300">{h?.popularServicesSub ?? 'Most requested by people in your area'}</p>
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
          <h2 className="mb-3 text-xl font-extrabold text-slate-900 dark:text-white">{h?.browseByCategoryTitle ?? 'Browse by category'}</h2>
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
            <Link href="/services" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-300">{h?.exploreAllServices ?? 'Explore all services'}</Link>
          </div>
        </section>

        <section className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: '8,000+', label: h?.tasksCompletedLabel ?? 'Tasks completed' },
            { value: '2,400+', label: h?.verifiedHelpersLabel ?? 'Verified helpers' },
            { value: '4.9+', label: h?.averageRatingLabel ?? 'Average rating' },
            { value: '100%', label: h?.safeSecureLabel ?? 'Safe & secure' },
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
              <h3 className="text-lg font-extrabold text-emerald-900">{h?.earnTitle ?? 'Earn money your way'}</h3>
              <p className="text-sm text-emerald-800">{h?.earnSub ?? 'Work when you want, choose jobs you like, and get paid quickly.'}</p>
            </div>
          </div>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
            <Bolt className="h-4 w-4" />
            {h?.startEarning ?? 'Start Earning'}
          </Link>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 p-5 text-white shadow-sm">
          <h2 className="text-2xl font-extrabold">{h?.readyTitle ?? 'Ready to get started?'}</h2>
          <p className="mt-1 text-sm text-blue-100">{h?.readySub ?? 'Post a job and get help in minutes.'}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href="/post" className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">
              {t.nav.postJob}
            </Link>
            <Link href="/taskers" className="inline-flex items-center justify-center rounded-xl border border-white/60 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
              {h?.findWorkerCta ?? 'Find Helper'}
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-xl border border-white/60 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
              {h?.startEarning ?? 'Start Earning'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
