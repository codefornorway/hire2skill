import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogoHorizontal } from './SkillLinkLogo'
import LanguageSwitcher from './LanguageSwitcher'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">

        <Link href={user ? '/dashboard' : '/'} className="hover:opacity-90 transition-opacity">
          <LogoHorizontal />
        </Link>

        <div className="flex items-center gap-2 sm:gap-5">
          <Link href="/taskers" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Find Helpers
          </Link>

          {user ? (
            <>
              <Link href="/chat" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                Messages
              </Link>
              <Link href="/profile" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                Profile
              </Link>
              <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold shadow-sm" style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
                {user.email?.[0].toUpperCase()}
              </div>
              <form action="/auth/signout" method="post">
                <button type="submit" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                Sign up
              </Link>
            </>
          )}

          <Link
            href="/post"
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#F59E0B,#FBBF24)' }}
          >
            Post a Job
          </Link>

          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  )
}
