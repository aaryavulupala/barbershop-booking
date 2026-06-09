'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

function SuccessContent() {
  const [status, setStatus] = useState('loading')
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    async function finalizeBooking() {
      if (!sessionId) { router.push('/'); return }

      const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
      const data = await res.json()

      if (data.success) setStatus('success')
      else setStatus('error')
    }
    finalizeBooking()
  }, [sessionId])

  if (status === 'loading') return (
    <main style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Confirming your booking...</p>
    </main>
  )

  if (status === 'error') return (
    <main style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Something went wrong</h1>
      <p style={{ color: '#aaa', marginBottom: '2rem' }}>Your payment may have gone through but the booking failed. Please contact us.</p>
      <button onClick={() => router.push('/')} style={{ background: '#0a0a0a', color: '#fff', padding: '0.875rem 2.5rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}>Go home</button>
    </main>
  )

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', background: '#fff' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✂️</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>You're booked & paid!</h1>
      <p style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 300, marginBottom: '2.5rem' }}>Payment confirmed. Check your email for your receipt and booking details.</p>
      <button onClick={() => router.push('/')} style={{ background: '#0a0a0a', color: '#fff', padding: '0.875rem 2.5rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
        Back to home
      </button>
    </main>
  )
}

export default function Success() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}