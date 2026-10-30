import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { isSlotAvailable } from '@/lib/availability'
import { createEvent } from '@/lib/googleCalendar'
import { sendConfirmationEmail } from '@/lib/email'
import { formatDateLong, formatTime12, fromMinutes, toMinutes, TZ } from '@/lib/time'

// Books an appointment: re-checks availability, stores it, puts it on Aarya's
// Google Calendar and emails the customer. Used by both the Stripe and the
// pay-later flows.
export async function createAppointment({ date, startTime, serviceId, barberId, customerName, customerEmail, notes, paid, sessionId }) {
  const start = startTime.slice(0, 5)

  const [{ data: service }, { data: barber }] = await Promise.all([
    supabase.from('services').select('name, duration_minutes').eq('id', serviceId).single(),
    supabase.from('barbers').select('name').eq('id', barberId).single(),
  ])
  if (!service) return { ok: false, reason: 'bad_service' }

  if (!(await isSlotAvailable(date, start, service.duration_minutes))) return { ok: false, reason: 'unavailable' }

  // Reuse a leftover hand-made slot row if one exists, otherwise create one.
  const { data: existing } = await supabase
    .from('time_slots').select('id, is_booked')
    .eq('barber_id', barberId).eq('slot_date', date).eq('start_time', `${start}:00`).maybeSingle()
  if (existing?.is_booked) return { ok: false, reason: 'unavailable' }

  let slotId = existing?.id
  if (slotId) {
    await supabase.from('time_slots').update({ is_booked: true }).eq('id', slotId)
  } else {
    const { data: created, error } = await supabase
      .from('time_slots')
      .insert({ barber_id: barberId, slot_date: date, start_time: `${start}:00`, is_booked: true })
      .select('id').single()
    if (error) return { ok: false, reason: error.code === '23505' ? 'unavailable' : 'error' } // 23505 = someone else just took it
    slotId = created.id
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      slot_id: slotId,
      service_id: serviceId,
      customer_name: customerName,
      customer_email: customerEmail,
      notes: notes || null,
      paid,
      stripe_session_id: sessionId || null,
    })
    .select('id').single()
  if (bookingError) {
    await supabase.from('time_slots').update({ is_booked: false }).eq('id', slotId)
    console.error('Booking insert failed', bookingError)
    return { ok: false, reason: 'error' }
  }

  // Calendar + email failures shouldn't undo a booking that's already saved.
  try {
    const event = await createEvent({
      summary: `${service.name} — ${customerName}`,
      description: [`${customerName} <${customerEmail}>`, paid ? 'Paid online' : 'Pay at appointment', notes && `Notes: ${notes}`].filter(Boolean).join('\n'),
      startLocal: `${date}T${start}:00`,
      endLocal: `${date}T${fromMinutes(toMinutes(start) + service.duration_minutes)}:00`,
      timeZone: TZ,
    })
    await supabase.from('bookings').update({ google_event_id: event.id }).eq('id', booking.id)
  } catch (err) {
    console.error('Calendar event failed', err)
  }

  const { error: emailError } = await sendConfirmationEmail({
    customerName,
    customerEmail,
    serviceName: service.name,
    barberName: barber?.name ?? 'Aarya',
    date: formatDateLong(date),
    time: formatTime12(start),
  })
  if (emailError) console.error('Confirmation email failed', emailError)

  return { ok: true, appointment: { date, startTime: start, durationMinutes: service.duration_minutes, serviceName: service.name } }
}
