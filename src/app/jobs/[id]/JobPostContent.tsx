'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { postNotify } from '@/lib/client-notify'
import { ArrowLeft, MapPin, Tag, Clock, Users, Share2 } from 'lucide-react'

type JobPost = {
  id: string
  posterId: string
  posterName: string
  title: string
  description: string
  category: string
  location: string
  budget: number | null
  createdAt: string
  proposalCount: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isMissingPostIdColumnError(msg?: string) {
  if (!msg) return false
  const lower = msg.toLowerCase()
  return lower.includes('post_id') && (lower.includes('column') || lower.includes('does not exist'))
}

export default function JobPostContent({
  post,
  currentUserId,
}: {
  post: JobPost
  currentUserId: string | null
}) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [offer, setOffer] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner = currentUserId === post.posterId
  const isGuest = !currentUserId

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: `${post.category} job in ${post.location}`, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId || sending) return
    setSending(true)
    setError(null)

    const supabase = createClient()

    // Duplicate check
    const dupCheck = await supabase
      .from('bookings')
      .select('id')
      .eq('post_id', post.id)
      .eq('poster_id', post.posterId)
      .eq('helper_id', currentUserId)
      .eq('status', 'pending')
      .limit(1)

    if ((dupCheck.data ?? []).length > 0) {
      setSending(false)
      setError('You already have a pending proposal for this job.')
      return
    }

    // Insert booking
    let bookingId: string | null = null
    const insertPayload = {
      post_id: post.id,
      poster_id: post.posterId,
      helper_id: currentUserId,
      status: 'pending',
      budget: offer ? Number(offer) : null,
      message: message.trim(),
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select('id')
      .single()

    if (isMissingPostIdColumnError(bookingError?.message)) {
      // Fallback: insert without post_id
      const payloadWithoutPostId = {
        poster_id: insertPayload.poster_id,
        helper_id: insertPayload.helper_id,
        status: insertPayload.status,
        budget: insertPayload.budget,
        message: insertPayload.message,
      }
      const fallback = await supabase
        .from('bookings')
        .insert(payloadWithoutPostId)
        .select('id')
        .single()
      if (fallback.error || !fallback.data) {
        setSending(false)
        setError(fallback.error?.message ?? 'Failed to send proposal. Please try again.')
        return
      }
      bookingId = fallback.data.id
    } else if (bookingError || !booking) {
      setSending(false)
      setError(bookingError?.message ?? 'Failed to send proposal. Please try again.')
      return
    } else {
      bookingId = booking.id
    }

    // Bootstrap chat message
    try {
      await supabase.from('messages').insert({
        booking_id: bookingId,
        sender_id: currentUserId,
        body: message.trim(),
      })
    } catch {
      // Optional — booking already created
    }

    // Notify the poster via email + push (same pattern as JobsContent)
    void postNotify({
      type: 'new-message',
      senderId: currentUserId,
      bookingId,
      preview: message.trim(),
    })

    setSending(false)
    setSent(true)
    router.push('/dashboard?requestSent=1')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{post.title}</h1>
              <p className="mt-1 text-sm text-gray-500">Posted by {post.posterName}</p>
            </div>
            {post.budget && (
              <div className="shrink-0 rounded-xl bg-green-50 border border-green-200 px-3 py-1.5 text-center">
                <p className="text-xs text-green-600 font-medium">Budget</p>
                <p className="text-lg font-bold text-green-700">{post.budget.toLocaleString()} kr</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
              <Tag className="h-3.5 w-3.5" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              {post.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(post.createdAt)}
            </span>
            {post.proposalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                <Users className="h-3.5 w-3.5" />
                {post.proposalCount} proposal{post.proposalCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {post.description && (
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">About this job</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{post.description}</p>
          </div>
        )}

        {/* CTA */}
        <div className="px-6 py-5">
          {isOwner ? (
            <p className="text-center text-sm text-gray-500">This is your job post.</p>
          ) : isGuest ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Sign in as a helper to send a proposal.</p>
              <Link
                href={`/login?next=/jobs/${post.id}`}
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                Log in to apply
              </Link>
            </div>
          ) : sent ? (
            <p className="text-center text-sm font-semibold text-green-700">
              Proposal sent! Redirecting to your dashboard…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Send a proposal</h2>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Your message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  minLength={10}
                  rows={4}
                  placeholder="Describe your experience and how you can help…"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Your price offer (kr) — optional
                </label>
                <input
                  type="number"
                  value={offer}
                  onChange={e => setOffer(e.target.value)}
                  min={1}
                  placeholder={post.budget ? `Budget: ${post.budget} kr` : 'e.g. 500'}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              {error && (
                <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                {sending ? 'Sending…' : 'Send Proposal'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
