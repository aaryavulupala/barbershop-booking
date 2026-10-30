import { createSign } from 'node:crypto'

// Minimal Google Calendar client for a service account — signs the JWT itself
// so we don't need the heavy googleapis package.
//
// Env: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID

const SCOPE = 'https://www.googleapis.com/auth/calendar'
const API = 'https://www.googleapis.com/calendar/v3'

let cachedToken = { value: null, expiresAt: 0 }

const b64url = (value) => Buffer.from(value).toString('base64url')

function privateKey() {
  return (process.env.GOOGLE_PRIVATE_KEY || '').replace(/^"|"$/g, '').replace(/\\n/g, '\n')
}

async function accessToken() {
  if (cachedToken.value && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.value

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  if (!email || !privateKey()) throw new Error('Google Calendar credentials are not configured')

  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })
  )}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(privateKey(), 'base64url')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  })
  if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`)

  const data = await res.json()
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return cachedToken.value
}

async function google(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Google Calendar ${res.status}: ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

const calendarPath = () => `/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID)}`

export async function listEvents(timeMinMs, timeMaxMs) {
  const events = []
  let pageToken
  do {
    const params = new URLSearchParams({
      timeMin: new Date(timeMinMs).toISOString(),
      timeMax: new Date(timeMaxMs).toISOString(),
      singleEvents: 'true',
      maxResults: '2500',
      ...(pageToken && { pageToken }),
    })
    const data = await google(`${calendarPath()}/events?${params}`)
    events.push(...(data.items || []))
    pageToken = data.nextPageToken
  } while (pageToken)
  return events
}

// startLocal / endLocal are New York wall-clock strings like 2026-11-05T14:30:00
export async function createEvent({ summary, description, startLocal, endLocal, timeZone }) {
  return google(`${calendarPath()}/events`, {
    method: 'POST',
    body: JSON.stringify({
      summary,
      description,
      start: { dateTime: startLocal, timeZone },
      end: { dateTime: endLocal, timeZone },
      // Marks events we created so availability doesn't add a buffer around our own bookings.
      extendedProperties: { private: { source: 'aaryacuts' } },
    }),
  })
}

export async function deleteEvent(eventId) {
  return google(`${calendarPath()}/events/${encodeURIComponent(eventId)}`, { method: 'DELETE' })
}
