'use client'

import { calendarLinks } from '@/lib/calendarLinks'

const buttonStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.7rem 1.25rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500, border: '1px solid #e8e8e8', background: '#fff', color: '#0a0a0a', textDecoration: 'none', cursor: 'pointer' }

export default function AddToCalendar({ appointment }) {
  if (!appointment) return null
  const { google, ics } = calendarLinks(appointment)

  return (
    <div style={{ marginBottom: '2rem' }}>
      <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.75rem' }}>Add it to your calendar so you don&apos;t forget:</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href={google} target="_blank" rel="noopener noreferrer" style={buttonStyle}>Google Calendar</a>
        <a href={ics} download="aarya-cuts-appointment.ics" style={buttonStyle}>Apple / Outlook (.ics)</a>
      </div>
    </div>
  )
}
