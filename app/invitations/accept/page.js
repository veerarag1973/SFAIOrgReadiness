// app/invitations/accept/page.js — Accept an org invitation via token
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import AcceptInvitationForm from './AcceptInvitationForm'
import styles from './page.module.css'

export const metadata = { title: 'Accept Invitation — SpanForge AI Readiness' }

export default async function AcceptInvitationPage({ searchParams }) {
  const { token } = await searchParams

  if (!token) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Invitation</p>
          <h1 className={styles.heading}>Invalid Link</h1>
          <p className={styles.body}>This invitation link is missing a token. Please check your email and try again.</p>
          <a href="/dashboard" className={styles.cta}>Go to Dashboard</a>
        </div>
      </main>
    )
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { org: { select: { name: true } } },
  })

  if (!invitation) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Invitation</p>
          <h1 className={styles.heading}>Not Found</h1>
          <p className={styles.body}>This invitation link is invalid or has been revoked.</p>
          <a href="/dashboard" className={styles.cta}>Go to Dashboard</a>
        </div>
      </main>
    )
  }

  if (invitation.acceptedAt) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Invitation</p>
          <h1 className={styles.heading}>Already Accepted</h1>
          <p className={styles.body}>This invitation has already been used.</p>
          <a href="/dashboard" className={styles.cta}>Go to Dashboard</a>
        </div>
      </main>
    )
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Invitation</p>
          <h1 className={styles.heading}>Expired</h1>
          <p className={styles.body}>
            This invitation expired on {invitation.expiresAt.toLocaleDateString('en-GB', { dateStyle: 'long' })}.
            Ask your organisation admin to send a new invite.
          </p>
          <a href="/dashboard" className={styles.cta}>Go to Dashboard</a>
        </div>
      </main>
    )
  }

  // If user is already signed in, show confirmation card
  const session = await auth()

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>You&rsquo;re invited</p>
        <h1 className={styles.heading}>
          Join <span className={styles.orgName}>{invitation.org.name}</span>
        </h1>
        <p className={styles.body}>
          You&rsquo;ve been invited to join as a{' '}
          <strong>{invitation.role === 'admin' ? 'Administrator' : 'Member'}</strong>.
        </p>

        <AcceptInvitationForm
          token={token}
          invitedEmail={invitation.email}
          sessionEmail={session?.user?.email ?? null}
          sessionUserId={session?.user?.id ?? null}
          orgName={invitation.org.name}
        />
      </div>
    </main>
  )
}
