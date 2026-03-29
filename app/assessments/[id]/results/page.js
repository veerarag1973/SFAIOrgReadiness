// app/assessments/[id]/results/page.js
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { assertOrgAccess } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import {
  BENCHMARK_METHODOLOGY,
  BONUS_AI_ECONOMICS,
  DIMENSIONS,
  DIMENSIONS_BY_ID,
  PLATFORM_UPGRADE,
  QUESTIONS_BY_ID,
  RECOMMENDED_USAGE_PATH,
  WORKSHOP_FACILITATION_GUIDE,
} from '@/lib/assessment-data'
import {
  buildRoadmap,
  computeAssessmentVerdict,
  computeDimensionDelta,
  computeDimensionScores,
  computeQuickScan,
  getBenchmarksForOrg,
  getFailureSignals,
  getScoreGuide,
  scoreToPercent,
  MAX_DIMENSION_SCORE,
} from '@/lib/scoring'
import {
  getAssessmentKindLabel,
  getAssessmentMaxScore,
  isQuickScanAssessment,
  stripAssessmentDescriptionMetadata,
} from '@/lib/assessment-kind'
import VerdictBanner from './VerdictBanner'
import RadarChart from './RadarChart'
import styles from './page.module.css'

export async function generateMetadata({ params }) {
  const { id } = await params
  const assessment = await prisma.assessment.findUnique({ where: { id }, select: { name: true } })
  return { title: assessment ? `Results - ${assessment.name}` : 'Results' }
}

export default async function ResultsPage({ params }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const { id } = await params

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      responses: { orderBy: { questionId: 'asc' } },
      createdBy: { select: { name: true, email: true } },
    },
  })

  if (!assessment) notFound()
  if (assessment.status !== 'completed') redirect(`/assessments/${id}/take`)

  const membership = await assertOrgAccess(session.user.id, assessment.orgId)
  const org = membership.org
  const quickScanAssessment = isQuickScanAssessment(assessment)

  const historyCandidates = await prisma.assessment.findMany({
    where: { orgId: assessment.orgId, status: 'completed', NOT: { id } },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      name: true,
      totalScore: true,
      completedAt: true,
      kind: true,
    },
    take: 12,
  })

  const historyAssessments = historyCandidates.filter((item) => isQuickScanAssessment(item) === quickScanAssessment)

  if (quickScanAssessment) {
    return (
      <QuickScanResultsPage
        assessment={assessment}
        org={org}
        historyAssessments={historyAssessments}
      />
    )
  }

  return (
    <FullAssessmentResultsPage
      assessment={assessment}
      org={org}
      historyAssessments={historyAssessments}
    />
  )
}

