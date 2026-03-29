'use client'
// app/onboarding/OnboardingForm.jsx — Client Component
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const INDUSTRIES = [
  'Technology', 'Financial Services', 'Healthcare', 'Retail & Consumer',
  'Manufacturing', 'Professional Services', 'Education', 'Government & Public Sector',
  'Energy & Utilities', 'Media & Entertainment', 'Other',
]

const ORG_SIZES = [
  '1–10', '11–50', '51–200', '201–500', '501–1000', '1000+',
]

export default function OnboardingForm({ userName }) {
  const router  = useRouter()
  const [name,     setName]     = useState('')
  const [industry, setIndustry] = useState('')
  const [size,     setSize]     = useState('')
  const [website,  setWebsite]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/organisations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, industry, size, website }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.infoPanel}>
        <p className={styles.infoTitle}>What happens next</p>
        <p className={styles.infoText}>After this step, you can start your first assessment and invite other people later if needed.</p>
      </div>

      {error && (
        <div className={styles.error} role="alert">{error}</div>
      )}

      <div className={styles.field}>
        <label htmlFor="org-name" className={styles.label}>
          Company or organisation name <span aria-hidden="true">*</span>
        </label>
        <input
          id="org-name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          placeholder="Acme Corporation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          disabled={loading}
          autoComplete="organization"
        />
        <p className={styles.helpText}>Use the name your team will recognise straight away.</p>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="industry" className={styles.label}>Industry</label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            <option value="">Select…</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <p className={styles.helpText}>This helps organise your workspace details.</p>
        </div>

        <div className={styles.field}>
          <label htmlFor="size" className={styles.label}>Organisation size</label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            <option value="">Select…</option>
            {ORG_SIZES.map((s) => (
              <option key={s} value={s}>{s} employees</option>
            ))}
          </select>
          <p className={styles.helpText}>Choose the closest option. It does not need to be exact.</p>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="website" className={styles.label}>Website <span className={styles.optional}>(optional)</span></label>
        <input
          id="website"
          type="url"
          placeholder="https://acme.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className={styles.input}
          disabled={loading}
          autoComplete="url"
        />
        <p className={styles.helpText}>Optional. This can be updated later.</p>
      </div>

      <button type="submit" className={`btn-primary ${styles.submit}`} disabled={loading || !name.trim()}>
        {loading ? (
          <><span className="spinner" style={{ width: '16px', height: '16px' }} aria-hidden="true" /> Creating…</>
        ) : (
          'Create Workspace and Continue'
        )}
      </button>
    </form>
  )
}
