// app/dashboard/page.js — Server Component
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { computeAssessmentVerdict } from '@/lib/scoring'
import { getAssessmentKindLabel, getAssessmentMaxScore } from '@/lib/assessment-kind'
import styles from './page.module.css'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  const membership = await getActiveOrg(session.user.id)
  if (!membership) redirect('/onboarding')

  const { org } = membership

  const [assessments, memberCount] = await Promise.all([
    prisma.assessment.findMany({
      where:   { orgId: org.id },
      orderBy: { updatedAt: 'desc' },
      take:    5,
      include: { createdBy: { select: { name: true, image: true } } },
    }),
    prisma.organisationMember.count({ where: { orgId: org.id } }),
  ])

  const completed  = assessments.filter((a) => a.status === 'completed')
  const inProgress = assessments.filter((a) => a.status === 'in_progress')
  const drafts     = assessments.filter((a) => a.status === 'draft')

  const latestCompleted = completed[0] ?? null
  const latestVerdict   = latestCompleted
    ? computeAssessmentVerdict(latestCompleted)
    : null

  return (
    <main className={styles.main}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className={`eyebrow ${styles.eyebrow}`}>{org.name}</p>
            <h1 className={styles.heading}>Dashboard</h1>
            <p className={styles.subheading}>
              Use this page to see where your team stands, continue unfinished work, or start a new assessment.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/assessments/quick" className="btn-ghost">
              Executive Quick Scan
            </Link>
            <Link href="/assessments/new" className="btn-primary">
              Start Full Assessment
            </Link>
          </div>
        </div>

        <section className={styles.helperGrid} aria-label="Next steps">
          <div className={styles.helperCard}>
            <p className={styles.helperTitle}>If you are new here</p>
            <p className={styles.helperText}>Start with the Executive Quick Scan if leadership wants a 10-minute view, or jump straight into the full 30-question assessment.</p>
          </div>
          <div className={styles.helperCard}>
            <p className={styles.helperTitle}>If you already started</p>
            <p className={styles.helperText}>Open any item marked “In Progress” to continue where you left off.</p>
          </div>
          <div className={styles.helperCard}>
            <p className={styles.helperTitle}>If you work with a team</p>
            <p className={styles.helperText}>Invite colleagues from Settings, run the assessment as a workshop, and schedule the next one for six months out.</p>
          </div>
        </section>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <StatCard label="Completed assessments" helper="Finished and scored" value={completed.length} />
          <StatCard label="In progress" helper="Started but not finished" value={inProgress.length} />
          <StatCard label="Drafts" helper="Created but not started" value={drafts.length} />
          <StatCard label="Team members" helper="People in this workspace" value={memberCount} />
        </div>

        {/* Latest score banner */}
        {latestCompleted && latestVerdict && (
          <div className={styles.scoreBanner} style={{ borderColor: latestVerdict.color }}>
            <div>
              <p className={styles.bannerLabel}>Latest Assessment Score</p>
              <p className={styles.bannerScore}>{latestCompleted.totalScore}<span className={styles.bannerMax}>/{getAssessmentMaxScore(latestCompleted)}</span></p>
              <p className={styles.bannerVerdict} style={{ color: latestVerdict.color }}>{latestVerdict.label}</p>
              <p className={styles.bannerKind}>{getAssessmentKindLabel(latestCompleted)}</p>
            </div>
            <p className={styles.bannerDesc}>{latestVerdict.description}</p>
            <Link href={`/assessments/${latestCompleted.id}/results`} className="btn-ghost">
              View Results →
            </Link>
          </div>
        )}

        {/* Recent assessments */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Recent Assessments</h2>
              <p className={styles.sectionSub}>Open any assessment to continue it or review the results.</p>
            </div>
            <Link href="/assessments" className={styles.viewAll}>View all →</Link>
          </div>

          {assessments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className={styles.list}>
              {assessments.map((a) => (
                <AssessmentRow key={a.id} assessment={a} />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, helper, value }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statHelper}>{helper}</span>
    </div>
  )
}

function AssessmentRow({ assessment: a }) {
  const statusLabel = { draft: 'Draft', in_progress: 'In Progress', completed: 'Completed' }
  const statusColor = { draft: 'var(--muted)', in_progress: 'var(--build)', completed: 'var(--discover)' }
  const href =
    a.status === 'completed'
      ? `/assessments/${a.id}/results`
      : `/assessments/${a.id}/take`

  return (
    <Link href={href} className={styles.assessmentRow}>
      <div className={styles.rowLeft}>
        <p className={styles.rowTitle}>{a.name ?? 'Untitled Assessment'}</p>
        <p className={styles.rowMeta}>
          {getAssessmentKindLabel(a)} · {a.createdBy?.name ?? 'Unknown'} · {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <div className={styles.rowRight}>
        {a.status === 'completed' && a.totalScore != null && (
          <span className={styles.rowScore}>{a.totalScore}/{getAssessmentMaxScore(a)}</span>
        )}
        <span className={styles.rowStatus} style={{ color: statusColor[a.status] }}>
          {statusLabel[a.status]}
        </span>
        <span className={styles.rowArrow}>→</span>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No assessments yet</p>
      <p className={styles.emptySub}>Start your first assessment to get a clear picture of your organisation’s AI readiness.</p>
      <Link href="/assessments/new" className="btn-primary">Start Your First Assessment</Link>
    </div>
  )
}
