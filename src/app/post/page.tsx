import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostForm from './PostForm'

export default async function PostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/post')

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Create a post</h1>
      <p className="text-sm text-zinc-500 mb-8">Share a job, service, or opportunity with your community.</p>
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <PostForm />
      </div>
    </main>
  )
}
