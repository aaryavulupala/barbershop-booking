import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return Response.json({ success: false })

    const { slotId, serviceId, customerName, customerEmail, notes } = session.metadata

    await supabase.from('bookings').insert({
      slot_id: slotId,
      service_id: serviceId,
      customer_name: customerName,
      customer_email: customerEmail,
      notes: notes || null,
      paid: true,
    })

    await supabase.from('time_slots').update({ is_booked: true }).eq('id', slotId)

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ success: false })
  }
}