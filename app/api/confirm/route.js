import { sendConfirmationEmail } from '@/lib/email'

export async function POST(request) {
  const { error } = await sendConfirmationEmail(await request.json())

  if (error) {
    return Response.json({ error }, { status: 500 })
  }

  return Response.json({ success: true })
}
