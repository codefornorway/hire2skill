// Hire2Skill Service Worker — push notifications + offline shell

const CACHE = 'hire2skill-v1'
const OFFLINE_URL = '/offline'

// ── Install: cache the offline fallback page ─────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL]))
  )
  self.skipWaiting()
})

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first for navigation, passthrough for everything else ──────
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(OFFLINE_URL).then((r) => r ?? Response.error())
    )
  )
})

// ── Push: show a notification ─────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  let payload = { title: 'Hire2Skill', body: 'You have a new notification.', url: '/' }
  try {
    if (e.data) payload = { ...payload, ...e.data.json() }
  } catch {}

  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: payload.url,
      renotify: true,
      data: { url: payload.url },
    })
  )
})

// ── Notification click: focus existing tab or open new one ────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const target = e.notification.data?.url ?? '/'

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        const url = new URL(client.url)
        if (url.pathname === new URL(target, self.location.origin).pathname) {
          return client.focus()
        }
      }
      return self.clients.openWindow(target)
    })
  )
})
