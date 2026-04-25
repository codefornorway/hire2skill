import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Hire2Skill',
  description: 'Hire2Skill connects people with trusted local helpers across Norway. Learn about our mission, story, and values.',
}

const STATS = [
  { value: '10,000+', label: 'Tasks completed' },
  { value: '2,500+', label: 'Verified helpers' },
  { value: '50+', label: 'Cities in Norway' },
  { value: '4.8 ★', label: 'Average rating' },
]

const VALUES = [
  {
    emoji: '🔒',
    title: 'Trust first',
    desc: 'Every helper is ID-verified before they can accept bookings. Ratings and reviews are real — posted only by people who completed a task.',
  },
  {
    emoji: '⚡',
    title: 'Fast and easy',
    desc: 'Post a task in under two minutes. Get matched with available helpers the same day. No endless back-and-forth.',
  },
  {
    emoji: '🤝',
    title: 'Fair for everyone',
    desc: 'Helpers keep the majority of what they earn. Posters pay transparent prices with no hidden fees.',
  },
  {
    emoji: '🌍',
    title: 'Local, always',
    desc: 'We only operate in Norway. Our helpers live in your city and understand your community.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="text-white" style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Norway&apos;s trusted platform<br />for local help
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Hire2Skill makes it easy to find skilled, verified helpers for any task — from cleaning and moving
            to tutoring and tech support. We&apos;re building a more connected Norway, one task at a time.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-5">Our story</h2>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
          <p>
            Hire2Skill started with a simple observation: finding reliable help for everyday tasks was
            surprisingly hard. Whether it was a leaky tap, a piece of furniture that needed assembling,
            or a maths tutor for a struggling student — people were left searching through Facebook groups
            and word-of-mouth recommendations, never quite sure who to trust.
          </p>
          <p>
            We built Hire2Skill to change that. Our platform makes it simple to post any task, browse
            verified local helpers, read honest reviews, and book with confidence — all in a few minutes.
          </p>
          <p>
            Today, Hire2Skill operates across Norway, connecting thousands of people with skilled helpers
            every week. We&apos;re proud that helpers on our platform earn fair rates for their expertise,
            and that the people who use our service can get on with their lives knowing the job is in
            good hands.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center">What we stand for</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="text-3xl mb-3">{v.emoji}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Ready to get started?</h2>
        <p className="text-gray-500 mb-8">Post your first task free, or create a helper profile and start earning today.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/post"
            className="rounded-xl px-7 py-3 font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
            Post a Task
          </Link>
          <Link href="/signup"
            className="rounded-xl px-7 py-3 font-bold text-sm text-gray-700 border border-gray-200 hover:border-blue-300 transition-colors">
            Become a Helper
          </Link>
        </div>
      </div>

    </div>
  )
}
