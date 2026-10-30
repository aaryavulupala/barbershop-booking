import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAvailableSlots } from '@/lib/availability'

export async function GET(request) {
  const serviceId = new URL(request.url).searchParams.get('serviceId')

  const { data: service } = await supabaseAdmin.from('services').select('duration_minutes').eq('id', serviceId).single()
  if (!service) return Response.json({ error: 'Unknown service.' }, { status: 400 })

  try {
    const days = await getAvailableSlots(service.duration_minutes)
    return Response.json({ days })
  } catch (err) {
    // Fail closed: if the calendar can't be read we can't promise any time is free.
    console.error('Availability failed', err)
    return Response.json({ error: 'Availability is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }
}
