import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostForm from './PostForm'

export const metadata = {
  title: 'Post a Task',
  description: 'Describe what you need help with and get matched with verified local helpers in Norway.',
  robots: { index: false, follow: false },
}

export default async function PostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/post')
  return <PostForm />
}
