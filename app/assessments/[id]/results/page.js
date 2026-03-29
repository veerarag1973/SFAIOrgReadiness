// app/assessments/[id]/results/page.js — Server Component
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { assertOrgAccess, getActiveOrg } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import {
  computeVerdict,
  getDimensionRecommendations,
  scoreToPercent,
  MAX_DIMENSION_SCORE,
} from '@/lib/scoring'
import { DIMENSIONS_BY_ID, QUESTIONS_BY_DIMENSION } from '@/lib/assessment-data'
import VerdictBanner from './VerdictBanner'
import RadarChart from './RadarChart'
import styles from './page.module.css'

export async function generateMetadata({ params }) {
  const { id } = await params
  const a = await prisma.assessment.findUnique({ where: { id }, select: { name: true } })
  return { title: a ? `Results — ${a.name}` : 'Results' }
}

export default async function ResultsPage({ params }) {
  const session = await auth()
  if (!session) redirect('/signin')

  const { id } = await params

  const assessment = await prisma.assessment.findUnique({
    where:   { id },
    include: {
      responses:       { orderBy: { questionId: 'asc' } },
      dimensionScores: true,
      createdBy:       { select: { name: true } },
    },
  })

  if (!assessment) notFound()
  if (assessment.status !== 'completed') redirect(`/assessments/${id}/take`)

  const membership = await assertOrgAccess(session.user.id, assessment.orgId)

  const verdict = computeVerdict(assessment.totalScore ?? 0)

  // Build dimScores map from saved DimensionScore rows
  const dimScoresMap = {}
  for (const ds of assessment.dimensionScores) {
    dimScoresMap[ds.dimension] = { score: ds.score, count: QUESTIONS_BY_DIMENSION[ds.dimension]?.length ?? 5 }
  }

  const recommendations = getDimensionRecommendations(dimScoresMap)

  const historyAssessments = await prisma.assessment.findMany({
    where:   { orgId: assessment.orgId, status: 'completed', NOT: { id } },
    orderBy: { completedAt: 'asc' },
    select:  { id: true, name: true, totalScore: true, completedAt: true },
  })

  // Build radar chart data
  const radarData = Object.entries(dimScoresMap).map(([dimId, { score }]) => ({
    dimension: DIMENSIONS_BY_ID[dimId]?.label ?? dimId,
    score,
    max:       MAX_DIMENSION_SCORE,
    color:     DIMENSIONS_BY_ID[dimId]?.color ?? 'var(--red)',
  }))

  return (
    <main className={styles.main}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className={`eyebrow ${styles.eyebrow}`}>
              Assessment Results · {new Date(assessment.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className={styles.heading}>{assessment.name ?? 'Untitled Assessment'}</h1>
          </div>
          <Link href="/assessments" className="btn-ghost">← All Assessments</Link>
        </div>

        {/* Verdict Banner */}
        <VerdictBanner verdict={verdict} totalScore={assessment.totalScore ?? 0} />

        {/* Two-column: radar + dimension breakdown */}
        <div className={styles.grid}>
          <section className={styles.radarSection}>
            <h2 className={styles.sectionTitle}>Dimension Scores</h2>
            <RadarChart data={radarData} />
          </section>

          <section className={styles.dimBreakdown}>
            <h2 className={styles.sectionTitle}>Score Breakdown</h2>
            <div className={styles.dimList}>
              {radarData.map((d) => (
                <DimRow key={d.dimension} data={d} />
              ))}
            </div>
          </section>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Improvement Priorities</h2>
            <p className={styles.sectionSub}>
              The following dimensions scored below 18/25. Targeted investment here will have the greatest impact on AI readiness.
            </p>
            <div className={styles.recList}>
              {recommendations.map((dimId) => {
                const dim   = DIMENSIONS_BY_ID[dimId]
                const score = dimScoresMap[dimId]?.score ?? 0
                return (
                  <div key={dimId} className={styles.recCard} style={{ borderLeftColor: dim?.color ?? 'var(--red)' }}>
                    <p className={styles.recDim}>{dim?.label ?? dimId}</p>
                    <p className={styles.recScore}>{score}<span className={styles.recMax}>/{MAX_DIMENSION_SCORE}</span></p>
                    <div className={styles.recBar}>
                      <div className={styles.recBarFill} style={{ width: `${scoreToPercent(score)}%`, background: dim?.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Question-level detail per dimension */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Full Response Log</h2>
          <div className={styles.responseLog}>
            {assessment.responses.map((r) => {
              const dim = DIMENSIONS_BY_ID[r.dimension]
              return (
                <div key={r.questionId} className={styles.responseRow}>
                  <span className={styles.responseQ} style={{ color: dim?.color }}>
                    {r.questionId}
                  </span>
                  <span className={styles.responseDim}>{dim?.label}</span>
                  <span className={styles.responseScore}>{r.score}/5</span>
                  {r.notes && <span className={styles.responseNotes}>{r.notes}</span>}
                </div>
              )
            })}
          </div>
        </section>

        {historyAssessments.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Score History</h2>
            <p className={styles.sectionSub}>Previous completed assessments for this organisation.</p>
            <div className={styles.historyList}>
              {historyAssessments.map((ha) => {
                const hVerdict = computeVerdict(ha.totalScore ?? 0)
                const delta    = (ha.totalScore ?? 0) - (assessment.totalScore ?? 0)
                return (
                  <Link key={ha.id} href={`/assessments/${ha.id}/results`} className={styles.historyRow}>
                    <div className={styles.historyLeft}>
                      <span className={styles.historyName}>{ha.name}</span>
                      <span className={styles.historyDate}>
                        {new Date(ha.completedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    <div className={styles.historyRight}>
                      <span className={styles.historyScore}>{ha.totalScore ?? '—'}/150</span>
                      <span
                        className={styles.historyDelta}
                        style={{ color: delta > 0 ? 'var(--discover)' : delta < 0 ? 'var(--red)' : 'var(--muted)' }}
                      >
                        {delta > 0 ? `+${delta}` : delta < 0 ? delta : '—'}
                      </span>
                      <span className={styles.historyVerdict}>{hVerdict.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}

function DimRow({ data: d }) {
  const pct = scoreToPercent(d.score)
  return (
    <div className={styles.dimRow}>
      <div className={styles.dimRowTop}>
        <span className={styles.dimRowLabel}>{d.dimension}</span>
        <span className={styles.dimRowScore}>{d.score}<span className={styles.dimMax}>/{MAX_DIMENSION_SCORE}</span></span>
      </div>
      <div className={styles.barWrap}>
        <div className={styles.barFill} style={{ width: `${pct}%`, background: d.color }} />
      </div>
    </div>
  )
}
