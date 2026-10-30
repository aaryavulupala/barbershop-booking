import { createClient } from '@supabase/supabase-js'
import { sendReminderEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TZ = 'America/New_York'
const MORNING_HOUR = 8 // send the day-of reminder from 8:00 AM
const HOUR_WINDOW_MIN = 70 // "1 hour before" fires once an appointment is <= 70 min away

function nowInNewYork() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  )
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) }
}

function formatTime(time) {
  const [hour, minute] = time.slice(0, 5).split(':')
  const h = parseInt(hour)
  return `${h % 12 || 12}:${minute} ${h >= 12 ? 'PM' : 'AM'}`
}

// Claim the reminder before sending so two overlapping runs can't both email.
async function claim(bookingId, column) {
  const { data } = await supabase
    .from('bookings')
    .update({ [column]: new Date().toISOString() })
    .eq('id', bookingId)
    .is(column, null)
    .select('id')
  return data?.length > 0
}

export async function POST(request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = nowInNewYork()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_email, morning_reminder_sent_at, hour_reminder_sent_at, services ( name ), time_slots!inner ( slot_date, start_time )')
    .eq('time_slots.slot_date', now.date)

  if (error) {
    console.error('Reminder query failed', error)
    return Response.json({ error: 'Query failed' }, { status: 500 })
  }

  const sent = { morning: 0, hour: 0 }

  for (const b of bookings) {
    const [h, m] = b.time_slots.start_time.split(':').map(Number)
    const minutesUntil = h * 60 + m - now.minutes
    if (minutesUntil <= 0) continue // already started

    let kind = null
    let column = null
    if (minutesUntil <= HOUR_WINDOW_MIN) {
      if (!b.hour_reminder_sent_at) { kind = 'hour'; column = 'hour_reminder_sent_at' }
    } else if (now.minutes >= MORNING_HOUR * 60 && !b.morning_reminder_sent_at) {
      kind = 'morning'; column = 'morning_reminder_sent_at'
    }
    if (!kind || !(await claim(b.id, column))) continue

    const { error: emailError } = await sendReminderEmail({
      kind,
      customerName: b.customer_name,
      customerEmail: b.customer_email,
      serviceName: b.services?.name ?? 'Haircut',
      time: formatTime(b.time_slots.start_time),
    })

    if (emailError) {
      console.error('Reminder email failed', b.id, kind, emailError)
      await supabase.from('bookings').update({ [column]: null }).eq('id', b.id) // retry next run
    } else {
      sent[kind]++
    }
  }

  return Response.json({ checked: bookings.length, sent })
}
