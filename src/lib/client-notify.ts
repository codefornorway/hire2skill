export type NotifyResult = { ok: true } | { ok: false; status?: number; reason: 'network' | 'http' }

export async function postNotify(payload: unknown): Promise<NotifyResult> {
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return { ok: false, status: res.status, reason: 'http' }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

