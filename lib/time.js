// All appointments happen in New York wall-clock time. Vercel runs in UTC, so
// every date/time calculation goes through these helpers.

export const TZ = 'America/New_York'

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
})

function nyParts(ms) {
  return Object.fromEntries(partsFormatter.formatToParts(new Date(ms)).map((p) => [p.type, Number(p.value)]))
}

export function todayNY(ms = Date.now()) {
  const p = nyParts(ms)
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}

export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// New York offset from UTC (ms) at a given instant.
function offsetMs(ms) {
  const p = nyParts(ms)
  const whole = Math.floor(ms / 1000) * 1000
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - whole
}

// Epoch ms for "dateStr at <minutes> past midnight" in New York.
export function zonedToUtcMs(dateStr, minutes) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d, 0, minutes)
  const first = guess - offsetMs(guess)
  const second = guess - offsetMs(first) // re-check across a DST change
  return second
}

export function toMinutes(time) {
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

export function fromMinutes(total) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function formatTime12(time) {
  const [hour, minute] = time.slice(0, 5).split(':')
  const h = parseInt(hour)
  return `${h % 12 || 12}:${minute} ${h >= 12 ? 'PM' : 'AM'}`
}

export function formatDateLong(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
