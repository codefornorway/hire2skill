import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/profile')

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 mb-4">Your profile</h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 max-w-sm">
        <p className="text-xs text-zinc-400 mb-1">Logged in as</p>
        <p className="text-sm font-medium text-zinc-800">{user.email}</p>
        <p className="text-xs text-zinc-400 mt-3 mb-1">User ID</p>
        <p className="text-xs font-mono text-zinc-500 break-all">{user.id}</p>
        <p className="text-xs text-zinc-400 mt-3 mb-1">Account created</p>
        <p className="text-sm text-zinc-600">
          {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </main>
  )
}
