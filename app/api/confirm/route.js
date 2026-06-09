import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { customerName, customerEmail, serviceName, barberName, date, time } = await request.json()

  const { error } = await resend.emails.send({
    from: 'The Chop Shop <onboarding@resend.dev>', // UPDATE: replace with your domain email once you have one
    to: customerEmail,
    subject: 'Your appointment is confirmed ✂️',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
        <h2 style="font-size: 1.4rem; font-weight: 600; margin-bottom: 0.5rem;">You're booked, ${customerName}.</h2>
        <p style="color: #666; margin-bottom: 2rem;">Here's your appointment summary:</p>

        <div style="border: 1px solid #f0f0f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <table style="width: 100%; font-size: 0.9rem;">
            <tr>
              <td style="color: #aaa; padding: 0.4rem 0;">Service</td>
              <td style="text-align: right; font-weight: 500;">${serviceName}</td>
            </tr>
            <tr>
              <td style="color: #aaa; padding: 0.4rem 0;">Barber</td>
              <td style="text-align: right; font-weight: 500;">${barberName}</td>
            </tr>
            <tr>
              <td style="color: #aaa; padding: 0.4rem 0;">Date</td>
              <td style="text-align: right; font-weight: 500;">${date}</td>
            </tr>
            <tr>
              <td style="color: #aaa; padding: 0.4rem 0;">Time</td>
              <td style="text-align: right; font-weight: 500;">${time}</td>
            </tr>
          </table>
        </div>

        <p style="color: #666; font-size: 0.85rem;">Need to reschedule? Reply to this email and we'll sort it out.</p>
        <p style="color: #666; font-size: 0.85rem; margin-top: 1.5rem;">— The Chop Shop</p>
      </div>
    `
  })

  if (error) {
    return Response.json({ error }, { status: 500 })
  }

  return Response.json({ success: true })
}