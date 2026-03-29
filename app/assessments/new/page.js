// app/assessments/new/page.js — Create assessment (Server Shell + Client Form)
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import NewAssessmentForm from './NewAssessmentForm'
import styles from './page.module.css'

export const metadata = { title: 'New Assessment' }

export default async function NewAssessmentPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  const membership = await getActiveOrg(session.user.id)
  if (!membership) redirect('/onboarding')

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">New Assessment</p>
          <h1 className={styles.heading}>Start an AI Readiness Assessment</h1>
          <p className={styles.sub}>
            You will answer 30 questions across Strategy, Data, Infrastructure, Talent, Governance, and Culture. Plan for a cross-functional workshop, save the result, and re-run it every 6 months.
          </p>
        </div>
        <NewAssessmentForm />
      </div>
    </main>
  )
}
