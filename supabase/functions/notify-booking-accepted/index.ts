Deno.serve(async (req) => {
  // Notification delivery is now centralized in Next.js `/api/notify`.
  // Keep this endpoint as a no-op to avoid duplicate sends if old webhooks still call it.
  try {
    await req.arrayBuffer()
  } catch {
    // Ignore body parsing errors; this endpoint is intentionally passive.
  }
  return new Response(JSON.stringify({ ok: true, deprecated: true }), { status: 200 })
})
