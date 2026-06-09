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

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-8">Step 2 of 4 — Choose a barber</p>

      <div className="grid gap-4">
        {barbers.map((barber) => (
          <button
            key={barber.id}
            onClick={() => handleSelect(barber)}
            className="border rounded-xl p-6 text-left hover:border-black transition-all"
          >
            <h2 className="text-xl font-semibold">{barber.name}</h2>
            <p className="text-gray-500 mt-1">{barber.bio}</p>
          </button>
        ))}
      </div>

      <button
        onClick={() => router.back()}
        className="mt-8 text-gray-400 hover:text-black transition-all"
      >
        ← Back
      </button>
    </main>
  )
}