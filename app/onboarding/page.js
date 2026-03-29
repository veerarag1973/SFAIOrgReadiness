// app/onboarding/page.js — Server Component
// Shown after first sign-in when user has no organisation yet
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import OnboardingForm from './OnboardingForm'
import styles from './page.module.css'

export const metadata = { title: 'Create your organisation' }

export default async function OnboardingPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  // If they already have an org, send them to the dashboard
  const existing = await getActiveOrg(session.user.id)
  if (existing) redirect('/dashboard')

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoSpan}>Span</span>
          <span className={styles.logoForge}>Forge</span>
        </div>
        <p className={styles.eyebrow}>Step 1 of 1</p>
        <h1 className={styles.heading}>Create your organisation</h1>
        <p className={styles.sub}>
          Your organisation is the workspace for your AI Readiness assessments. You can invite colleagues after setup.
        </p>
        <OnboardingForm userName={session.user.name} />
      </div>
    </div>
  )
}
