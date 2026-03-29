'use client'
// app/assessments/new/NewAssessmentForm.jsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function NewAssessmentForm() {
  const router  = useRouter()
  const [name,    setName]    = useState('')
  const [notes,   setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/assessments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, description: notes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not create assessment. Please try again.')
        return
      }
      router.push(`/assessments/${data.assessment.id}/take`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.infoPanel}>
        <p className={styles.infoTitle}>Before you begin</p>
        <ul className={styles.infoList}>
          <li>Give the assessment a name your team will recognise later.</li>
          <li>Run it with a cross-functional team and score what is true today, not what is planned.</li>
          <li>Use the results as a baseline and schedule the next assessment for six months from now.</li>
        </ul>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}

      <div className={styles.field}>
        <label htmlFor="a-name" className={styles.label}>
          Assessment name <span aria-hidden="true">*</span>
        </label>
        <input
          id="a-name"
          type="text"
          required
          maxLength={120}
          placeholder="e.g. Q1 2025 AI Readiness Review"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        <p className={styles.helpText}>Example: “April 2026 leadership review” or “H2 readiness workshop”.</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="a-notes" className={styles.label}>
          Purpose or notes <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="a-notes"
          rows={3}
          maxLength={400}
          placeholder="Context or goals for this assessment…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={styles.textarea}
          disabled={loading}
        />
        <p className={styles.helpText}>Optional. Use this for workshop scope, the team involved, or the reassessment goal.</p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
          {loading ? 'Creating…' : 'Create and Start Assessment'}
        </button>
      </div>
    </form>
  )
}
