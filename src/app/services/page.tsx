import type { Metadata } from 'next'
import Link from 'next/link'
import { SERVICES } from '@/lib/services'

export const metadata: Metadata = {
  title: 'All Services',
  description: 'Browse all services available on SkillLink — cleaning, moving, tutoring, handyman, pet care, and 20 more categories across Norway.',
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            What do you need help with?
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Verified local helpers across Norway — ready for any task, big or small.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SERVICES.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col items-start gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: s.accentBg }}>
                {s.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{s.subheadline.split('—')[0].trim()}</p>
              </div>
              <span className="mt-auto text-xs font-semibold text-blue-700">
                From {s.priceMin} NOK →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
