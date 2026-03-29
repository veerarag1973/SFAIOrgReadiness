'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: '16px',
      padding: '40px 20px', textAlign: 'center',
    }}>
      <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', margin: 0 }}>
        Something went wrong
      </p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0f0f0', margin: 0 }}>
        Unexpected error
      </h1>
      <p style={{ fontSize: '0.9rem', color: '#666', margin: 0, maxWidth: '400px', lineHeight: 1.6 }}>
        We hit an unexpected error. You can try again or return to the dashboard.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px', background: 'transparent',
            border: '1px solid rgba(192,57,43,0.5)', color: '#c0392b',
            borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem',
            letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <a
          href="/dashboard"
          style={{
            padding: '10px 20px', background: '#1a1a1a',
            border: '1px solid #2a2a2a', color: '#ccc',
            borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem',
            letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
          }}
        >
          Dashboard
        </a>
      </div>
    </div>
  )
}
