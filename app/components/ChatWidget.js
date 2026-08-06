'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const GREETING = "Hey! I can help with services, pricing, or picking a cut. What's up?"

const SUGGESTIONS = [
  'What do you charge?',
  'What cut suits me?',
  'How does booking work?',
]

export default function ChatWidget() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: GREETING }])

  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading, open])

  useEffect(() => {
    if (open && !isMobile) inputRef.current?.focus()
  }, [open, isMobile])

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const next = [...messages, { role: 'user', text: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(({ role, text }) => ({ role, text })),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessages([...next, { role: 'error', text: data.error || 'Something went wrong — try again?' }])
      } else {
        setMessages([...next, { role: 'bot', text: data.reply, cta: data.showBookingCta }])
      }
    } catch {
      setMessages([...next, { role: 'error', text: 'Something went wrong — try again?' }])
    } finally {
      setLoading(false)
    }
  }

  const showSuggestions = messages.length === 1 && !loading

  const panelStyle = isMobile
    ? { position: 'fixed', inset: 0, width: '100%', height: '100%', borderRadius: 0, border: 'none' }
    : {
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        width: '380px',
        height: '560px',
        maxHeight: 'calc(100vh - 3rem)',
        borderRadius: '16px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
      }

  return (
    <>
      <style>{`
        @keyframes chopshop-dot { 0%, 60%, 100% { opacity: 0.25; } 30% { opacity: 1; } }
        @keyframes chopshop-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          style={{
            position: 'fixed',
            bottom: isMobile ? '1rem' : '1.5rem',
            right: isMobile ? '1rem' : '1.5rem',
            width: isMobile ? '48px' : '56px',
            height: isMobile ? '48px' : '56px',
            borderRadius: '50%',
            background: '#0a0a0a',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}

      {open && (
        <div
          style={{
            ...panelStyle,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
            color: '#0a0a0a',
            zIndex: 1000,
            animation: 'chopshop-in 0.18s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>The Chop Shop</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem' }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '82%',
                    padding: m.role === 'error' ? '0.25rem 0' : '0.7rem 0.95rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    background: m.role === 'user' ? '#0a0a0a' : m.role === 'error' ? 'transparent' : '#fafafa',
                    color: m.role === 'user' ? '#fff' : m.role === 'error' ? '#bbb' : '#0a0a0a',
                    fontStyle: m.role === 'error' ? 'italic' : 'normal',
                    border: m.role === 'bot' ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  {m.text}
                </div>

                {m.cta && (
                  <button
                    onClick={() => { setOpen(false); router.push('/book') }}
                    style={{ marginTop: '0.6rem', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: '999px', padding: '0.55rem 1.15rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Book now →
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '4px', padding: '0.7rem 0.95rem', alignSelf: 'flex-start', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0a0a0a', animation: `chopshop-dot 1.2s infinite ${d * 0.18}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0 1.25rem 0.75rem', flexShrink: 0 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '999px', padding: '0.45rem 0.9rem', fontSize: '0.78rem', color: '#555', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input) }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.25rem', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              maxLength={500}
              placeholder="Ask anything..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit', color: '#0a0a0a', background: 'transparent' }}
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={loading || !input.trim()}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                flexShrink: 0,
                background: loading || !input.trim() ? '#f0f0f0' : '#0a0a0a',
                color: loading || !input.trim() ? '#bbb' : '#fff',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
              }}
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  )
}
