'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Role = 'helper' | 'poster' | null
type BellItem = {
  id: string
  text: string
  href: string
  createdAt: string
  type: 'booking' | 'message'
}

export default function RequestBell({ userId }: { userId: string }) {
  const [role, setRole] = useState<Role>(null)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<BellItem[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)
  const readStorageKey = `h2s.readNotifications.${userId}`

  function addReadIds(ids: string[]) {
    if (ids.length === 0) return
    setReadIds(prev => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }

  const loadNotifications = useCallback(async (supabase = createClient()) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    const resolvedRole = (profile?.role ?? null) as Role
    setRole(resolvedRole)
    if (!resolvedRole) {
      setItems([])
      return
    }

    const partyColumn = resolvedRole === 'helper' ? 'helper_id' : 'poster_id'
    const { data: bookingRows } = await supabase
      .from('bookings')
      .select('id, poster_id, helper_id, status, created_at, updated_at')
      .eq(partyColumn, userId)
      .order('created_at', { ascending: false })
      .limit(30)

    const bookings = bookingRows ?? []
    const otherIds = [...new Set(bookings.map((b) => (resolvedRole === 'helper' ? b.poster_id : b.helper_id)))]
    const bookingIds = bookings.map((b) => b.id)

    const [{ data: profiles }, { data: unreadMessages }] = await Promise.all([
      otherIds.length > 0
        ? supabase.from('profiles').select('id, display_name').in('id', otherIds)
        : Promise.resolve({ data: [] as { id: string; display_name: string | null }[] }),
      bookingIds.length > 0
        ? supabase
          .from('messages')
          .select('id, booking_id, sender_id, created_at')
          .in('booking_id', bookingIds)
          .neq('sender_id', userId)
          .is('read_at', null)
          .order('created_at', { ascending: false })
          .limit(60)
        : Promise.resolve({ data: [] as { id: string; booking_id: string; sender_id: string; created_at: string }[] }),
    ])

    const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name ?? 'Someone']))
    const bookingById = Object.fromEntries(bookings.map((b) => [b.id, b]))
    const next: BellItem[] = []

    for (const b of bookings) {
      const otherId = resolvedRole === 'helper' ? b.poster_id : b.helper_id
      const who = nameById[otherId] ?? 'Someone'
      const stamp = b.updated_at ?? b.created_at
      if (resolvedRole === 'helper' && b.status === 'pending') {
        next.push({
          id: `booking:${b.id}:pending:${stamp}`,
          text: `${who} sent you a request`,
          href: `/chat/${b.id}`,
          createdAt: stamp,
          type: 'booking',
        })
      }
      if (b.status === 'accepted' || b.status === 'declined' || b.status === 'cancelled' || b.status === 'completed') {
        const txt = b.status === 'accepted'
          ? `${who} accepted`
          : b.status === 'declined'
            ? `${who} declined`
            : b.status === 'cancelled'
              ? `${who} cancelled this job`
              : `${who} marked this as completed`
        next.push({
          id: `booking:${b.id}:${b.status}:${stamp}`,
          text: txt,
          href: `/chat/${b.id}`,
          createdAt: stamp,
          type: 'booking',
        })
      }
    }

    const seenBookingMsg = new Set<string>()
    for (const m of unreadMessages ?? []) {
      if (seenBookingMsg.has(m.booking_id)) continue
      seenBookingMsg.add(m.booking_id)
      const booking = bookingById[m.booking_id]
      if (!booking) continue
      const otherId = booking.poster_id === userId ? booking.helper_id : booking.poster_id
      const who = nameById[otherId] ?? 'Someone'
      next.push({
        id: `message:${m.id}`,
        text: `${who} sent you a message`,
        href: `/chat/${m.booking_id}`,
        createdAt: m.created_at,
        type: 'message',
      })
    }

    next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setItems(next.slice(0, 20))
  }, [userId])

  useEffect(() => {
    const supabase = createClient()
    let active = true

    queueMicrotask(() => {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(readStorageKey) : null
        if (raw) setReadIds(new Set(JSON.parse(raw) as string[]))
      } catch {
        // ignore storage parse errors
      }
      void loadNotifications(supabase)
    })

    const helperChannel = supabase
      .channel(`request-bell-helper-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `helper_id=eq.${userId}` },
        () => { if (active) void loadNotifications(supabase) },
      )
      .subscribe()

    const posterChannel = supabase
      .channel(`request-bell-poster-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `poster_id=eq.${userId}` },
        () => { if (active) void loadNotifications(supabase) },
      )
      .subscribe()

    const messagesChannel = supabase
      .channel(`request-bell-messages-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => { if (active) void loadNotifications(supabase) },
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(helperChannel)
      void supabase.removeChannel(posterChannel)
      void supabase.removeChannel(messagesChannel)
    }
  }, [loadNotifications, readStorageKey, userId])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(readStorageKey, JSON.stringify(Array.from(readIds)))
      }
    } catch {
      // ignore storage write errors
    }
  }, [readIds, readStorageKey])

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  const unreadCount = useMemo(() => items.filter(i => !readIds.has(i.id)).length, [items, readIds])

  if (!role) return null

  return (
    <div ref={panelRef} className="hidden sm:block relative">
      <button
        type="button"
        onClick={() => {
          setOpen(v => {
            const next = !v
            if (next) addReadIds(items.map(i => i.id))
            return next
          })
        }}
        className="inline-flex relative h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white min-w-[16px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">Notifications</p>
            <span className="text-xs text-gray-400">{unreadCount} unread</span>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-xs text-gray-400">No new notifications yet.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    addReadIds([item.id])
                    setOpen(false)
                  }}
                  className="block px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700">{item.text}</p>
                    {!readIds.has(item.id) && <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
