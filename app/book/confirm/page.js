'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Confirm() {
  const [service, setService] = useState(null)
  const [barber, setBarber] = useState(null)
  const [slot, setSlot] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setService(JSON.parse(localStorage.getItem('selectedService')))
    setBarber(JSON.parse(localStorage.getItem('selectedBarber')))
    setSlot(JSON.parse(localStorage.getItem('selectedSlot')))
  }, [])

  function formatTime(time) {
    const [hour, minute] = time.slice(0, 5).split(':')
    const h = parseInt(hour)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minute} ${ampm}`
  }

async function handlePayNow() {
  if (!name || !email) return alert('Please fill in your name and email')
  setLoading(true)

  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceName: service.name,
      servicePrice: service.price,
      slotId: slot.id,
      serviceId: service.id,
      barberId: barber.id,
      customerName: name,
      customerEmail: email,
      notes: notes || '',
    })
  })

  const { url } = await res.json()
  window.location.href = url
}
  
  async function handleConfirm() {
    if (!name || !email) return alert('Please fill in your name and email')
    setLoading(true)

    const { error: bookingError } = await supabase.from('bookings').insert({
  slot_id: slot.id,
  service_id: service.id,
  customer_name: name,
  customer_email: email,
  notes: notes || null,
})

    if (bookingError) {
      console.error(bookingError)
      alert('Something went wrong, please try again')
      setLoading(false)
      return
    }

    await supabase.from('time_slots').update({ is_booked: true }).eq('id', slot.id)

    await fetch('/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        customerEmail: email,
        serviceName: service.name,
        barberName: barber.name,
        date: new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' }),
        time: formatTime(slot.start_time),
      })
    })

    if (phone) {
      await fetch('/api/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          customerName: name,
          date: new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' }),
          time: formatTime(slot.start_time),
        })
      })
    }

    localStorage.removeItem('selectedService')
    localStorage.removeItem('selectedBarber')
    localStorage.removeItem('selectedSlot')

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <main style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', background: '#fff' }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✂️</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>You're booked!</h1>
        <p style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 300, marginBottom: '2.5rem' }}>Check your email for confirmation. See you soon.</p>
        <button onClick={() => router.push('/')} style={{ background: '#0a0a0a', color: '#fff', padding: '0.875rem 2.5rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
          Back to home
        </button>
      </main>
    )
  }

  if (!service || !barber || !slot) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading...</p>

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#fff', color: '#0a0a0a', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <button onClick={() => router.push('/')} style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: '999px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', zIndex: 999 }}>← Home</button>

      <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>The Chop Shop</span>
      </nav>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '2.5rem' }}>
          {[1,2,3,4].map((s) => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '999px', background: '#0a0a0a' }} />
          ))}
        </div>

        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.75rem' }}>Step 4 of 4</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Confirm your booking</h1>
        <p style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 300, marginBottom: '2rem' }}>Review your details and confirm.</p>

        {/* Summary */}
        <div style={{ border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          {[
            { label: 'Service', value: service.name },
            { label: 'Barber', value: barber.name },
            { label: 'Date', value: new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' }) },
            { label: 'Time', value: formatTime(slot.start_time) },
            { label: 'Total', value: `$${service.price}` },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <span style={{ fontSize: '0.85rem', color: '#aaa' }}>{row.label}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: i === arr.length - 1 ? 600 : 500 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Phone <span style={{ color: '#ccc' }}>(optional — for SMS reminder)</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
  <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Notes <span style={{ color: '#ccc' }}>(optional — any details for your barber)</span></label>
  <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="e.g. I want a skin fade with a hard part..."
    rows={3}
    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
  />
</div>
        </div>

       <button
  onClick={handlePayNow}
  disabled={loading}
  style={{ width: '100%', background: '#635BFF', color: '#fff', padding: '0.875rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
>
  {loading ? 'Redirecting to Stripe...' : (
    <>
      {/* Place your stripe-logo-white.png in your public/images/ folder */}
      <img src="/images/stripe-logo-white.png" alt="Stripe" style={{ height: '18px', objectFit: 'contain' }} />
      <span>Pay now with Stripe — ${service?.price}</span>
    </>
  )}
</button>

<button
  onClick={handleConfirm}
  disabled={loading}
  style={{ width: '100%', background: '#fff', color: '#0a0a0a', padding: '0.875rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: '1px solid #e8e8e8', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
>
  {loading ? 'Booking...' : 'Reserve now, pay at appointment'}
</button>

        <button onClick={() => router.back()} style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
      </div>
    </main>
  )
}