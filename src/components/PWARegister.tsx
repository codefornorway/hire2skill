'use client'

import { useEffect, useState } from 'react'
import { PUBLIC_ENV } from '@/lib/env/public'

const VAPID_PUBLIC_KEY = PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

async function subscribeToPush(registration: ServiceWorkerRegistration) {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY')
  }
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })
}

export default function PWARegister() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Show push prompt after 10 s if not yet granted/denied
        if (Notification.permission === 'default') {
          const timer = setTimeout(() => setShowPrompt(true), 10_000)
          return () => clearTimeout(timer)
        }
        // Already granted — silently subscribe
        if (Notification.permission === 'granted') {
          subscribeToPush(reg).then(saveSubscription).catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  async function enableNotifications() {
    setShowPrompt(false)
    const reg = await navigator.serviceWorker.ready
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    try {
      const sub = await subscribeToPush(reg)
      await saveSubscription(sub)
    } catch {}
  }

  if (!showPrompt || dismissed) return null

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50
                    bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex gap-3 items-start">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-lg"
        style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
        🔔
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm">Stay in the loop</p>
        <p className="text-xs text-gray-500 mt-0.5">Get notified about bookings and messages.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={enableNotifications}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
            Enable
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200">
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

async function saveSubscription(sub: PushSubscription) {
  const json = sub.toJSON()
  await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    }),
  })
}
