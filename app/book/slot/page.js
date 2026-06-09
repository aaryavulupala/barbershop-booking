'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PickSlot() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [barber, setBarber] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)
  const router = useRouter()

  // Generate all times from 9am to 8pm in 30 min increments
  const allTimes = []
  for (let hour = 9; hour < 20; hour++) {
    allTimes.push(`${String(hour).padStart(2, '0')}:00`)
    allTimes.push(`${String(hour).padStart(2, '0')}:30`)
  }

  useEffect(() => {
    const savedBarber = JSON.parse(localStorage.getItem('selectedBarber'))
    if (!savedBarber) {
      router.push('/book')
      return
    }
    setBarber(savedBarber)

    async function fetchSlots() {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('barber_id', savedBarber.id)
        .order('slot_date', { ascending: true })

      if (error) console.error(error)
      else setSlots(data)
      setLoading(false)
    }
    fetchSlots()
  }, [])

  const availableDates = [...new Set(slots.map((s) => s.slot_date))]

  function getSlotForTime(time) {
    return slots.find((s) => s.slot_date === selectedDate && s.start_time.slice(0, 5) === time)
  }

  function formatTime(time) {
    const [hour, minute] = time.split(':')
    const h = parseInt(hour)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minute} ${ampm}`
  }

  function formatDate(day) {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  function handleSelectSlot(slot) {
    setSelectedSlot(slot)
    localStorage.setItem('selectedSlot', JSON.stringify(slot))
  }

  function handleContinue() {
    if (selectedSlot) router.push('/book/confirm')
  }

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-8">Step 3 of 4 — Choose a date & time</p>

      {/* Calendar */}
      <div className="border rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="text-gray-400 hover:text-black transition-all px-2"
          >
            ←
          </button>
          <h2 className="font-semibold text-lg">{monthName}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="text-gray-400 hover:text-black transition-all px-2"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />
            const dateStr = formatDate(day)
            const hasSlots = availableDates.includes(dateStr)
            const isSelected = selectedDate === dateStr
            const isToday = dateStr === new Date().toISOString().split('T')[0]

            return (
              <button
                key={i}
                onClick={() => {
                  if (hasSlots) {
                    setSelectedDate(dateStr)
                    setSelectedSlot(null)
                  }
                }}
                disabled={!hasSlots}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all
                  ${isSelected ? 'bg-black text-white' : ''}
                  ${hasSlots && !isSelected ? 'hover:bg-gray-100 cursor-pointer' : ''}
                  ${!hasSlots ? 'text-gray-300 cursor-not-allowed' : ''}
                  ${isToday && !isSelected ? 'border border-black' : ''}
                `}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots list */}
      {selectedDate ? (
        <div>
          <h3 className="font-semibold text-lg mb-4">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
          </h3>

          <div className="border rounded-xl overflow-hidden divide-y max-h-96 overflow-y-auto">
            {allTimes.map((time) => {
              const slot = getSlotForTime(time)
              const isBooked = slot?.is_booked
              const isAvailable = slot && !isBooked
              const isSelected = selectedSlot?.id === slot?.id

              return (
                <button
                  key={time}
                  onClick={() => isAvailable && handleSelectSlot(slot)}
                  disabled={!isAvailable}
                  className={`
                    w-full flex items-center justify-between px-6 py-4 transition-all
                    ${isSelected ? 'bg-black text-white' : ''}
                    ${isAvailable && !isSelected ? 'hover:bg-gray-50 cursor-pointer' : ''}
                    ${isBooked ? 'bg-red-50 cursor-not-allowed' : ''}
                    ${!slot ? 'cursor-not-allowed' : ''}
                  `}
                >
                  <span className="font-medium">{formatTime(time)}</span>
                  <span className={`text-sm rounded-full px-3 py-1 font-medium
                    ${isSelected ? 'bg-white text-black' : ''}
                    ${isAvailable && !isSelected ? 'bg-green-100 text-green-700' : ''}
                    ${isBooked ? 'bg-red-100 text-red-600' : ''}
                    ${!slot ? 'bg-gray-100 text-gray-400' : ''}
                  `}>
                    {isSelected ? 'Selected' : isAvailable ? 'Available' : isBooked ? 'Booked' : 'Unavailable'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!selectedSlot}
            className={`mt-6 w-full py-4 rounded-xl font-semibold text-lg transition-all
              ${selectedSlot ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
          >
            {selectedSlot ? `Continue with ${formatTime(selectedSlot.start_time.slice(0, 5))}` : 'Select a time to continue'}
          </button>
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-4">Select a date to see available times</p>
      )}

      <button
        onClick={() => router.back()}
        className="mt-6 text-gray-400 hover:text-black transition-all"
      >
        ← Back
      </button>
    </main>
  )
}