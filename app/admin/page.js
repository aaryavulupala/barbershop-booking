'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingBooking, setEditingBooking] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      await fetchBookings()
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

  async function handleDeleteBooking(id, slotId) {
    if (!confirm('Delete this booking? This will also free up the time slot.')) return
    setDeletingId(id)
    await supabase.from('bookings').delete().eq('id', id)
    await supabase.from('time_slots').update({ is_booked: false }).eq('id', slotId)
    await fetchBookings()
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
        {[
          { label: 'Total bookings', value: bookings.length },
          { label: 'Upcoming', value: upcomingBookings.length },
          { label: 'Past bookings', value: pastBookings.length },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#fff', padding: '1.5rem 2rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* BOOKINGS TAB */}
        {(
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