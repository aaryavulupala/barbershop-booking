'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PickBarber() {
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchBarbers() {
      const { data, error } = await supabase.from('barbers').select('*')
      if (error) console.error(error)
      else setBarbers(data)
      setLoading(false)
    }
    fetchBarbers()
  }, [])

  function handleSelect(barber) {
    localStorage.setItem('selectedBarber', JSON.stringify(barber))
    router.push('/book/slot')
  }

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading...</p>

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
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '999px', background: s <= 2 ? '#0a0a0a' : '#f0f0f0' }} />
          ))}
        </div>

        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.75rem' }}>Step 2 of 4</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Choose a barber</h1>
        <p style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 300, marginBottom: '2rem' }}>Pick who you'd like to cut your hair.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#f0f0f0', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
          {barbers.map((barber) => (
            <button
              key={barber.id}
              onClick={() => handleSelect(barber)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
                  {barber.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.2rem', color: '#0a0a0a' }}>{barber.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{barber.bio}</p>
                </div>
              </div>
              <span style={{ color: '#ccc', fontSize: '1rem' }}>→</span>
            </button>
          ))}
        </div>

        <button onClick={() => router.back()} style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
      </div>
    </main>
  )
}