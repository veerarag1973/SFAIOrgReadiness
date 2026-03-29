'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DIMENSIONS_BY_ID, QUICK_SCAN_QUESTIONS } from '@/lib/assessment-data'
import styles from './page.module.css'

const QUICK_SCORE_BANDS = [
  {
    id: 'critical',
    label: 'Critical gaps exist',
    range: [0, 29],
    color: 'var(--red)',
    description: 'Do not treat this organisation as ready for AI investment yet. At least one foundation is materially weak.',
  },
  {
    id: 'developing',
    label: 'Developing',
    range: [30, 39],
    color: 'var(--build)',
    description: 'Leadership can proceed to the full assessment, but the organisation still has visible readiness gaps.',
  },
  {
    id: 'ready',
    label: 'Ready for full assessment',
    range: [40, 50],
    color: 'var(--discover)',
    description: 'Leadership foundations look strong enough to justify the full 30-question readiness workshop.',
  },
]

function getQuickBand(total) {
  return QUICK_SCORE_BANDS.find((band) => total >= band.range[0] && total <= band.range[1]) ?? QUICK_SCORE_BANDS[0]
}

export default function QuickAssessmentClient() {
  const router = useRouter()
  const [answers, setAnswers] = useState({})
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [startingFull, setStartingFull] = useState(false)

  const answeredCount = Object.keys(answers).length
  const isComplete = answeredCount === QUICK_SCAN_QUESTIONS.length

  const results = useMemo(() => {
    const total = QUICK_SCAN_QUESTIONS.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0)

    const dimensionScores = Object.values(
      QUICK_SCAN_QUESTIONS.reduce((acc, question) => {
        if (!acc[question.dimension]) {
          acc[question.dimension] = {
            dimensionId: question.dimension,
            label: DIMENSIONS_BY_ID[question.dimension]?.label ?? question.dimension,
            color: DIMENSIONS_BY_ID[question.dimension]?.color ?? 'var(--red)',
            score: 0,
            maxScore: 0,
          }
        }

        acc[question.dimension].score += answers[question.id] ?? 0
        acc[question.dimension].maxScore += 5
        return acc
      }, {})
    )

    return {
      total,
      band: getQuickBand(total),
      dimensionScores,
      criticalGaps: dimensionScores.filter((item) => item.score > 0 && item.score < 4),
    }
  }, [answers])

  async function saveQuickScan() {
    setError('')
    setSaving(true)

    try {
      const response = await fetch('/api/assessments/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, notes }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Failed to save the quick scan.')
        return null
      }

      return data.assessmentId
    } catch {
      setError('Network error while saving the quick scan. Please try again.')
      return null
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAndView() {
    const assessmentId = await saveQuickScan()
    if (assessmentId) {
      router.push(`/assessments/${assessmentId}/results`)
    }
  }

  async function handleRunFullAssessment() {
    setError('')
    setStartingFull(true)

    try {
      const fullAssessmentResponse = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Full Assessment Follow-up - ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          description: `Started from Executive Quick Scan. Quick score: ${results.total}/50.${notes.trim() ? ` Notes: ${notes.trim()}` : ''}`,
        }),
      })

      const fullAssessmentData = await fullAssessmentResponse.json()
      if (!fullAssessmentResponse.ok) {
        setError(fullAssessmentData.error ?? 'Could not create the full assessment.')
        return
      }

      router.push(`/assessments/${fullAssessmentData.assessment.id}/take`)
    } catch {
      setError('Network error while creating the full assessment. Please try again.')
    } finally {
      setStartingFull(false)
    }
  }

  return (
    <div className={styles.layout}>
      <section className={styles.formSection}>
        <div className={styles.infoPanel}>
          <p className={styles.infoTitle}>How to use it</p>
          <ul className={styles.infoList}>
            <li>Score what is demonstrably true today, not what is planned.</li>
            <li>Any dimension below 4/10 is a critical gap that should be addressed immediately.</li>
            <li>Save the quick scan so leadership can review it later and compare future scans over time.</li>
          </ul>
        </div>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <div className={styles.questionList}>
          {QUICK_SCAN_QUESTIONS.map((question, index) => {
            const selected = answers[question.id] ?? 0
            const dimension = DIMENSIONS_BY_ID[question.dimension]

            return (
              <article key={question.id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <div>
                    <p className={styles.questionMeta} style={{ color: dimension?.color }}>
                      Q{index + 1} · {dimension?.label}
                    </p>
                    <h2 className={styles.questionTitle}>{question.prompt}</h2>
                  </div>
                  <span className={styles.questionStatus}>{selected ? `${selected}/5` : 'Unscored'}</span>
                </div>

                <div className={styles.scaleRow} role="radiogroup" aria-label={question.prompt}>
                  {[1, 2, 3, 4, 5].map((score) => {
                    const active = selected === score
                    return (
                      <button
                        key={score}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`${styles.scaleButton} ${active ? styles.scaleButtonActive : ''}`}
                        style={active ? { borderColor: dimension?.color, color: dimension?.color } : undefined}
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: score }))}
                      >
                        {score}
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>

        <div className={styles.notesPanel}>
          <label htmlFor="quick-notes" className={styles.notesLabel}>Leadership notes</label>
          <textarea
            id="quick-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={styles.notesInput}
            rows={4}
            maxLength={500}
            placeholder="Optional context, disagreements, or actions leadership wants to remember from this quick scan..."
          />
        </div>
      </section>

      <aside className={styles.summarySection}>
        <div className={styles.stickyPanel}>
          <p className={styles.summaryLabel}>Progress</p>
          <p className={styles.summaryScore}>{answeredCount}<span>/10</span></p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${(answeredCount / QUICK_SCAN_QUESTIONS.length) * 100}%` }} />
          </div>

          {isComplete ? (
            <>
              <div className={styles.resultBanner} style={{ borderColor: results.band.color, background: `${results.band.color}12` }}>
                <p className={styles.resultLabel}>Quick Assessment Result</p>
                <p className={styles.resultTotal}>{results.total}<span>/50</span></p>
                <p className={styles.resultBand} style={{ color: results.band.color }}>{results.band.label}</p>
                <p className={styles.resultDescription}>{results.band.description}</p>
              </div>

              <div className={styles.dimensionList}>
                {results.dimensionScores.map((item) => (
                  <div key={item.dimensionId} className={styles.dimensionRow}>
                    <div className={styles.dimensionTop}>
                      <span className={styles.dimensionName}>{item.label}</span>
                      <span className={styles.dimensionValue}>{item.score}/{item.maxScore}</span>
                    </div>
                    <div className={styles.dimensionTrack}>
                      <div className={styles.dimensionFill} style={{ width: `${(item.score / item.maxScore) * 100}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {results.criticalGaps.length > 0 && (
                <div className={styles.criticalPanel}>
                  <p className={styles.criticalTitle}>Critical gaps</p>
                  <ul className={styles.criticalList}>
                    {results.criticalGaps.map((item) => (
                      <li key={item.dimensionId}>{item.label} scored {item.score}/10.</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.actions}>
                <button type="button" className="btn-primary" onClick={handleSaveAndView} disabled={saving || startingFull}>
                  {saving ? 'Saving Quick Scan…' : 'Save Quick Scan'}
                </button>
                <button type="button" className="btn-ghost" onClick={handleRunFullAssessment} disabled={saving || startingFull}>
                  {startingFull ? 'Creating Full Assessment…' : 'Run Full Assessment'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => { setAnswers({}); setNotes(''); setError('') }} disabled={saving || startingFull}>
                  Reset Quick Scan
                </button>
              </div>
            </>
          ) : (
            <div className={styles.pendingPanel}>
              <p className={styles.pendingTitle}>Complete all 10 questions</p>
              <p className={styles.pendingBody}>Once every item is scored, this panel will show the quick result, dimension gaps, and the next recommended step.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
