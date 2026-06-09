'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#fff', color: '#0a0a0a' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>The Chop Shop</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#work" style={{ fontSize: '0.875rem', color: '#555', textDecoration: 'none' }}>Work</a>
          <a href="#about" style={{ fontSize: '0.875rem', color: '#555', textDecoration: 'none' }}>About</a>
          <a href="#social" style={{ fontSize: '0.875rem', color: '#555', textDecoration: 'none' }}>Social</a>
          <button
            onClick={() => router.push('/book')}
            style={{ background: '#0a0a0a', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            Book now
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '1.25rem' }}>
          Affordable Cuts  · Princeton & New Brunswick, NJ
        </p>
        <h1 style={{ fontSize: '3rem', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
          A fresh cut,<br />wherever you are.
        </h1>
        <p style={{ fontSize: '1rem', color: '#666', fontWeight: 300, lineHeight: 1.75, marginBottom: '2.5rem' }}>
          Precision cuts. Clean experience. On your schedule.
        </p>
        <button
          onClick={() => router.push('/book')}
          style={{ background: '#0a0a0a', color: '#fff', padding: '0.875rem 2.5rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}
        >
          Book an appointment
        </button>
      </section>

      {/* ── WORK / GALLERY ── */}
      {/* Replace the placeholder divs below with <img> tags pointing to your own haircut photos */}
      {/* Example: <img src="/images/cut1.jpg" alt="Fade haircut" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
      <section id="work" style={{ padding: '4rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>The work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>

          {/* IMAGE SLOT 1 — replace this div with your photo */}
          <img src="/images/Haircut1.png" alt="Fade haircut" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* IMAGE SLOT 2 — replace this div with your photo */}
          <img src="/images/Haircut2.png" alt="Buzz cut" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* IMAGE SLOT 3 — replace this div with your photo */}
          <img src="/images/Haircut3.png" alt="Undercut" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* IMAGE SLOT 4 — replace this div with your photo */}
          <img src="/images/Haircut4.png" alt="Crew cut" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* IMAGE SLOT 5 — replace this div with your photo */}
          <img src="/images/Haircut5.png" alt="Pompadour" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* IMAGE SLOT 6 — replace this div with your photo */}
          <img src="/images/Haircut6.png" alt="Buzz cut" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 2rem', borderTop: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>About</h2>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

          {/* PROFILE PHOTO — replace this div with your photo */}
          {/* Example: <img src="/images/me.jpg" alt="Your name" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> */}
          <img src="/images/ProfessionalHeadShot.png" alt="Aarya Vulupala" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />

          <div>
            {/* UPDATE: Replace with your name and bio */}
            <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Aarya Vulupala</p>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.75, fontWeight: 300 }}>
              I'm a barber based in Princeton & New Brunwsick, New Jersey. I bring the barbershop experience to you — at home, at the office, wherever works. Precision cuts, clean fades, and zero commute.
            </p>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 2rem', borderTop: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>Services</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { name: 'Fade', duration: '30 min', price: '$25' },
            { name: 'Haircut', duration: '20 min', price: '$25' },
            { name: 'Beard Trim', duration: '10 min', price: '$5' },
          ].map((s, i, arr) => (
            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 0', borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{s.name}</p>
                <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{s.duration}</p>
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{s.price}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push('/book')}
          style={{ marginTop: '2rem', width: '100%', padding: '0.875rem', background: '#0a0a0a', color: '#fff', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}
        >
          Book now
        </button>
      </section>

      {/* ── SOCIAL ── */}
      {/* UPDATE: Replace the href values with your actual social media links */}
      <section id="social" style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 2rem', borderTop: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>Follow the work</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { label: 'Instagram', handle: '@the_chop_shop1', href: 'https://www.instagram.com/the_chop_shop1/' },
            { label: 'TikTok', handle: '@chopshopbarbers0', href: 'https://www.tiktok.com/@chopshopbarbers0' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', border: '1px solid #f0f0f0', borderRadius: '12px', textDecoration: 'none', color: '#0a0a0a', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: '0.85rem', color: '#aaa' }}>{s.handle} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '2rem', textAlign: 'center' }}>
  <p style={{ fontSize: '0.8rem', color: '#bbb' }}>&#169; 2023 The Chop Shop Barbers · Princeton & New Brunswick, New Jersey</p>
  <a
    href="/admin/login"
    style={{ fontSize: '0.75rem', color: '#ddd', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}
  >
    Barber login
  </a>
</footer>

    </main>
  )
}