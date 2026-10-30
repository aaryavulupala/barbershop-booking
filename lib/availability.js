import { listEvents } from '@/lib/googleCalendar'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { addDays, fromMinutes, todayNY, toMinutes, zonedToUtcMs } from '@/lib/time'

// ── Booking rules ──
const OPEN_MIN = 9 * 60 // first start 9:00 AM
const CLOSE_MIN = 20 * 60 // appointment must finish by 8:00 PM
const STEP_MIN = 30
const EVENT_BUFFER_MIN = 60 // keep 1 hour clear before and after any calendar event
const WINDOW_DAYS = 30 // bookable up to a month ahead
const MIN_NOTICE_MIN = 60 // no same-minute bookings

const MIN = 60_000

// Intervals that block bookings. `buffer` is extra clearance around the interval.
async function loadBusy(fromDate, toDate) {
  const windowStart = zonedToUtcMs(fromDate, 0)
  const windowEnd = zonedToUtcMs(addDays(toDate, 1), 0)

  const [events, bookings] = await Promise.all([
    listEvents(windowStart - EVENT_BUFFER_MIN * MIN, windowEnd + EVENT_BUFFER_MIN * MIN),
    supabaseAdmin
      .from('bookings')
      .select('services ( duration_minutes ), time_slots!inner ( slot_date, start_time )')
      .gte('time_slots.slot_date', fromDate)
      .lte('time_slots.slot_date', toDate),
  ])
  if (bookings.error) throw bookings.error

  const busy = []

  for (const ev of events) {
    if (ev.status === 'cancelled' || ev.transparency === 'transparent') continue
    if (ev.extendedProperties?.private?.source === 'aaryacuts') continue // covered by bookings below
    if (ev.attendees?.some((a) => a.self && a.responseStatus === 'declined')) continue

    // All-day events block the whole day(s).
    const start = ev.start.dateTime ? Date.parse(ev.start.dateTime) : zonedToUtcMs(ev.start.date, 0)
    const end = ev.end.dateTime ? Date.parse(ev.end.dateTime) : zonedToUtcMs(ev.end.date, 0)
    busy.push({ start, end, buffer: ev.start.dateTime ? EVENT_BUFFER_MIN * MIN : 0 })
  }

  for (const b of bookings.data) {
    const start = zonedToUtcMs(b.time_slots.slot_date, toMinutes(b.time_slots.start_time))
    busy.push({ start, end: start + (b.services?.duration_minutes ?? 30) * MIN, buffer: 0 })
  }

  return busy
}

// Returns { 'YYYY-MM-DD': ['09:00', '09:30', ...] } for every day in range.
export async function getAvailableSlots(durationMinutes, { fromDate, toDate } = {}) {
  const today = todayNY()
  const lastBookable = addDays(today, WINDOW_DAYS)
  const from = fromDate && fromDate > today ? fromDate : today
  const to = toDate && toDate < lastBookable ? toDate : lastBookable

  const days = {}
  if (from > to) return days

  const busy = await loadBusy(from, to)
  const earliest = Date.now() + MIN_NOTICE_MIN * MIN

  for (let date = from; date <= to; date = addDays(date, 1)) {
    days[date] = []
    for (let start = OPEN_MIN; start + durationMinutes <= CLOSE_MIN; start += STEP_MIN) {
      const s = zonedToUtcMs(date, start)
      const e = s + durationMinutes * MIN
      if (s < earliest) continue
      if (busy.some((b) => s < b.end + b.buffer && e > b.start - b.buffer)) continue
      days[date].push(fromMinutes(start))
    }
  }
  return days
}

export async function isSlotAvailable(date, startTime, durationMinutes) {
  const days = await getAvailableSlots(durationMinutes, { fromDate: date, toDate: date })
  return Boolean(days[date]?.includes(startTime.slice(0, 5)))
}
