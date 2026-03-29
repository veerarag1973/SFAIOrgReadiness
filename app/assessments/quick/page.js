import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import QuickAssessmentClient from './QuickAssessmentClient'
import styles from './page.module.css'

export const metadata = { title: 'Executive Quick Scan' }

export default async function QuickAssessmentPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  const membership = await getActiveOrg(session.user.id)
  if (!membership) redirect('/onboarding')

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">Executive Quick Scan</p>
          <h1 className={styles.heading}>Run the 10-question leadership assessment</h1>
          <p className={styles.subheading}>
            This is the fast entry point from the v2 assessment document. It is designed for boards and leadership teams, takes about 10 minutes,
            and highlights whether any dimension has a critical gap before you run the full 30-question assessment.
          </p>
        </div>

        <QuickAssessmentClient />
      </div>
    </main>
  )
}