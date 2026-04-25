'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Role = 'helper' | 'poster' | null

export default function RequestBell({ userId }: { userId: string }) {
  const [count, setCount] = useState(0)
  const [role, setRole] = useState<Role>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function loadRoleAndCount() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      const resolvedRole = (profile?.role ?? null) as Role
      if (!active) return
      setRole(resolvedRole)
      if (!resolvedRole) {
        setCount(0)
        return
      }
      const { count: c } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq(resolvedRole === 'helper' ? 'helper_id' : 'poster_id', userId)
        .eq('status', resolvedRole === 'helper' ? 'pending' : 'accepted')
      if (active) setCount(c ?? 0)
    }

    void loadRoleAndCount()

    const helperChannel = supabase
      .channel(`request-bell-helper-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `helper_id=eq.${userId}` },
        () => void loadRoleAndCount(),
      )
      .subscribe()

    const posterChannel = supabase
      .channel(`request-bell-poster-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `poster_id=eq.${userId}` },
        () => void loadRoleAndCount(),
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(helperChannel)
      void supabase.removeChannel(posterChannel)
    }
  }, [userId])

  if (!role) return null

  return (
    <Link
      href="/dashboard"
      className="hidden sm:inline-flex relative h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
      title="Requests"
      aria-label="Requests"
    >
      <Bell size={16} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white min-w-[16px] text-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
