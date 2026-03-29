'use client'
// app/settings/members/InviteForm.jsx
import { useState } from 'react'
import styles from '../page.module.css'

export default function InviteForm({ orgId }) {
  const [email,   setEmail]   = useState('')
  const [role,    setRole]    = useState('member')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [warning, setWarning] = useState('')
  const [acceptUrl, setAcceptUrl] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSent(false)
    setWarning('')
    setAcceptUrl('')
    setLoading(true)
    try {
      const res = await fetch('/api/invitations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not send invitation.')
        return
      }
      setSent(true)
      setWarning(data.emailWarning ?? '')
      setAcceptUrl(data.acceptUrl ?? '')
      setEmail('')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.inviteForm} onSubmit={handleSubmit} noValidate>
      <p className={styles.sectionSub} role="note">
        Invite one person at a time. They will receive a link to join your workspace, or you can copy the link yourself.
      </p>
      {sent  && <p className={styles.successMsg} role="status">Invitation created{warning ? '.' : ' and email sent!'} </p>}
      {warning && <p className={styles.errorMsg} role="status">{warning}</p>}
      {acceptUrl && (
        <p className={styles.sectionSub} role="status">
          Accept link: <a href={acceptUrl}>{acceptUrl}</a>
        </p>
      )}
      {error && <p className={styles.errorMsg}   role="alert">{error}</p>}

      <div className={styles.inviteRow}>
        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label htmlFor="inv-email" className={styles.label}>Email address</label>
          <input
            id="inv-email"
            type="email"
            required
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="inv-role" className={styles.label}>Role</label>
          <select id="inv-role" value={role} onChange={(e) => setRole(e.target.value)} className={styles.select} disabled={loading}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className={`btn-primary ${styles.buttonStart}`} disabled={loading || !email.trim()}>
          {loading ? 'Sending…' : 'Send Invite'}
        </button>
      </div>
    </form>
  )
}