function FullAssessmentResultsPage({ assessment, org, historyAssessments }) {
  const dimScoresMap = computeDimensionScores(assessment.responses)
  const totalScore = assessment.totalScore ?? 0
  const verdict = computeAssessmentVerdict(assessment)
  const scoreGuide = getScoreGuide(totalScore)
  const quickScan = computeQuickScan(assessment.responses)
  const failureSignals = getFailureSignals(dimScoresMap)
  const roadmap = buildRoadmap(dimScoresMap)
  const benchmarks = getBenchmarksForOrg(org)
  const matchedBenchmark = benchmarks.find((benchmark) => benchmark.isMatch) ?? null
  const discoverGatePassed = totalScore >= 90 && Object.values(dimScoresMap).every((item) => item.score >= 12)

  const radarData = DIMENSIONS.map((dimension) => ({
    dimension: dimension.label,
    score: dimScoresMap[dimension.id]?.score ?? 0,
    max: MAX_DIMENSION_SCORE,
    color: dimension.color,
  }))

  const previousAssessment = historyAssessments[0] ?? null
  const totalDelta = previousAssessment ? totalScore - (previousAssessment.totalScore ?? 0) : null

  return (
    <main className={styles.main}>
      <div className="container">
        <PageHeader assessment={assessment} org={org} />

        <VerdictBanner
          verdict={verdict}
          totalScore={totalScore}
          maxScore={150}
          scoreGuide={scoreGuide}
          discoverGatePassed={discoverGatePassed}
        />

        <section className={styles.overviewGrid}>
          <div className={styles.infoCard}>
            <p className={styles.cardLabel}>Executive Quick Scan</p>
            <p className={styles.bigScore}>{quickScan.totalScore}<span>/50</span></p>
            <p className={styles.cardBody}>{quickScan.verdict}</p>
          </div>
          <div className={styles.infoCard}>
            <p className={styles.cardLabel}>Benchmark Match</p>
            <p className={styles.cardHeadline}>{matchedBenchmark?.label ?? 'General benchmark view'}</p>
            <p className={styles.cardBody}>
              {matchedBenchmark
                ? `Typical readiness ${matchedBenchmark.typicalScore}. Top quartile ${matchedBenchmark.topQuartile}.`
                : 'No exact sector match found, so the broader benchmark table is shown below.'}
            </p>
          </div>
          <div className={styles.infoCard}>
            <p className={styles.cardLabel}>SpanForge Platform</p>
            <p className={styles.cardHeadline}>{PLATFORM_UPGRADE.headline}</p>
            <p className={styles.cardBody}>{PLATFORM_UPGRADE.tagline} <a href={PLATFORM_UPGRADE.url} target="_blank" rel="noopener noreferrer" className={styles.platformLink}>{PLATFORM_UPGRADE.url.replace('https://', '')}</a></p>
          </div>
        </section>

        <div className={styles.topGrid}>
          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>Dimension Scores</h2>
            <RadarChart data={radarData} />
          </section>

          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>Maturity by Dimension</h2>
            <div className={styles.dimList}>
              {DIMENSIONS.map((dimension) => {
                const score = dimScoresMap[dimension.id]?.score ?? 0
                const maturity = roadmap.focusDimensions.find((item) => item.dimensionId === dimension.id)?.maturity
                  ?? { label: score >= 23 ? 'Leading' : score >= 18 ? 'Operational' : score >= 11 ? 'Emerging' : 'Nascent' }
                return (
                  <div key={dimension.id}>
                    <DimRow dimension={dimension} score={score} maxScore={25} maturity={maturity.label} />
                    {dimension.economicsLink && (
                      <p className={styles.economicsLink}>{dimension.economicsLink}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {failureSignals.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Failure Signals</h2>
            <p className={styles.sectionSub}>These thresholds are strong indicators that AI projects will struggle unless addressed before more investment is committed.</p>
            <div className={styles.signalGrid}>
              {failureSignals.map((signal) => (
                <article key={signal.id} className={styles.signalCard}>
                  <p className={styles.signalTitle}>{signal.label}</p>
                  <p className={styles.signalBody}>{signal.summary}</p>
                  <p className={styles.signalEvidence}>{signal.evidence}</p>
                  {signal.affectedDimensions?.length > 0 && (
                    <div className={styles.signalTags}>
                      {signal.affectedDimensions.map((dimension) => (
                        <span key={dimension.id} className={styles.signalTag}>{dimension.label}</span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Executive Quick Scan</h2>
              <p className={styles.sectionSub}>A board-friendly 10-question summary derived from the full assessment.</p>
            </div>
            <span className={styles.quickScanSummary}>{quickScan.totalScore}/50</span>
          </div>
          <div className={styles.quickScanTable}>
            {quickScan.items.map((item) => (
              <div key={item.id} className={styles.quickScanRow}>
                <span className={styles.quickScanDimension}>{DIMENSIONS_BY_ID[item.dimension]?.label}</span>
                <span className={styles.quickScanPrompt}>{item.prompt}</span>
                <span className={styles.quickScanScore}>{item.score}/5</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Industry Benchmarks</h2>
          <p className={styles.sectionSub}>Benchmarks reflect documented readiness rather than ambition. The highlighted row is the closest match based on your workspace profile.</p>
          <div className={styles.benchmarkTable}>
            <div className={`${styles.benchmarkRow} ${styles.benchmarkHead}`}>
              <span>Organisation type</span>
              <span>Typical score</span>
              <span>AI leaders</span>
              <span>Top quartile</span>
            </div>
            {benchmarks.map((benchmark) => (
              <div key={benchmark.id} className={`${styles.benchmarkRow} ${benchmark.isMatch ? styles.benchmarkMatch : ''}`}>
                <span>{benchmark.label}</span>
                <span>{benchmark.typicalScore}</span>
                <span>{benchmark.aiLeaders}</span>
                <span>{benchmark.topQuartile}</span>
              </div>
            ))}
          </div>
          <div className={styles.methodologyNote}>
            <p className={styles.methodologyNoteText}>{BENCHMARK_METHODOLOGY.note}</p>
            <ul className={styles.methodologyTips}>
              {BENCHMARK_METHODOLOGY.tips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>90-Day Readiness Roadmap</h2>
          <p className={styles.sectionSub}>Focus on the 2 or 3 weakest dimensions first. Do not try to repair everything at once.</p>
          <div className={styles.focusGrid}>
            {roadmap.focusDimensions.map((item) => (
              <article key={item.dimensionId} className={styles.focusCard}>
                <p className={styles.focusLabel} style={{ color: item.dimension.color }}>{item.dimension.label}</p>
                <p className={styles.focusScore}>{item.score}<span>/25</span></p>
                <p className={styles.focusMaturity}>{item.maturity.label}</p>
                <ul className={styles.actionList}>
                  {item.actions.map((action) => <li key={action}>{action}</li>)}
                </ul>
              </article>
            ))}
          </div>

          <div className={styles.monthGrid}>
            {roadmap.months.map((month) => (
              <article key={month.id} className={styles.monthCard}>
                <p className={styles.monthTitle}>{month.title}</p>
                <ul className={styles.actionList}>
                  {month.tasks.map((task) => <li key={task}>{task}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {previousAssessment && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Comparison to Previous Assessment</h2>
                <p className={styles.sectionSub}>Measured against {previousAssessment.name} from {new Date(previousAssessment.completedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}.</p>
              </div>
              <span className={`${styles.deltaBadge} ${totalDelta >= 0 ? styles.deltaUp : styles.deltaDown}`}>{formatDelta(totalDelta)} total</span>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bonus Dimension - AI Economics</h2>
          <p className={styles.sectionSub}>{BONUS_AI_ECONOMICS.intro}</p>
          <div className={styles.economicsRiskBanner}>
            Score each prompt on 1–5 and total them. A score below {BONUS_AI_ECONOMICS.riskThreshold}/15 is a risk flag for your overall programme.
          </div>
          <div className={styles.economicsGrid}>
            {BONUS_AI_ECONOMICS.questions.map((item) => (
              <article key={item.id} className={styles.economicsCard}>
                <p className={styles.economicsId}>{item.id}</p>
                <h3 className={styles.economicsTitle}>{item.title}</h3>
                <p className={styles.economicsBody}>{item.whyWeAsk}</p>
              </article>
            ))}
          </div>
        </section>

        <ResponseLog assessment={assessment} />
        <HistorySection historyAssessments={historyAssessments} />
        <WorkshopGuide />
        <PlatformUpgradeSection />
      </div>
    </main>
  )
}

function QuickScanResultsPage({ assessment, org, historyAssessments }) {
  const totalScore = assessment.totalScore ?? 0
  const verdict = computeAssessmentVerdict(assessment)
  const description = stripAssessmentDescriptionMetadata(assessment.description ?? '')
  const dimScoresMap = computeDimensionScores(assessment.responses)
  const quickDimensions = DIMENSIONS
    .map((dimension) => ({
      dimension,
      score: dimScoresMap[dimension.id]?.score ?? 0,
      count: dimScoresMap[dimension.id]?.count ?? 0,
    }))
    .filter((item) => item.count > 0)

  const criticalGaps = quickDimensions.filter((item) => item.score < Math.min(4, item.count * 5))
  const previousAssessment = historyAssessments[0] ?? null
  const totalDelta = previousAssessment ? totalScore - (previousAssessment.totalScore ?? 0) : null

  return (
    <main className={styles.main}>
      <div className="container">
        <PageHeader assessment={assessment} org={org} />

        <section className={styles.quickHero} style={{ borderColor: verdict.color }}>
          <div>
            <p className={styles.cardLabel}>Executive Quick Scan</p>
            <p className={styles.quickHeroScore}>{totalScore}<span>/50</span></p>
            <p className={styles.quickHeroVerdict} style={{ color: verdict.color }}>{verdict.label}</p>
            <p className={styles.quickHeroBody}>{verdict.description}</p>
          </div>
          <div className={styles.quickHeroActions}>
            <Link href="/assessments/new" className="btn-primary">Start Full Assessment</Link>
            <Link href="/assessments/quick" className="btn-ghost">Run Another Quick Scan</Link>
          </div>
        </section>

        {description && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Leadership Notes</h2>
            <div className={styles.panel}>
              <p className={styles.cardBody}>{description}</p>
            </div>
          </section>
        )}

        <div className={styles.topGrid}>
          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>Dimension Breakdown</h2>
            <div className={styles.dimList}>
              {quickDimensions.map((item) => (
                <DimRow
                  key={item.dimension.id}
                  dimension={item.dimension}
                  score={item.score}
                  maxScore={item.count * 5}
                  maturity={item.score < Math.min(4, item.count * 5) ? 'Critical gap' : 'Acceptable'}
                />
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>Recommended Next Step</h2>
            <p className={styles.cardBody}>
              {totalScore >= 40
                ? 'Leadership can move into the full 30-question assessment and use that workshop to build the 90-day readiness plan.'
                : 'Leadership should still run the full assessment, but expect the weakest dimensions to become the immediate focus areas.'}
            </p>
            {criticalGaps.length > 0 && (
              <div className={styles.criticalPanelInline}>
                <p className={styles.criticalTitle}>Critical gaps</p>
                <ul className={styles.actionList}>
                  {criticalGaps.map((item) => (
                    <li key={item.dimension.id}>{item.dimension.label} scored {item.score}/{item.count * 5}.</li>
                  ))}
                </ul>
              </div>
            )}
            {previousAssessment && (
              <p className={styles.compareText}>
                Previous quick scan delta: {formatDelta(totalDelta)} compared with {previousAssessment.name}.
              </p>
            )}
          </section>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Question Log</h2>
          <div className={styles.quickScanTable}>
            {assessment.responses.map((response) => {
              const question = QUESTIONS_BY_ID[response.questionId]
              const dimension = DIMENSIONS_BY_ID[response.dimension]
              return (
                <div key={response.questionId} className={styles.quickScanRow}>
                  <span className={styles.quickScanDimension}>{dimension?.label ?? response.dimension}</span>
                  <span className={styles.quickScanPrompt}>{question?.title ?? response.questionId}</span>
                  <span className={styles.quickScanScore}>{response.score}/5</span>
                </div>
              )
            })}
          </div>
        </section>

        <HistorySection historyAssessments={historyAssessments} />
      </div>
    </main>
  )
}

function PageHeader({ assessment, org }) {
  return (
    <div className={styles.header}>
      <div>
        <p className={`eyebrow ${styles.eyebrow}`}>
          {getAssessmentKindLabel(assessment)} Results · {new Date(assessment.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 className={styles.heading}>{assessment.name ?? 'Untitled Assessment'}</h1>
        <p className={styles.subheading}>{org.name} · Completed by {assessment.createdBy?.name ?? assessment.createdBy?.email ?? 'Unknown'}</p>
      </div>
      <Link href="/assessments" className="btn-ghost">← All Assessments</Link>
    </div>
  )
}

function ResponseLog({ assessment }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Full Response Log</h2>
      <div className={styles.responseLog}>
        {assessment.responses.map((response) => {
          const question = QUESTIONS_BY_ID[response.questionId]
          const dimension = DIMENSIONS_BY_ID[response.dimension]
          return (
            <div key={response.questionId} className={styles.responseRow}>
              <div>
                <span className={styles.responseQuestionId}>{response.questionId}</span>
                <p className={styles.responseQuestion}>{question?.title ?? response.questionId}</p>
                <p className={styles.responseDimension}>{dimension?.label ?? response.dimension}</p>
              </div>
              <div className={styles.responseRight}>
                <span className={styles.responseScore}>{response.score}/5</span>
                {response.notes && <p className={styles.responseNotes}>{response.notes}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function HistorySection({ historyAssessments }) {
  if (historyAssessments.length === 0) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Score History</h2>
      <div className={styles.historyList}>
        {historyAssessments.map((item) => {
          const itemVerdict = computeAssessmentVerdict(item)
          return (
            <Link key={item.id} href={`/assessments/${item.id}/results`} className={styles.historyRow}>
              <div>
                <p className={styles.historyName}>{item.name}</p>
                <p className={styles.historyDate}>{new Date(item.completedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</p>
              </div>
              <div className={styles.historyMeta}>
                <span className={styles.historyScore}>{item.totalScore}/{getAssessmentMaxScore(item)}</span>
                <span className={styles.historyVerdict} style={{ color: itemVerdict.color }}>{itemVerdict.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function WorkshopGuide() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Workshop Facilitation Guide</h2>
      <div className={styles.guideGrid}>
        <GuideCard label="Participants" value={WORKSHOP_FACILITATION_GUIDE.participants} />
        <GuideCard label="Duration" value={WORKSHOP_FACILITATION_GUIDE.duration} />
        <GuideCard label="Scoring Rule" value={WORKSHOP_FACILITATION_GUIDE.rule} />
        <GuideCard label="Time Allocation" value={WORKSHOP_FACILITATION_GUIDE.timeAllocation} />
        <GuideCard label="Conflict Resolution" value={WORKSHOP_FACILITATION_GUIDE.conflictResolution} />
        <GuideCard label="Reassessment" value={WORKSHOP_FACILITATION_GUIDE.reassessment} />
      </div>
    </section>
  )
}

function PlatformUpgradeSection() {
  return (
    <section className={styles.platformSection}>
      <p className={styles.platformTagline}>{PLATFORM_UPGRADE.tagline}</p>
      <div className={styles.platformHeader}>
        <h2 className={styles.platformHeadline}>{PLATFORM_UPGRADE.headline}</h2>
        <p className={styles.platformSub}>{PLATFORM_UPGRADE.sub} &mdash; <a href={PLATFORM_UPGRADE.url} target="_blank" rel="noopener noreferrer" className={styles.platformLink}>{PLATFORM_UPGRADE.url.replace('https://', '')}</a></p>
      </div>
      <div className={styles.platformStepGrid}>
        {PLATFORM_UPGRADE.steps.map((step) => (
          <div key={step.id} className={styles.platformStep}>
            <p className={styles.platformStepLabel}>{step.label}</p>
            <p className={styles.platformStepBody}>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatDelta(value) {
  if (value == null) return '—'
  if (value === 0) return '0'
  return value > 0 ? `+${value}` : `${value}`
}

function DimRow({ dimension, score, maxScore, maturity }) {
  const pct = scoreToPercent(score, maxScore)
  return (
    <div className={styles.dimRow}>
      <div className={styles.dimRowTop}>
        <div>
          <p className={styles.dimRowLabel}>{dimension.label}</p>
          <p className={styles.dimRowMaturity}>{maturity}</p>
        </div>
        <p className={styles.dimRowScore}>{score}<span>/{maxScore}</span></p>
      </div>
      <div className={styles.barWrap}>
        <div className={styles.barFill} style={{ width: `${pct}%`, background: dimension.color }} />
      </div>
    </div>
  )
}

function GuideCard({ label, value }) {
  return (
    <article className={styles.guideCard}>
      <p className={styles.guideLabel}>{label}</p>
      <p className={styles.guideValue}>{value}</p>
    </article>
  )
}
