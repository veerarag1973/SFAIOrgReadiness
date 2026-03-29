// app/settings/members/page.js — Members management (Server Component)
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getActiveOrg, getOrgMembers } from '@/lib/tenant'
import InviteForm from './InviteForm'
import MemberList from './MemberList'
import styles from '../page.module.css'

export const metadata = { title: 'Members' }

export default async function MembersPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  const membership = await getActiveOrg(session.user.id)
  if (!membership) redirect('/onboarding')

  const { org, role } = membership
  const members       = await getOrgMembers(org.id)
  const canManage     = role === 'owner' || role === 'admin'

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <p className="eyebrow">{org.name}</p>
          <h1 className={styles.heading}>Settings</h1>
        </div>

        <div className={styles.tabs}>
          <a href="/settings"         className={styles.tab}>General</a>
          <a href="/settings/members" className={`${styles.tab} ${styles.tabActive}`}>Members</a>
        </div>

        {canManage && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Invite a member</h2>
            <p className={styles.sectionSub}>Send an invitation link by email. Invitations expire after 7 days.</p>
            <InviteForm orgId={org.id} />
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Team members ({members.length})</h2>
          <MemberList
            members={members}
            currentUserId={session.user.id}
            currentUserRole={role}
            orgId={org.id}
          />
        </div>
      </div>
    </main>
  )
}
