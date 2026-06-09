'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", background: '#fff' }}>
        <button
  onClick={() => router.push('/')}
  style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: '999px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', zIndex: 999 }}
>
  ← Home
</button>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: '380px', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>Barber login</h1>
        <p style={{ fontSize: '0.875rem', color: '#aaa', marginBottom: '2rem' }}>The Chop Shop admin access</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '0.85rem', color: '#e53e3e' }}>{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: '#0a0a0a', color: '#fff', padding: '0.875rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </div>
      </div>
    </main>
  )
}