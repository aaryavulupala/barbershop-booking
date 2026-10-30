import { buildSystemPrompt } from '@/lib/shopContext'

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const MAX_MESSAGE_CHARS = 500
const MAX_HISTORY = 8

// In-memory rate limit: fine for a single instance, resets on redeploy.
// Move to Upstash or a Supabase table if this ever runs on multiple instances.
const RATE_LIMIT = { max: 20, windowMs: 10 * 60 * 1000 }
const hits = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs)
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return false
}

const BOOKING_WORDS = ['book', 'appointment', 'schedule', 'reserve', 'slot', 'booking']

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: 'Chat is not configured.' }, { status: 500 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (isRateLimited(ip)) {
    return Response.json(
      { error: "You've sent a lot of messages — give it a few minutes." },
      { status: 429 }
    )
  }

  let messages
  try {
    ({ messages } = await request.json())
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 })
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'Bad request.' }, { status: 400 })
  }

  const last = messages[messages.length - 1]
  if (last?.role !== 'user' || typeof last.text !== 'string' || !last.text.trim()) {
    return Response.json({ error: 'Bad request.' }, { status: 400 })
  }
  if (last.text.length > MAX_MESSAGE_CHARS) {
    return Response.json({ error: 'That message is a bit long — try shortening it.' }, { status: 400 })
  }

  // Gemini wants user/model turns, starting with a user turn. Drop the canned
  // greeting and any client-side error bubbles.
  const history = messages
    .slice(-MAX_HISTORY)
    .filter((m) => (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      role: m.role === 'bot' ? 'model' : 'user',
      parts: [{ text: m.text.slice(0, MAX_MESSAGE_CHARS) }],
    }))
  while (history.length && history[0].role !== 'user') history.shift()

  try {
    const systemPrompt = await buildSystemPrompt()

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: history,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
      }
    )

    if (!res.ok) {
      console.error('Gemini error', res.status, await res.text())
      return Response.json({ error: 'Something went wrong.' }, { status: 502 })
    }

    const data = await res.json()
    const reply = data.candidates?.[0]?.content?.parts
      ?.filter((p) => !p.thought && typeof p.text === 'string')
      .map((p) => p.text)
      .join('')
      .trim()

    if (!reply) {
      return Response.json({ error: 'Something went wrong.' }, { status: 502 })
    }

    const haystack = `${reply} ${last.text}`.toLowerCase()
    const showBookingCta = BOOKING_WORDS.some((w) => haystack.includes(w))

    return Response.json({ reply, showBookingCta })
  } catch (err) {
    console.error('Chat route failed', err)
    return Response.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
