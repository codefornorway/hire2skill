import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatContent from './ChatContent'

export type Conversation = {
  bookingId: string
  otherId: string
  otherName: string | null
  otherAvatar: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  status: string
}

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/chat')

  let conversations: Conversation[] = []

  try {
    const [{ data: asHelper }, { data: asPoster }] = await Promise.all([
      supabase.from('bookings').select('id, poster_id, helper_id, status').eq('helper_id', user.id).in('status', ['accepted', 'pending', 'completed']),
      supabase.from('bookings').select('id, poster_id, helper_id, status').eq('poster_id', user.id).in('status', ['accepted', 'pending', 'completed']),
    ])

    const allBookings = [
      ...(asHelper ?? []).map(b => ({ ...b, isHelper: true })),
      ...(asPoster ?? []).map(b => ({ ...b, isHelper: false })),
    ]

    if (allBookings.length > 0) {
      const otherIds = allBookings.map(b => b.isHelper ? b.poster_id : b.helper_id)
      const bookingIds = allBookings.map(b => b.id)

      const [{ data: profiles }, { data: msgs }] = await Promise.all([
        supabase.from('profiles').select('id, display_name, avatar_url').in('id', otherIds),
        supabase.from('messages')
          .select('id, booking_id, sender_id, body, created_at, read_at')
          .in('booking_id', bookingIds)
          .order('created_at', { ascending: false }),
      ])

      const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

      const msgsByBooking: Record<string, typeof msgs> = {}
      for (const m of msgs ?? []) {
        if (!msgsByBooking[m.booking_id]) msgsByBooking[m.booking_id] = []
        msgsByBooking[m.booking_id]!.push(m)
      }

      conversations = allBookings.map(b => {
        const otherId = b.isHelper ? b.poster_id : b.helper_id
        const profile = profileMap[otherId]
        const bMsgs = msgsByBooking[b.id] ?? []
        const last = bMsgs[0]
        return {
          bookingId: b.id,
          otherId,
          otherName: profile?.display_name ?? null,
          otherAvatar: profile?.avatar_url ?? null,
          lastMessage: last?.body ?? null,
          lastMessageAt: last?.created_at ?? null,
          unreadCount: bMsgs.filter(m => m.sender_id !== user.id && !m.read_at).length,
          status: b.status,
        }
      })

      conversations.sort((a, b) => {
        if (a.lastMessageAt && b.lastMessageAt)
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        if (a.lastMessageAt) return -1
        if (b.lastMessageAt) return 1
        return 0
      })
    }
  } catch {
    // messages table not yet created
  }

  return <ChatContent conversations={conversations} />
}
