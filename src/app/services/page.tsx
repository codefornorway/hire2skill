import { Suspense } from 'react'
import ServicesContent from './ServicesContent'

export const metadata = {
  title: 'All Services',
  description: 'Browse all services available on Hire2Skill — cleaning, moving, tutoring, handyman, pet care, and 50 more categories across Norway.',
  alternates: {
    canonical: '/services',
  },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero — compact; subtitle kept for screen readers / SEO */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 pb-0 sm:pt-4 sm:pb-1 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            What do you need help with?
          </h1>
          <p className="sr-only">
            Verified local helpers across Norway — ready for any task, big or small.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500 sm:px-6">Loading services…</div>}>
        <ServicesContent />
      </Suspense>
    </div>
  )
}
