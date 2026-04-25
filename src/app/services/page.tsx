import type { Metadata } from 'next'
import ServicesContent from './ServicesContent'

export const metadata: Metadata = {
  title: 'All Services',
  description: 'Browse all services available on Hire2Skill — cleaning, moving, tutoring, handyman, pet care, and 50 more categories across Norway.',
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            What do you need help with?
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Verified local helpers across Norway — ready for any task, big or small.
          </p>
        </div>
      </div>

      <ServicesContent />
    </div>
  )
}
