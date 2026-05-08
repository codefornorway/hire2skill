import Link from 'next/link'

export const metadata = { title: 'Page Not Found' }

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-3xl text-white shadow-md"
        style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}
      >
        ⚡
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
      <p className="text-lg font-semibold text-gray-700 mb-1">Page not found</p>
      <p className="text-sm text-gray-400 mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/jobs"
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
        >
          Browse Jobs
        </Link>
        <Link
          href="/taskers"
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Find Helpers
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
