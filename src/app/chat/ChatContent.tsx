'use client'

import Link from 'next/link'
import type { Conversation } from './page'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function Avatar({ name, avatarUrl }: { name: string | null; avatarUrl: string | null }) {
  const initials = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const colors = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']
  const bg = colors[(name ?? '').charCodeAt(0) % colors.length]
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover shrink-0" />
  }
  return (
    <div className="h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
      style={{ background: bg }}>
      {initials}
    </div>
  )
}

export default function ChatContent({ conversations }: { conversations: Conversation[] }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10 w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
      <p className="text-sm text-gray-400 mb-6">Conversations with helpers and task posters.</p>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No conversations yet</p>
          <p className="text-sm text-gray-400">Conversations open once a booking request is accepted.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {conversations.map(conv => (
            <Link key={conv.bookingId} href={`/chat/${conv.bookingId}`}
              className="flex items-center gap-4 rounded-2xl bg-white border border-gray-200 px-5 py-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
              <div className="relative shrink-0">
                <Avatar name={conv.otherName} avatarUrl={conv.otherAvatar} />
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white px-1">
                    {conv.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                    {conv.otherName ?? 'Unknown user'}
                  </p>
                  {conv.lastMessageAt && (
                    <span className="text-xs text-gray-400 ml-2 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 truncate ${conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {conv.lastMessage ?? 'No messages yet — say hello!'}
                </p>
              </div>

              {conv.unreadCount > 0 && (
                <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
