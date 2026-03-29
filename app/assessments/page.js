// app/assessments/page.js — Assessment list (Server Component)
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { computeAssessmentVerdict } from '@/lib/scoring'
import { getAssessmentKindLabel, getAssessmentMaxScore } from '@/lib/assessment-kind'
import styles from './page.module.css'

export const metadata = { title: 'Assessments' }

export default async function AssessmentsPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  const membership = await getActiveOrg(session.user.id)
  if (!membership) redirect('/onboarding')

  const { org } = membership

  const assessments = await prisma.assessment.findMany({
    where:   { orgId: org.id },
    orderBy: { updatedAt: 'desc' },
    include: { createdBy: { select: { name: true, image: true } } },
  })

  const byStatus = {
    completed:   assessments.filter((a) => a.status === 'completed'),
    in_progress: assessments.filter((a) => a.status === 'in_progress'),
    draft:       assessments.filter((a) => a.status === 'draft'),
  }

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={`eyebrow ${styles.eyebrow}`}>{org.name}</p>
            <h1 className={styles.heading}>Assessments</h1>
            <p className={styles.subheading}>
              This is your assessment library. Open any item to continue answering questions or review results.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/assessments/quick" className="btn-ghost">Executive Quick Scan</Link>
            <Link href="/assessments/new" className="btn-primary">Start Full Assessment</Link>
          </div>
        </div>

        {assessments.length > 0 && (
          <div className={styles.summaryStrip}>
            <span>{byStatus.in_progress.length} in progress</span>
            <span>{byStatus.draft.length} not started</span>
            <span>{byStatus.completed.length} completed</span>
          </div>
        )}

        {assessments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {byStatus.in_progress.length > 0 && (
              <Section title="In Progress" assessments={byStatus.in_progress} />
            )}
            {byStatus.draft.length > 0 && (
              <Section title="Drafts" assessments={byStatus.draft} />
            )}
            {byStatus.completed.length > 0 && (
              <Section title="Completed" assessments={byStatus.completed} />
            )}
          </>
        )}
      </div>
    </main>
  )
}

function Section({ title, assessments }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.grid}>
        {assessments.map((a) => <AssessmentCard key={a.id} assessment={a} />)}
      </div>
    </section>
  )
}

const STATUS_COLOR = {
  draft:       'var(--muted)',
  in_progress: 'var(--build)',
  completed:   'var(--discover)',
}
const STATUS_LABEL = {
  draft:       'Draft',
  in_progress: 'In Progress',
  completed:   'Completed',
}

function AssessmentCard({ assessment: a }) {
  const verdict = a.status === 'completed' ? computeAssessmentVerdict(a) : null
  const href    = a.status === 'completed'
    ? `/assessments/${a.id}/results`
    : `/assessments/${a.id}/take`

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardStatus} style={{ color: STATUS_COLOR[a.status] }}>
          {STATUS_LABEL[a.status]}
        </span>
        {verdict && (
          <span className={styles.cardVerdict} style={{ color: verdict.color }}>{verdict.label}</span>
        )}
      </div>
      <p className={styles.cardTitle}>{a.name ?? 'Untitled Assessment'}</p>
      <p className={styles.cardMeta}>
        {getAssessmentKindLabel(a)} · {a.createdBy?.name ?? 'Unknown'} · {new Date(a.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
      <p className={styles.cardAction}>{a.status === 'completed' ? 'Open results and recommendations' : 'Open and continue answering questions'}</p>
      {a.status === 'completed' && a.totalScore != null && (
        <p className={styles.cardScore}>{a.totalScore}<span className={styles.cardMax}>/{getAssessmentMaxScore(a)}</span></p>
      )}
    </Link>
  )
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No assessments yet</p>
      <p className={styles.emptySub}>Create your first assessment to understand your organisation’s current AI readiness in plain language.</p>
      <Link href="/assessments/new" className="btn-primary">Start First Assessment</Link>
    </div>
  )
}
