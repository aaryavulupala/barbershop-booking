import { buildSystemPrompt } from '@/lib/shopContext'

const MODEL = 'llama-3.1-8b-instant'
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
  if (!process.env.GROQ_API_KEY) {
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

  const history = messages
    .slice(-MAX_HISTORY)
    .filter((m) => typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: m.text.slice(0, MAX_MESSAGE_CHARS),
    }))

  try {
    const systemPrompt = await buildSystemPrompt()

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      console.error('Groq error', res.status, await res.text())
      return Response.json({ error: 'Something went wrong.' }, { status: 502 })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content?.trim()

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
