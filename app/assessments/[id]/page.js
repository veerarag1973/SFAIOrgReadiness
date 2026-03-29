// app/assessments/[id]/page.js — Assessment overview (Server Component)
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { DIMENSIONS, QUESTIONS, QUESTIONS_BY_ID } from '@/lib/assessment-data'
import { isQuickScanAssessment } from '@/lib/assessment-kind'
import { computeDimensionScores } from '@/lib/scoring'
import styles from './page.module.css'

export async function generateMetadata({ params }) {
  const { id } = await params
  const assessment = await prisma.assessment.findUnique({ where: { id }, select: { name: true } })
  return { title: assessment?.name ?? 'Assessment' }
}

export default async function AssessmentPage({ params }) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect('/signin')

  const membership = await getActiveOrg(session.user.id)
  if (!membership) redirect('/onboarding')

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, image: true, email: true } },
      responses:      { select: { questionId: true, dimension: true, score: true } },
      dimensionScores: true,
      collaborators: {
        include: { user: { select: { id: true, name: true, image: true, email: true } } },
      },
    },
  })

  if (!assessment || assessment.orgId !== membership.org.id) notFound()
  if (isQuickScanAssessment(assessment) && assessment.status === 'completed') {
    redirect(`/assessments/${id}/results`)
  }

  const isCompleted   = assessment.status === 'completed'
  const isInProgress  = assessment.status === 'in_progress'
  const totalAnswered = assessment.responses.length
  const totalQ        = QUESTIONS.length

  // Per-dimension answered count
  const byDim = {}
  for (const r of assessment.responses) {
    const dimensionId = QUESTIONS_BY_ID[r.questionId]?.dimension ?? r.dimension
    byDim[dimensionId] = (byDim[dimensionId] ?? 0) + 1
  }

  const computedDimScores = computeDimensionScores(assessment.responses)

  const canManage = membership.role === 'owner' || membership.role === 'admin'

  return (
    <main className={styles.main}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <Link href="/assessments" className={styles.breadcrumbLink}>Assessments</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span>{assessment.name}</span>
          </div>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.heading}>{assessment.name}</h1>
              <div className={styles.meta}>
                <StatusBadge status={assessment.status} />
                <span className={styles.metaDot}>·</span>
                <span className={styles.metaText}>
                  Created by {assessment.createdBy.name ?? assessment.createdBy.email}
                </span>
                <span className={styles.metaDot}>·</span>
                <span className={styles.metaText}>
                  {new Date(assessment.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>
            <div className={styles.actions}>
              {isCompleted ? (
                <Link href={`/assessments/${id}/results`} className="btn-primary">
                  View Results
                </Link>
              ) : (
                <Link href={`/assessments/${id}/take`} className="btn-primary">
                  {isInProgress ? 'Continue Assessment' : 'Start Assessment'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Progress overview */}
        {!isCompleted && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Progress</h2>
            <div className={styles.progressCard}>
              <div className={styles.progressTop}>
                <span className={styles.progressLabel}>
                  {totalAnswered} / {totalQ} questions answered
                </span>
                <span className={styles.progressPct}>
                  {Math.round((totalAnswered / totalQ) * 100)}%
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.round((totalAnswered / totalQ) * 100)}%` }}
                />
              </div>
              <div className={styles.dimGrid}>
                {DIMENSIONS.map((dim) => {
                  const count = byDim[dim.id] ?? 0
                  const done  = count === 5
                  return (
                    <div key={dim.id} className={`${styles.dimTile} ${done ? styles.dimDone : ''}`}>
                      <span className={styles.dimNum} style={{ color: dim.color }}>{dim.number}</span>
                      <span className={styles.dimLabel}>{dim.label}</span>
                      <span className={styles.dimCount}>{count}/5</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Scores summary for completed */}
        {isCompleted && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Result Summary</h2>
            <div className={styles.scoreSummary}>
              <div className={styles.scoreTotal}>
                <span className={styles.scoreTotalNum}>{assessment.totalScore}</span>
                <span className={styles.scoreTotalMax}> / 150</span>
              </div>
              <div className={styles.dimScoreGrid}>
                {DIMENSIONS.map((dim) => {
                  const ds = assessment.dimensionScores.find((d) => d.dimension === dim.id)
                  const score = ds?.score ?? computedDimScores[dim.id]?.score ?? 0
                  const pct = Math.round((score / 25) * 100)
                  return (
                    <div key={dim.id} className={styles.dimScoreTile}>
                      <span className={styles.dimScoreLabel} style={{ color: dim.color }}>{dim.label}</span>
                      <span className={styles.dimScoreVal}>{score}<span className={styles.dimScoreMax}>/25</span></span>
                      <div className={styles.dimScoreTrack}>
                        <div className={styles.dimScoreFill} style={{ width: `${pct}%`, background: dim.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Collaborators */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Team</h2>
          </div>
          <div className={styles.teamCard}>
            <div className={styles.memberList}>
              {/* Owner */}
              <div className={styles.memberRow}>
                <Avatar user={assessment.createdBy} />
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{assessment.createdBy.name ?? 'Unknown'}</span>
                  <span className={styles.memberEmail}>{assessment.createdBy.email}</span>
                </div>
                <span className={styles.memberRole}>Creator</span>
              </div>
              {assessment.collaborators.map((c) => (
                <div key={c.userId} className={styles.memberRow}>
                  <Avatar user={c.user} />
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{c.user.name ?? 'Unknown'}</span>
                    <span className={styles.memberEmail}>{c.user.email}</span>
                  </div>
                  <span className={styles.memberRole}>Collaborator</span>
                </div>
              ))}
              {assessment.collaborators.length === 0 && (
                <p className={styles.emptyCollaborators}>No collaborators yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* Danger zone — delete */}
        {canManage && (
          <section className={`${styles.section} ${styles.dangerSection}`}>
            <h2 className={styles.sectionTitle}>Danger Zone</h2>
            <div className={styles.dangerCard}>
              <div>
                <p className={styles.dangerTitle}>Delete this assessment</p>
                <p className={styles.dangerBody}>
                  Permanently deletes all responses and scores. This cannot be undone.
                </p>
              </div>
              <DeleteAssessmentButton id={id} />
            </div>
          </section>
        )}

      </div>
    </main>
  )
}

function StatusBadge({ status }) {
  const MAP = {
    draft:       { label: 'Draft',       color: 'var(--muted)'   },
    in_progress: { label: 'In Progress', color: 'var(--define)'  },
    completed:   { label: 'Completed',   color: 'var(--discover)' },
  }
  const { label, color } = MAP[status] ?? MAP.draft
  return <span className={styles.statusBadge} style={{ color, borderColor: color }}>{label}</span>
}

function Avatar({ user }) {
  const initials = (user.name ?? user.email ?? '?').slice(0, 2).toUpperCase()
  return user.image
    ? <img src={user.image} alt={user.name ?? ''} className={styles.avatar} referrerPolicy="no-referrer" />
    : <div className={styles.avatarInitials}>{initials}</div>
}

// Minimal client wrapper just for the delete button
import DeleteAssessmentButton from './DeleteAssessmentButton'
