import { createAppointment } from '@/lib/appointments'

// Pay-at-appointment bookings. Paid bookings go through Stripe + /api/checkout/verify.
export async function POST(request) {
  const body = await request.json().catch(() => null)
  const { date, startTime, serviceId, barberId, customerName, customerEmail, notes } = body || {}

  if (!date || !startTime || !serviceId || !barberId || !customerName?.trim() || !customerEmail?.includes('@')) {
    return Response.json({ error: 'Please fill in your name and email.' }, { status: 400 })
  }

  try {
    const result = await createAppointment({ date, startTime, serviceId, barberId, customerName: customerName.trim(), customerEmail: customerEmail.trim(), notes, paid: false })
    if (result.ok) return Response.json({ success: true, appointment: result.appointment })
    if (result.reason === 'unavailable') return Response.json({ error: 'Sorry, that time was just taken. Please pick another.' }, { status: 409 })
    return Response.json({ error: 'Something went wrong, please try again.' }, { status: 500 })
  } catch (err) {
    console.error('Booking failed', err)
    return Response.json({ error: 'Something went wrong, please try again.' }, { status: 500 })
  }
}
