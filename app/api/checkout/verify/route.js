import Stripe from 'stripe'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { createAppointment } from '@/lib/appointments'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(request) {
  const sessionId = new URL(request.url).searchParams.get('session_id')

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return Response.json({ success: false })

    const { date, startTime, serviceId, barberId, customerName, customerEmail, notes } = session.metadata

    // The success page can be refreshed or revisited; only book + email once.
    const { data: existing } = await supabase.from('bookings').select('id').eq('stripe_session_id', sessionId).maybeSingle()
    if (existing) {
      const { data: service } = await supabase.from('services').select('name, duration_minutes').eq('id', serviceId).single()
      return Response.json({ success: true, appointment: { date, startTime, durationMinutes: service.duration_minutes, serviceName: service.name } })
    }

    const result = await createAppointment({ date, startTime, serviceId, barberId, customerName, customerEmail, notes, paid: true, sessionId })
    if (result.ok) return Response.json({ success: true, appointment: result.appointment })

    if (result.reason === 'unavailable') {
      // Someone else took the time while this person was paying — give the money back.
      try {
        await stripe.refunds.create({ payment_intent: session.payment_intent })
      } catch (err) {
        console.error('Refund failed', err)
        return Response.json({ success: false, reason: 'slot_taken_refund_failed' })
      }
      return Response.json({ success: false, reason: 'slot_taken' })
    }

    return Response.json({ success: false })
  } catch (err) {
    console.error(err)
    return Response.json({ success: false })
  }
}
