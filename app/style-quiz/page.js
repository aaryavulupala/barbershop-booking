'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS, scoreCuts } from '@/lib/styleQuiz'

// ── Reference illustrations ──

const FACE_PATHS = {
  oval: 'M40 6 C62 6 70 28 70 50 C70 76 56 94 40 94 C24 94 10 76 10 50 C10 28 18 6 40 6 Z',
  round: 'M40 12 C64 12 74 30 74 52 C74 76 60 90 40 90 C20 90 6 76 6 52 C6 30 16 12 40 12 Z',
  square: 'M10 22 Q10 8 24 8 H56 Q70 8 70 22 V72 Q70 88 54 90 H26 Q10 88 10 72 Z',
  oblong: 'M16 20 Q16 2 40 2 Q64 2 64 20 V78 Q64 98 40 98 Q16 98 16 78 Z',
  heart: 'M6 34 Q6 8 40 8 Q74 8 74 34 Q74 60 40 94 Q6 60 6 34 Z',
  diamond: 'M40 6 Q56 8 66 40 Q76 52 64 68 Q50 92 40 94 Q30 92 16 68 Q4 52 14 40 Q24 8 40 6 Z',
}

function FaceShape({ shape, active }) {
  const stroke = active ? '#fff' : '#0a0a0a'
  return (
    <svg width="64" height="80" viewBox="0 0 80 100" fill="none">
      <path d={FACE_PATHS[shape]} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="40" y1="2" x2="40" y2="98" stroke={stroke} strokeOpacity="0.15" strokeDasharray="3 3" />
      <line x1="2" y1="50" x2="78" y2="50" stroke={stroke} strokeOpacity="0.15" strokeDasharray="3 3" />
    </svg>
  )
}

// One strand of hair as an SVG path, starting at x and running down.
function strandPath(type, x) {
  const top = 8
  const steps = { straight: 1, wavy: 4, curly: 7, coily: 11 }[type]
  const len = 54 / steps
  let d = `M${x} ${top}`
  if (type === 'straight') return `${d} l0 54`
  for (let i = 0; i < steps; i++) {
    const dir = i % 2 === 0 ? 1 : -1
    if (type === 'wavy') d += ` q${6 * dir} ${len / 2} 0 ${len}`
    else if (type === 'curly') d += ` a4.5 4.5 0 1 1 0 ${len}`
    else d += ` l${3.5 * dir} ${len}`
  }
  return d
}

