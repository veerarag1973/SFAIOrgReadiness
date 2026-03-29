'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function DeleteAssessmentButton({ id }) {
  const router      = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy]             = useState(false)
  const [error, setError]           = useState(null)

  async function handleDelete() {
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/assessments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/assessments')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Delete failed.')
      setBusy(false)
    }
  }

  if (confirming) {
    return (
      <div className={styles.confirmRow}>
        {error && <span className={styles.confirmError}>{error}</span>}
        <span className={styles.confirmText}>
          Delete this assessment and all its responses? This cannot be undone.
        </span>
        <button
          className={styles.cancelBtn}
          onClick={() => { setConfirming(false); setError(null) }}
          disabled={busy}
        >
          Cancel
        </button>
        <button className={styles.deleteBtn} onClick={handleDelete} disabled={busy}>
          {busy ? 'Deleting…' : 'Yes, delete'}
        </button>
      </div>
    )
  }

  return (
    <button className={styles.deleteBtn} onClick={() => setConfirming(true)}>
      Delete Assessment
    </button>
  )
}
