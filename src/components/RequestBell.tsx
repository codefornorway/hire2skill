'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useNotificationFeed } from '@/hooks/useNotificationFeed'
import NotificationFeedList from '@/components/NotificationFeedList'

export default function RequestBell({ userId, messageUnreadCount = 0 }: { userId: string; messageUnreadCount?: number }) {
  const { t } = useLanguage()
  const p = t.notificationsPage
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { role, items, readIds, addReadIds, unreadCount } = useNotificationFeed(userId)
  const totalUnread = unreadCount + messageUnreadCount

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  if (!role) return null

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v
            if (next) addReadIds(items.map((i) => i.id))
            return next
          })
        }}
        className="inline-flex relative h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        title={t.nav.notifications}
        aria-label={t.nav.notifications}
      >
        <Bell size={16} />
        {totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white min-w-[16px] text-center">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed left-3 right-3 top-16 z-[60] max-h-[min(70vh,24rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-h-none">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">{p.title}</p>
            <span className="text-xs text-gray-400">{p.unread(unreadCount)}</span>
          </div>
          <NotificationFeedList
            items={items}
            readIds={readIds}
            addReadIds={addReadIds}
            emptyLabel={p.emptyShort}
            onItemNavigate={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
