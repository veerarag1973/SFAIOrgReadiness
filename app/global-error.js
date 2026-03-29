'use client'

import { useEffect } from 'react'

// global-error.js catches errors thrown by the root layout itself.
// It must render its own <html> and <body> tags.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{
        background: '#0d0d0d', color: '#f0f0f0',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', margin: 0, textAlign: 'center', padding: '20px',
      }}>
        <div>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', margin: '0 0 12px' }}>
            Critical error
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0f0f0', margin: '0 0 12px' }}>
            Application error
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 24px' }}>
            A critical error occurred. Please try again.
          </p>
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
        </div>
      </body>
    </html>
  )
}
