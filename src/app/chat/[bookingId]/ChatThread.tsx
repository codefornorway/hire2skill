'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import type { ChatMessage } from './page'
import { logClientEvent } from '@/lib/telemetry'
import { useLanguage } from '@/context/LanguageContext'
import { postNotify } from '@/lib/client-notify'

function Avatar({ name, avatarUrl, size = 8 }: { name: string | null; avatarUrl: string | null; size?: number }) {
  const initials = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const safeName = name?.trim() || 'User'
  const colors = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']
  const bg = colors[(name ?? '').charCodeAt(0) % colors.length]
  const cls = `h-${size} w-${size} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`
  const px = size * 4
  if (avatarUrl) return <Image src={avatarUrl} alt={`${safeName} avatar`} width={px} height={px} className={`${cls} object-cover`} />
  return <div className={cls} style={{ background: bg }}>{initials}</div>
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function dateSeparatorLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

export default function ChatThread({
  bookingId,
  currentUserId,
  otherName,
  otherAvatar,
  initialMessages,
}: {
  bookingId: string
  currentUserId: string
  otherName: string | null
  otherAvatar: string | null
  initialMessages: ChatMessage[]
}) {
  const { t } = useLanguage()
  const c = t.chatPage
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [pendingRetry, setPendingRetry] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Real-time subscription for new messages in this conversation
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`,
      }, payload => {
        const msg = payload.new as ChatMessage
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
        if (msg.sender_id !== currentUserId) {
          supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', msg.id)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId, currentUserId, supabase])

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return
    setSending(true)
    setSendError(null)

    const optimisticId = `opt-${Date.now()}`
    const optimistic: ChatMessage = {
      id: optimisticId,
      created_at: new Date().toISOString(),
      sender_id: currentUserId,
      body: text,
      read_at: null,
    }
    setMessages(prev => [...prev, optimistic])

    const { data, error } = await supabase
      .from('messages')
      .insert({ booking_id: bookingId, sender_id: currentUserId, body: text })
      .select('id, created_at, sender_id, body, read_at')
      .single()

    if (error || !data) {
      setMessages(prev => prev.filter(m => m.id !== optimisticId))
      setSendError(error?.message ?? 'Could not send message. Check your connection and try again.')
      logClientEvent('chat.send', 'warn', 'Message insert failed', { bookingId, error: error?.message ?? 'unknown' })
      setPendingRetry(text)
      setSending(false)
      return
    }

    setMessages(prev => prev.map(m => m.id === optimisticId ? (data as ChatMessage) : m))
    setPendingRetry(null)

    const notify = await postNotify({
      type: 'new-message',
      senderId: currentUserId,
      bookingId,
      preview: text,
    })
    if (!notify.ok) {
      setSendError('Message delivered, but email/push notification may be delayed.')
      logClientEvent('chat.notify', 'warn', 'Notify request failed', { bookingId, reason: notify.reason, status: notify.status })
    }

    setSending(false)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text || sending) return
    setBody('')
    await sendMessage(text)
  }

  // Group messages by date for separator rendering
  const grouped: { dateLabel: string; msgs: ChatMessage[] }[] = []
  for (const msg of messages) {
    const label = dateSeparatorLabel(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (last?.dateLabel === label) {
      last.msgs.push(msg)
    } else {
      grouped.push({ dateLabel: label, msgs: [msg] })
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 69px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4 shrink-0">
        <Link href="/chat" aria-label="Back to conversations" className="text-gray-400 hover:text-gray-600 transition-colors mr-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <Avatar name={otherName} avatarUrl={otherAvatar} size={9} />
        <div>
          <p className="text-sm font-bold text-gray-900">{otherName ?? c.unknownUser}</p>
          <p className="text-xs text-green-600 font-medium">{c.bookingAccepted}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col bg-gray-50">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">{c.emptyThread}</p>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.dateLabel}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 shrink-0">{group.dateLabel}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex flex-col gap-1.5">
              {group.msgs.map(msg => {
                const isMine = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && <Avatar name={otherName} avatarUrl={otherAvatar} size={7} />}
                    <div className={`max-w-[70%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? 'text-white rounded-br-sm'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                        }`}
                        style={isMine ? { background: 'linear-gradient(135deg,#2563EB,#38BDF8)' } : {}}
                      >
                        {msg.body}
                      </div>
                      <span className="text-[11px] text-gray-400 px-1">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        className="flex flex-col gap-2 border-t border-gray-200 bg-white px-6 py-4 shrink-0">
        {sendError && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
            <p className="text-xs text-amber-900">{sendError}</p>
            {pendingRetry && (
              <button
                type="button"
                onClick={() => { void sendMessage(pendingRetry) }}
                disabled={sending}
                className="shrink-0 text-xs font-bold text-amber-900 underline disabled:opacity-40">
                Retry
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={c.inputPlaceholder}
          disabled={sending}
          className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!body.trim() || sending}
          className="h-11 w-11 rounded-2xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg,#2563EB,#38BDF8)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
        </div>
      </form>
    </div>
  )
}
