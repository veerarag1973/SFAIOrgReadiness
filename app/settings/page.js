// app/settings/page.js — Organisation settings (Server Component)
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { assertOrgAccess } from '@/lib/tenant'
import { getActiveOrg } from '@/lib/tenant'
import SettingsForm from './SettingsForm'
import styles from './page.module.css'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  const membership = await getActiveOrg(session.user.id)
  if (!membership) redirect('/onboarding')

  const { org, role } = membership
  const canEdit = role === 'owner' || role === 'admin'

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">{org.name}</p>
          <h1 className={styles.heading}>Settings</h1>
        </div>

        <div className={styles.tabs}>
          <a href="/settings"         className={`${styles.tab} ${styles.tabActive}`}>General</a>
          <a href="/settings/members" className={styles.tab}>Members</a>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Organisation Details</h2>
          <SettingsForm org={org} canEdit={canEdit} />
        </div>

        {role === 'owner' && (
          <div className={`${styles.section} ${styles.dangerZone}`}>
            <h2 className={styles.dangerTitle}>Danger Zone</h2>
            <p className={styles.dangerDesc}>
              Deleting your organisation is permanent and cannot be undone. All assessments, members and data will be removed.
            </p>
            <button className={styles.dangerBtn} disabled>
              Delete Organisation (contact support)
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
