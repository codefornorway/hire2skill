import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/chat')

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Messages</h1>
      <p className="text-sm text-zinc-500">Coming soon — you&apos;ll be able to chat with other users here.</p>
    </main>
  )
}
