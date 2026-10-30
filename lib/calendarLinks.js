// "Add to calendar" links for a booked appointment. Times are wall-clock
// America/New_York, which is where every appointment happens.

const TZ = 'America/New_York'

function compact(date, time) {
  return `${date.replace(/-/g, '')}T${time.slice(0, 5).replace(':', '')}00`
}

function addMinutes(date, time, minutes) {
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCMinutes(h * 60 + m + minutes)
  const iso = d.toISOString()
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) }
}

export function calendarLinks({ date, startTime, durationMinutes = 30, serviceName }) {
  const end = addMinutes(date, startTime, durationMinutes)
  const start = compact(date, startTime)
  const finish = compact(end.date, end.time)
  const title = `${serviceName} with Aarya Cuts`
  const details = 'Need to reschedule? Reply to your confirmation email.'

  const google =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${start}/${finish}` +
    `&ctz=${encodeURIComponent(TZ)}` +
    `&details=${encodeURIComponent(details)}`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aarya Cuts//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${start}-${Math.random().toString(36).slice(2)}@aaryacuts`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=${TZ}:${start}`,
    `DTEND;TZID=${TZ}:${finish}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return {
    google,
    ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
  }
}
