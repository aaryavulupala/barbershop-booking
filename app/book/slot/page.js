'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PickSlot() {
  const [days_, setDays] = useState({})
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [barber, setBarber] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)
  const router = useRouter()

  const allTimes = []
  for (let hour = 9; hour < 20; hour++) {
    allTimes.push(`${String(hour).padStart(2, '0')}:00`)
    allTimes.push(`${String(hour).padStart(2, '0')}:30`)
  }

  useEffect(() => {
    const savedBarber = JSON.parse(localStorage.getItem('selectedBarber'))
    const savedService = JSON.parse(localStorage.getItem('selectedService'))
    if (!savedBarber || !savedService) { router.push('/book'); return }
    setBarber(savedBarber)
    async function fetchAvailability() {
      try {
        const res = await fetch(`/api/availability?serviceId=${savedService.id}`)
        const data = await res.json()
        if (!res.ok) setLoadError(data.error || 'Could not load availability.')
        else setDays(data.days)
      } catch {
        setLoadError('Could not load availability.')
      }
      setLoading(false)
    }
    fetchAvailability()
  }, [])

  const availableDates = Object.keys(days_).filter((d) => days_[d].length > 0)

  function isAvailable(time) {
    return Boolean(days_[selectedDate]?.includes(time))
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
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  function handleSelectSlot(time) {
    const slot = { slot_date: selectedDate, start_time: time }
    setSelectedSlot(slot)
    localStorage.setItem('selectedSlot', JSON.stringify(slot))
  }

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading...</p>

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#fff', color: '#0a0a0a', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <button onClick={() => router.push('/')} style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: '999px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', zIndex: 999 }}>← Home</button>

      <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>Aarya Cuts</span>
      </nav>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '2.5rem' }}>
          {[1,2,3,4].map((s) => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '999px', background: s <= 3 ? '#0a0a0a' : '#f0f0f0' }} />
          ))}
        </div>

        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.75rem' }}>Step 3 of 4</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Choose a date & time</h1>
        <p style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 300, marginBottom: '2rem' }}>Pick an available date then select a time. Times are Eastern.</p>
        {loadError && <p style={{ fontSize: '0.85rem', color: '#e53e3e', marginBottom: '1.5rem' }}>{loadError}</p>}

        {/* Calendar */}
        <div style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#aaa', padding: '0.25rem 0.5rem' }}>←</button>
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{monthName}</span>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#aaa', padding: '0.25rem 0.5rem' }}>→</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: '#ccc', fontWeight: 500, padding: '0.25rem 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {days.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr = formatDate(day)
              const hasSlots = availableDates.includes(dateStr)
              const isSelected = selectedDate === dateStr
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              return (
                <button
                  key={i}
                  onClick={() => { if (hasSlots) { setSelectedDate(dateStr); setSelectedSlot(null) } }}
                  disabled={!hasSlots}
                  style={{ aspectRatio: '1', borderRadius: '8px', border: isToday && !isSelected ? '1px solid #0a0a0a' : 'none', background: isSelected ? '#0a0a0a' : 'transparent', color: isSelected ? '#fff' : hasSlots ? '#0a0a0a' : '#ddd', cursor: hasSlots ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontWeight: hasSlots ? 500 : 400 }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate ? (
          <div>
            <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '1rem' }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden', maxHeight: '320px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {allTimes.map((time) => {
                const available = isAvailable(time)
                const isSelected = selectedSlot?.start_time === time
                return (
                  <div
                    key={time}
                    onClick={() => available && handleSelectSlot(time)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem', borderBottom: '1px solid #f0f0f0', background: isSelected ? '#0a0a0a' : '#fff', cursor: available ? 'pointer' : 'default', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (available && !isSelected) e.currentTarget.style.background = '#fafafa' }}
                    onMouseLeave={e => { if (available && !isSelected) e.currentTarget.style.background = '#fff' }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: isSelected ? '#fff' : !available ? '#ddd' : '#0a0a0a' }}>{formatTime(time)}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.65rem', borderRadius: '999px',
                      background: isSelected ? 'rgba(255,255,255,0.15)' : available ? '#f0fdf4' : '#f5f5f5',
                      color: isSelected ? '#fff' : available ? '#16a34a' : '#ccc'
                    }}>
                      {isSelected ? 'Selected' : available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => selectedSlot && router.push('/book/confirm')}
              disabled={!selectedSlot}
              style={{ width: '100%', background: selectedSlot ? '#0a0a0a' : '#f0f0f0', color: selectedSlot ? '#fff' : '#aaa', padding: '0.875rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: selectedSlot ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}
            >
              {selectedSlot ? `Continue with ${formatTime(selectedSlot.start_time.slice(0, 5))}` : 'Select a time to continue'}
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#ccc', textAlign: 'center', padding: '1rem 0' }}>Select a date to see available times</p>
        )}

        <button onClick={() => router.back()} style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
      </div>
    </main>
  )
}