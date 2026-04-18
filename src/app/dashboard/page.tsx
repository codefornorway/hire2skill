import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Dashboard</h1>
        <p className="text-sm text-zinc-500 mb-1">Logged in as</p>
        <p className="text-sm font-medium text-zinc-800 mb-6">{user.email}</p>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  )
}
