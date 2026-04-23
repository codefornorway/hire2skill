'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

type Post = {
  id: string
  title: string
  category: string
  location: string
  created_at: string
}

type Props = {
  email: string
  postCount: number
  recentPosts: Post[]
  posted: boolean
}

export default function DashboardContent({ email, postCount, recentPosts, posted }: Props) {
  const { t } = useLanguage()
  const firstName = email.split('@')[0]

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 w-full">
      {posted && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {t.dashboard.posted}
        </div>
      )}

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.welcome}, {firstName} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">{t.dashboard.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t.dashboard.stats.posts, value: postCount },
          { label: t.dashboard.stats.applications, value: 0 },
          { label: t.dashboard.stats.messages, value: 0 },
          { label: t.dashboard.stats.views, value: 0 },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-white border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          {t.dashboard.quickActions}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/post"
            className="flex items-center gap-4 rounded-xl p-5 text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
          >
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div>
              <p className="font-semibold text-sm">{t.dashboard.postJob}</p>
              <p className="text-xs text-blue-100">{t.dashboard.postJobSub}</p>
            </div>
          </Link>

          <Link href="/chat" className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{t.nav.messages}</p>
              <p className="text-xs text-gray-400">{t.dashboard.chatSub}</p>
            </div>
          </Link>

          <Link href="/profile" className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{t.nav.profile}</p>
              <p className="text-xs text-gray-400">{t.dashboard.profileSub}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {t.dashboard.recentPosts}
          </h2>
          <Link href="/post" className="text-xs text-blue-600 hover:underline">{t.dashboard.newPost}</Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentPosts.map(post => (
              <div key={post.id} className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.location} · {post.category}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-400 mb-3">{t.dashboard.noPosts}</p>
            <Link
              href="/post"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
            >
              {t.dashboard.createFirst}
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
