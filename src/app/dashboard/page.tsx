import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Welcome back</h1>
      <p className="text-sm text-zinc-500 mb-8">{user.email}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/post" className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 transition-colors">
          <h2 className="font-semibold text-zinc-900 mb-1">Post</h2>
          <p className="text-sm text-zinc-500">Share a job or service</p>
        </Link>
        <Link href="/chat" className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 transition-colors">
          <h2 className="font-semibold text-zinc-900 mb-1">Chat</h2>
          <p className="text-sm text-zinc-500">Message other users</p>
        </Link>
        <Link href="/profile" className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-400 transition-colors">
          <h2 className="font-semibold text-zinc-900 mb-1">Profile</h2>
          <p className="text-sm text-zinc-500">View your account</p>
        </Link>
      </div>
    </main>
  )
}
