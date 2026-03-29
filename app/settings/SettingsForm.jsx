'use client'
// app/settings/SettingsForm.jsx
import { useState } from 'react'
import styles from './page.module.css'

const INDUSTRIES = [
  'Technology', 'Financial Services', 'Healthcare', 'Retail & Consumer',
  'Manufacturing', 'Professional Services', 'Education', 'Government & Public Sector',
  'Energy & Utilities', 'Media & Entertainment', 'Other',
]
const ORG_SIZES = ['1–10', '11–50', '51–200', '201–500', '501–1000', '1000+']

export default function SettingsForm({ org, canEdit }) {
  const [name,     setName]     = useState(org.name     ?? '')
  const [industry, setIndustry] = useState(org.industry ?? '')
  const [size,     setSize]     = useState(org.size     ?? '')
  const [website,  setWebsite]  = useState(org.website  ?? '')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      const res = await fetch('/api/organisations/current', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, industry, size, website }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to save. Please try again.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {success && <p className={styles.successMsg} role="status">Settings saved.</p>}
      {error   && <p className={styles.errorMsg}   role="alert">{error}</p>}

      <div className={styles.field}>
        <label htmlFor="s-name" className={styles.label}>Organisation name *</label>
        <input
          id="s-name"
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          disabled={!canEdit || loading}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="s-industry" className={styles.label}>Industry</label>
          <select id="s-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={styles.select} disabled={!canEdit || loading}>
            <option value="">Select…</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="s-size" className={styles.label}>Size</label>
          <select id="s-size" value={size} onChange={(e) => setSize(e.target.value)} className={styles.select} disabled={!canEdit || loading}>
            <option value="">Select…</option>
            {ORG_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="s-website" className={styles.label}>Website</label>
        <input id="s-website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={styles.input} disabled={!canEdit || loading} placeholder="https://" />
      </div>

      {canEdit && (
        <button type="submit" className={`btn-primary ${styles.buttonStart}`} disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      )}
    </form>
  )
}
