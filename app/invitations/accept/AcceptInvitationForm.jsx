'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function AcceptInvitationForm({ token, invitedEmail, sessionEmail, orgName }) {
  const router  = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const emailMatch = sessionEmail?.toLowerCase() === invitedEmail.toLowerCase()
  const isSignedIn = !!sessionEmail

  async function handleAccept() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/invitations/accept', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setBusy(false); return }
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setBusy(false)
    }
  }

  if (!isSignedIn) {
    return (
      <div className={styles.actions}>
        <p className={styles.hint}>
          Sign in with <strong>{invitedEmail}</strong> to accept this invitation.
        </p>
        <button
          className={styles.primaryBtn}
          onClick={() => signIn('google', { callbackUrl: `/invitations/accept?token=${token}` })}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  if (!emailMatch) {
    return (
      <div className={styles.actions}>
        <p className={styles.warning}>
          You&rsquo;re signed in as <strong>{sessionEmail}</strong>, but this invitation was sent to{' '}
          <strong>{invitedEmail}</strong>. Please sign out and sign in with the correct account.
        </p>
        <a href={`/api/auth/signout?callbackUrl=/invitations/accept?token=${token}`} className={styles.primaryBtn}>
          Sign out
        </a>
      </div>
    )
  }

  return (
    <div className={styles.actions}>
      {error && <p className={styles.errorMsg}>{error}</p>}
      <button
        className={styles.primaryBtn}
        onClick={handleAccept}
        disabled={busy}
      >
        {busy ? 'Joining…' : `Join ${orgName}`}
      </button>
      <a href="/dashboard" className={styles.secondaryLink}>Cancel</a>
    </div>
  )
}
