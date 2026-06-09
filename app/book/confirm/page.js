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

  async function handleConfirm() {
    if (!name || !email) return alert('Please fill in your name and email')
    setLoading(true)

    // Create the booking
    const { error: bookingError } = await supabase.from('bookings').insert({
      slot_id: slot.id,
      service_id: service.id,
      customer_name: name,
      customer_email: email,
    })

    if (bookingError) {
      console.error(bookingError)
      alert('Something went wrong, please try again')
      setLoading(false)
      return
    }

    // Mark the slot as booked
    const { error: slotError } = await supabase
      .from('time_slots')
      .update({ is_booked: true })
      .eq('id', slot.id)

    if (slotError) {
      console.error(slotError)
      setLoading(false)
      return
    }

    // Clear localStorage
    localStorage.removeItem('selectedService')
    localStorage.removeItem('selectedBarber')
    localStorage.removeItem('selectedSlot')

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-6">✂️</div>
        <h1 className="text-3xl font-bold mb-2">You're booked!</h1>
        <p className="text-gray-500 mb-8">We'll see you soon. Check your email for confirmation.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all"
        >
          Back to Home
        </button>
      </main>
    )
  }

  if (!service || !barber || !slot) {
    return <p className="p-8">Loading...</p>
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-8">Step 4 of 4 — Confirm your booking</p>

      {/* Booking summary */}
      <div className="border rounded-xl p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-lg">Booking Summary</h2>
        <div className="flex justify-between text-gray-600">
          <span>Service</span>
          <span className="font-medium text-black">{service.name}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Barber</span>
          <span className="font-medium text-black">{barber.name}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Date</span>
          <span className="font-medium text-black">
            {new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('default', {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Time</span>
          <span className="font-medium text-black">{formatTime(slot.start_time)}</span>
        </div>
        <div className="flex justify-between text-gray-600 border-t pt-4">
          <span>Total</span>
          <span className="font-bold text-black text-lg">${service.price}</span>
        </div>
      </div>

      {/* Customer details */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-all"
          />
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {loading ? 'Confirming...' : 'Confirm Booking'}
      </button>

      <button
        onClick={() => router.back()}
        className="mt-6 text-gray-400 hover:text-black transition-all"
      >
        ← Back
      </button>
    </main>
  )
}