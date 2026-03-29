'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function DeleteAssessmentButton({ id }) {
  const router   = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this assessment and all its responses? This cannot be undone.')) return
    setBusy(true)
    const res = await fetch(`/api/assessments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/assessments')
    } else {
      const data = await res.json()
      alert(data.error ?? 'Delete failed.')
      setBusy(false)
    }
  }

  return (
    <button className={styles.deleteBtn} onClick={handleDelete} disabled={busy}>
      {busy ? 'Deleting…' : 'Delete Assessment'}
    </button>
  )
}
