'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'

export default function LogoutButton() {
  const router = useRouter()
  const { t } = useLanguage()
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    if (pending) return
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="hidden sm:block rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
    >
      {pending ? (t.nav.loggingOut ?? 'Logging out…') : (t.nav.logout ?? 'Log out')}
    </button>
  )
}
