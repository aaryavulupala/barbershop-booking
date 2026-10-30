import Stripe from 'stripe'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { isSlotAvailable } from '@/lib/availability'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.json().catch(() => null)
  const { date, startTime, serviceId, barberId, customerName, customerEmail, notes } = body || {}

  if (!date || !startTime || !serviceId || !barberId || !customerName?.trim() || !customerEmail?.includes('@')) {
    return Response.json({ error: 'Please fill in your name and email.' }, { status: 400 })
  }

  // Price and name come from the database, never the browser.
  const { data: service } = await supabase.from('services').select('name, price, duration_minutes').eq('id', serviceId).single()
  if (!service) return Response.json({ error: 'Unknown service.' }, { status: 400 })

  try {
    if (!(await isSlotAvailable(date, startTime, service.duration_minutes))) {
      return Response.json({ error: 'Sorry, that time was just taken. Please pick another.' }, { status: 409 })
    }
  } catch (err) {
    console.error('Availability check failed', err)
    return Response.json({ error: 'Could not check availability. Please try again shortly.' }, { status: 503 })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.name,
            description: 'Aarya Cuts — appointment deposit',
          },
          unit_amount: Math.round(service.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      date,
      startTime: startTime.slice(0, 5),
      serviceId,
      barberId,
      customerName: customerName.trim(),
      customerEmail,
      notes: (notes || '').slice(0, 450),
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/confirm`,
  })

  return Response.json({ url: session.url })
}