function Strands({ type, count = 4, width = 2, active }) {
  const gap = 64 / (count + 1)
  return (
    <svg width="72" height="70" viewBox="0 0 72 70" fill="none">
      {Array.from({ length: count }, (_, i) => (
        <path
          key={i}
          d={strandPath(type, 4 + gap * (i + 1))}
          stroke={active ? '#fff' : '#0a0a0a'}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

const DENSITY = { fine: { count: 3, width: 1 }, medium: { count: 6, width: 1.6 }, thick: { count: 10, width: 2.4 } }

function Visual({ kind, option, active }) {
  if (kind === 'face') return <FaceShape shape={option.value} active={active} />
  if (kind === 'strands') return <Strands type={option.value} active={active} />
  if (kind === 'density') return <Strands type="wavy" active={active} {...DENSITY[option.value]} />
  if (kind === 'color') {
    return (
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `linear-gradient(135deg, ${option.swatch[0]}, ${option.swatch[1]})`, border: active ? '2px solid #fff' : '1px solid #e8e8e8' }} />
    )
  }
  return null
}

// ── Page ──

export default function StyleQuiz() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const done = step >= QUESTIONS.length
  const question = QUESTIONS[step]

  function choose(value) {
    setAnswers({ ...answers, [question.id]: value })
    setStep(step + 1)
  }

  function bookCut(cut) {
    localStorage.setItem('styleQuizPick', cut.name)
    router.push('/book')
  }

  function restart() {
    setAnswers({})
    setStep(0)
  }

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#fff', color: '#0a0a0a', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <button onClick={() => router.push('/')} style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: '999px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', zIndex: 999 }}>← Home</button>

      <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>Aarya Cuts</span>
      </nav>

      {done ? (
        <Results answers={answers} onBook={bookCut} onRestart={restart} />
      ) : (
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.25rem' }}>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '2.5rem' }}>
            {QUESTIONS.map((q, i) => (
              <div key={q.id} style={{ flex: 1, height: '3px', borderRadius: '999px', background: i <= step ? '#0a0a0a' : '#f0f0f0' }} />
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.75rem' }}>Style quiz · {step + 1} of {QUESTIONS.length}</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>{question.title}</h1>
          <p style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.6 }}>{question.hint || 'Pick the one closest to you.'}</p>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${question.visual ? '160px' : '180px'}, 1fr))`, gap: '10px' }}>
            {question.options.map((option) => {
              const active = answers[question.id] === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => choose(option.value)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: question.visual ? 'center' : 'flex-start', gap: '0.75rem', padding: '1.25rem 1rem', border: active ? '1px solid #0a0a0a' : '1px solid #f0f0f0', borderRadius: '12px', background: active ? '#0a0a0a' : '#fff', color: active ? '#fff' : '#0a0a0a', cursor: 'pointer', textAlign: question.visual ? 'center' : 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#fafafa' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#fff' }}
                >
                  {question.visual && (
                    <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Visual kind={question.visual} option={option} active={active} />
                    </div>
                  )}
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: option.sub ? '0.25rem' : 0 }}>{option.label}</p>
                    {option.sub && <p style={{ fontSize: '0.78rem', color: active ? 'rgba(255,255,255,0.7)' : '#aaa', lineHeight: 1.45 }}>{option.sub}</p>}
                  </div>
                </button>
              )
            })}
          </div>

          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
          )}
        </div>
      )}
    </main>
  )
}

function Results({ answers, onBook, onRestart }) {
  const { ranked, tips } = scoreCuts(answers)
  const [top, ...rest] = ranked
  const runnersUp = rest.slice(0, 2)

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.25rem' }}>
      <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.75rem' }}>Your best match</p>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>{top.name}</h1>

      <div style={{ border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
        <img src={top.image} alt={top.name} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, padding: '0.25rem 0.75rem', borderRadius: '999px', background: '#f0fdf4', color: '#16a34a' }}>{top.match}% match</span>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7, fontWeight: 300, marginBottom: '1rem' }}>{top.description}</p>
          {top.reasons.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {top.reasons.map((r) => (
                <li key={r} style={{ fontSize: '0.85rem', color: '#0a0a0a' }}>✓ <span style={{ color: '#555' }}>{r}</span></li>
              ))}
            </ul>
          )}
          <button
            onClick={() => onBook(top)}
            style={{ width: '100%', background: '#0a0a0a', color: '#fff', padding: '0.875rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            Book this cut
          </button>
        </div>
      </div>

      {tips.length > 0 && (
        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem' }}>Barber notes</p>
          {tips.map((t) => (
            <p key={t} style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.65, marginBottom: '0.4rem' }}>{t}</p>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem' }}>Also worth a look</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '2.5rem' }}>
        {runnersUp.map((cut) => (
          <div key={cut.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img src={cut.image} alt={cut.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{cut.name}</p>
                <span style={{ fontSize: '0.75rem', color: '#aaa', whiteSpace: 'nowrap' }}>{cut.match}%</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.6, flex: 1 }}>{cut.description}</p>
              <button
                onClick={() => onBook(cut)}
                style={{ marginTop: '0.5rem', background: '#fff', color: '#0a0a0a', padding: '0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid #e8e8e8', cursor: 'pointer' }}
              >
                Book this instead
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onRestart} style={{ fontSize: '0.85rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>↺ Retake the quiz</button>
    </div>
  )
}
