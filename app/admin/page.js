'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [barberId, setBarberId] = useState(null)
  const [activeTab, setActiveTab] = useState('bookings')
  const [editingBooking, setEditingBooking] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [addingSlot, setAddingSlot] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      const { data: barbers } = await supabase.from('barbers').select('id').limit(1)
      if (barbers?.length) setBarberId(barbers[0].id)
      await fetchBookings()
      await fetchSlots()
    }
    init()
  }, [])

  async function fetchBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`id, customer_name, customer_email, notes, created_at, services ( name, price ), time_slots ( id, slot_date, start_time )`)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setBookings(data)
    setLoading(false)
  }

  async function fetchSlots() {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true })
    if (error) console.error(error)
    else setSlots(data)
  }

  async function handleAddSlot() {
    if (!date || !time || !barberId) return
    setAddingSlot(true)
    const { error } = await supabase.from('time_slots').insert({
      barber_id: barberId,
      slot_date: date,
      start_time: time,
      is_booked: false,
    })
    if (error) alert('Error adding slot')
    else { setDate(''); setTime(''); await fetchSlots() }
    setAddingSlot(false)
  }

  async function handleGenerateDay() {
  if (!date || !barberId) return alert('Please select a date first')
  setAddingSlot(true)

  const times = []
  for (let hour = 9; hour < 20; hour++) {
    times.push(`${String(hour).padStart(2, '0')}:00`)
    times.push(`${String(hour).padStart(2, '0')}:30`)
  }

  const slots = times.map((time) => ({
    barber_id: barberId,
    slot_date: date,
    start_time: time,
    is_booked: false,
  }))

  const { error } = await supabase.from('time_slots').insert(slots)
  if (error) alert('Error generating slots — some may already exist for this date')
  else { setDate(''); await fetchSlots(); alert('Full day generated!') }
  setAddingSlot(false)
}


  async function handleDeleteSlot(id) {
    if (!confirm('Delete this slot?')) return
    await supabase.from('time_slots').delete().eq('id', id)
    await fetchSlots()
  }

  async function handleDeleteBooking(id, slotId) {
    if (!confirm('Delete this booking? This will also free up the time slot.')) return
    setDeletingId(id)
    await supabase.from('bookings').delete().eq('id', id)
    await supabase.from('time_slots').update({ is_booked: false }).eq('id', slotId)
    await fetchBookings()
    await fetchSlots()
    setDeletingId(null)
  }

  function openEditBooking(booking) {
    setEditingBooking(booking)
    setEditName(booking.customer_name)
    setEditEmail(booking.customer_email)
    setEditNotes(booking.notes || '')
  }

  async function handleSaveEdit() {
    if (!editName || !editEmail) return
    const { error } = await supabase
      .from('bookings')
      .update({ customer_name: editName, customer_email: editEmail, notes: editNotes || null })
      .eq('id', editingBooking.id)
    if (error) alert('Error saving changes')
    else { setEditingBooking(null); await fetchBookings() }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function formatTime(time) {
    const [hour, minute] = time.slice(0, 5).split(':')
    const h = parseInt(hour)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minute} ${ampm}`
  }

  function formatDate(date) {
    return new Date(date + 'T00:00:00').toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const upcomingBookings = bookings.filter(b => b.time_slots?.slot_date >= new Date().toISOString().split('T')[0])
  const pastBookings = bookings.filter(b => b.time_slots?.slot_date < new Date().toISOString().split('T')[0])
  const availableSlots = slots.filter(s => !s.is_booked)
  const bookedSlots = slots.filter(s => s.is_booked)

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading...</p>

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#fafafa', minHeight: '100vh', color: '#0a0a0a' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <button onClick={() => router.push('/')} style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: '999px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', zIndex: 999 }}>← Home</button>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
        <div style={{ width: '80px' }} />
        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Admin Dashboard</span>
        <button onClick={handleLogout} style={{ fontSize: '0.85rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', width: '80px', textAlign: 'right' }}>Log out</button>
      </nav>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
        {[
          { label: 'Total bookings', value: bookings.length },
          { label: 'Upcoming', value: upcomingBookings.length },
          { label: 'Available slots', value: availableSlots.length },
          { label: 'Past bookings', value: pastBookings.length },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#fff', padding: '1.5rem 2rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', background: '#f0f0f0', borderRadius: '999px', padding: '0.25rem', width: 'fit-content' }}>
          {['bookings', 'slots'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, background: activeTab === tab ? '#0a0a0a' : 'transparent', color: activeTab === tab ? '#fff' : '#666', transition: 'all 0.15s' }}
            >
              {tab === 'bookings' ? `Bookings (${bookings.length})` : `Slots (${slots.length})`}
            </button>
          ))}
        </div>

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            {upcomingBookings.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '0.75rem', fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Upcoming</h2>
                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                  {upcomingBookings.map((b, i) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.5rem', borderBottom: i < upcomingBookings.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{b.customer_name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{b.customer_email}</p>
                        {b.notes && (
                          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem', fontStyle: 'italic' }}>"{b.notes}"</p>
                        )}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{b.services?.name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{formatDate(b.time_slots?.slot_date)} · {formatTime(b.time_slots?.start_time)}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditBooking(b)}
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderRadius: '999px', border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontWeight: 500 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(b.id, b.time_slots?.id)}
                          disabled={deletingId === b.id}
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderRadius: '999px', border: '1px solid #fee2e2', background: '#fff', color: '#e53e3e', cursor: 'pointer', fontWeight: 500 }}
                        >
                          {deletingId === b.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 style={{ fontSize: '0.75rem', fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Past</h2>
                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                  {pastBookings.map((b, i) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.5rem', borderBottom: i < pastBookings.length - 1 ? '1px solid #f0f0f0' : 'none', opacity: 0.5 }}>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{b.customer_name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{b.customer_email}</p>
                        {b.notes && (
                          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem', fontStyle: 'italic' }}>"{b.notes}"</p>
                        )}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{b.services?.name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{formatDate(b.time_slots?.slot_date)} · {formatTime(b.time_slots?.start_time)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBooking(b.id, b.time_slots?.id)}
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderRadius: '999px', border: '1px solid #fee2e2', background: '#fff', color: '#e53e3e', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bookings.length === 0 && (
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No bookings yet.</p>
            )}
          </div>
        )}

        {/* SLOTS TAB */}
        {activeTab === 'slots' && (
          <div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '1.25rem' }}>Add a new slot</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <button onClick={handleAddSlot} disabled={addingSlot} style={{ background: '#fff', color: '#0a0a0a', padding: '0.75rem 1.5rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #e8e8e8', cursor: 'pointer', opacity: addingSlot ? 0.6 : 1 }}>
  {addingSlot ? 'Adding...' : 'Add single slot'}
</button>
<button onClick={handleGenerateDay} disabled={addingSlot} style={{ background: '#0a0a0a', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: addingSlot ? 0.6 : 1 }}>
  {addingSlot ? 'Generating...' : 'Generate full day'}
</button>
              </div>
            </div>

            {availableSlots.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '0.75rem', fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Available ({availableSlots.length})</h2>
                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                  {availableSlots.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < availableSlots.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{formatDate(s.slot_date)}</p>
                        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{formatTime(s.start_time)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 500 }}>Available</span>
                        <button onClick={() => handleDeleteSlot(s.id)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderRadius: '999px', border: '1px solid #fee2e2', background: '#fff', color: '#e53e3e', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bookedSlots.length > 0 && (
              <div>
                <h2 style={{ fontSize: '0.75rem', fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Booked ({bookedSlots.length})</h2>
                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                  {bookedSlots.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < bookedSlots.length - 1 ? '1px solid #f0f0f0' : 'none', opacity: 0.6 }}>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{formatDate(s.slot_date)}</p>
                        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{formatTime(s.start_time)}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', background: '#fef2f2', color: '#e53e3e', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 500 }}>Booked</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit booking modal */}
      {editingBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px', margin: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Edit booking</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleSaveEdit} style={{ flex: 1, background: '#0a0a0a', color: '#fff', padding: '0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}>Save changes</button>
              <button onClick={() => setEditingBooking(null)} style={{ flex: 1, background: '#fff', color: '#0a0a0a', padding: '0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #e8e8e8', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}