import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostForm from './PostForm'

export default async function PostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/post')
  return <PostForm />
}
