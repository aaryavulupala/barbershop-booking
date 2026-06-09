import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const { serviceName, servicePrice, slotId, serviceId, barberId, customerName, customerEmail, notes } = await request.json()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: serviceName,
            description: 'The Chop Shop Barbers — appointment deposit',
          },
          unit_amount: Math.round(servicePrice * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      slotId,
      serviceId,
      barberId,
      customerName,
      customerEmail,
      notes: notes || '',
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/confirm`,
  })

  return Response.json({ url: session.url })
}