import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">SkillLink</h1>
        <p className="text-zinc-500 mb-8">Connecting people with local opportunities in Norway</p>
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
