import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b border-zinc-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href={user ? '/dashboard' : '/'} className="text-lg font-bold text-zinc-900">
          SkillLink
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <Link href="/post" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Post</Link>
            <Link href="/chat" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Chat</Link>
            <Link href="/profile" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Profile</Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 hidden sm:block">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Log in</Link>
            <Link href="/signup" className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
