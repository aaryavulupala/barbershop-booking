'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PickService() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase.from('services').select('*')
      if (error) console.error(error)
      else setServices(data)
      setLoading(false)
    }
    fetchServices()
  }, [])

  function handleSelect(service) {
    localStorage.setItem('selectedService', JSON.stringify(service))
    router.push('/book/barber')
  }

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-8">Step 1 of 4 — Choose a service</p>

      <div className="grid gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => handleSelect(service)}
            className="border rounded-xl p-6 text-left hover:border-black transition-all"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{service.name}</h2>
                <p className="text-gray-500">{service.duration_minutes} minutes</p>
              </div>
              <span className="text-2xl font-bold">${service.price}</span>
            </div>
          </button>
        ))}
      </div>
    </main>
  )
}