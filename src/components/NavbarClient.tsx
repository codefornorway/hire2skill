'use client'

import Link from 'next/link'
import { LogoHorizontal } from './SkillLinkLogo'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import LogoutButton from './LogoutButton'
import RequestBell from './RequestBell'
import ExploreMenu from './ExploreMenu'
import MessagesNavLink from './MessagesNavLink'
import MobileNavSheet from './MobileNavSheet'
import { useLanguage } from '@/context/LanguageContext'
import { usePathname } from 'next/navigation'

export default function NavbarClient({
  userId,
  userEmail,
  unreadCount,
}: {
  userId: string | null
  userEmail: string | null
  unreadCount: number
}) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const isLoggedIn = Boolean(userId)

  return (
    <nav className="sticky top-0 z-50 overflow-x-clip border-b border-gray-200 bg-white px-2 py-3 shadow-sm sm:px-6 sm:py-4"
      style={{ background: 'var(--sl-nav-bg)', borderColor: 'var(--sl-nav-border)' }}>
      <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-1.5 sm:gap-4">
        <Link href="/" className="min-w-0 shrink hover:opacity-90 transition-opacity">
          <LogoHorizontal />
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-5">
          <ExploreMenu />

          {isLoggedIn && userId ? (
            <>
              <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                {t.dashboard.tabOverview}
              </Link>
              <MessagesNavLink userId={userId} initialUnreadCount={unreadCount} />
              <Link href="/notifications" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                {t.nav.notifications}
              </Link>
              <Link href="/profile" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                {t.nav.profile}
              </Link>
              <RequestBell userId={userId} messageUnreadCount={unreadCount} />
              <LogoutButton />
              <MobileNavSheet key={pathname} userEmail={userEmail} unreadCount={unreadCount} />
              <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold shadow-sm" style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
                {userEmail?.[0].toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="sm:hidden text-[11px] font-bold text-gray-600 hover:text-blue-600 transition-colors px-0.5">
                {t.nav.login}
              </Link>
              <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                {t.nav.login}
              </Link>
              <Link
                href="/signup"
                className="rounded-xl px-2.5 py-2 text-[11px] font-bold leading-none text-white shadow-sm transition-opacity hover:opacity-90 whitespace-nowrap sm:px-5 sm:py-2.5 sm:text-sm"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                {t.signup.submit}
              </Link>
            </>
          )}

          <Link
            href="/post"
            className="hidden sm:block rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#F59E0B,#FBBF24)' }}
          >
            {t.nav.postJob}
          </Link>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  )
}

