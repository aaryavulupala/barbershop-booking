import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConfirmationEmail({ customerName, customerEmail, serviceName, barberName, date, time }) {
  return resend.emails.send({
    from: 'Aarya Cuts <onboarding@resend.dev>', // UPDATE: replace with your domain email once you have one
    to: customerEmail,
    subject: 'Your appointment is confirmed ✂️',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
        <h2 style="font-size: 1.4rem; font-weight: 600; margin-bottom: 0.5rem;">You're booked, ${escapeHtml(customerName)}.</h2>
        <p style="color: #666; margin-bottom: 2rem;">Here's your appointment summary:</p>

        <div style="border: 1px solid #f0f0f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
          <table style="width: 100%; font-size: 0.9rem;">
            <tr>
              <td style="color: #aaa; padding: 0.4rem 0;">Service</td>
              <td style="text-align: right; font-weight: 500;">${escapeHtml(serviceName)}</td>
            </tr>
            <tr>
              <td style="color: #aaa; padding: 0.4rem 0;">Barber</td>
              <td style="text-align: right; font-weight: 500;">${escapeHtml(barberName)}</td>
            </tr>
            <tr>
              <td style="color: #aaa; padding: 0.4rem 0;">Date</td>
              <td style="text-align: right; font-weight: 500;">${escapeHtml(date)}</td>
            </tr>
            <tr>
              <td style="color: #aaa; padding: 0.4rem 0;">Time</td>
              <td style="text-align: right; font-weight: 500;">${escapeHtml(time)}</td>
            </tr>
          </table>
        </div>

        <p style="color: #666; font-size: 0.85rem;">Need to reschedule? Reply to this email and we'll sort it out.</p>
        <p style="color: #666; font-size: 0.85rem; margin-top: 1.5rem;">— Aarya Cuts</p>
      </div>
    `
  })
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export async function sendReminderEmail({ kind, customerName, customerEmail, serviceName, time }) {
  const headline = kind === 'hour' ? `Your cut is in about an hour, ${customerName}.` : `Today's the day, ${customerName}.`
  const subject = kind === 'hour' ? `Reminder: your appointment is at ${time}` : `Reminder: your appointment today at ${time}`

  return resend.emails.send({
    from: 'Aarya Cuts <onboarding@resend.dev>', // UPDATE: replace with your domain email once you have one
    to: customerEmail,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
        <h2 style="font-size: 1.4rem; font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(headline)}</h2>
        <p style="color: #666; margin-bottom: 1.5rem;">${escapeHtml(serviceName)} at <strong>${escapeHtml(time)}</strong>.</p>
        <p style="color: #666; font-size: 0.85rem;">Need to reschedule? Reply to this email as soon as you can.</p>
        <p style="color: #666; font-size: 0.85rem; margin-top: 1.5rem;">— Aarya Cuts</p>
      </div>
    `
  })
}
