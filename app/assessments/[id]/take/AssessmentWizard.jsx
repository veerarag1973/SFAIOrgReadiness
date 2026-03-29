'use client'
// app/assessments/[id]/take/AssessmentWizard.jsx
// Full 30-question scoring wizard — dimension by dimension
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function AssessmentWizard({
  assessmentId,
  assessmentName,
  questions,
  dimensions,
  savedAnswers,
}) {
  const router = useRouter()

  // answers: { [questionId]: { score: number, notes: string } }
  const [answers,  setAnswers]  = useState(savedAnswers)
  const [dimIndex, setDimIndex] = useState(0)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [completing, setCompleting] = useState(false)

  const activeDim  = dimensions[dimIndex]
  const dimQuestions = questions.filter((q) => q.dimension === activeDim.id).sort((a, b) => a.order - b.order)

  const totalAnswered     = Object.keys(answers).length
  const progressPercent   = Math.round((totalAnswered / questions.length) * 100)
  const dimAnswered       = dimQuestions.filter((q) => answers[q.questionId]?.score).length
  const dimComplete       = dimAnswered === dimQuestions.length
  const isLastDim         = dimIndex === dimensions.length - 1
  const allComplete       = totalAnswered >= questions.length && questions.every((q) => answers[q.questionId]?.score)

  // Save a single response to the API
  const saveResponse = useCallback(async (questionId, score, notes = '') => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/responses`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ questionId, score, notes }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to save response.')
      }
    } catch {
      setError('Network error while saving. Your progress may not have been saved.')
    } finally {
      setSaving(false)
    }
  }, [assessmentId])

  function handleScoreSelect(questionId, score) {
    const notes = answers[questionId]?.notes ?? ''
    setAnswers((prev) => ({ ...prev, [questionId]: { score, notes } }))
    saveResponse(questionId, score, notes)
  }

  function handleNotes(questionId, notes) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { score: prev[questionId]?.score ?? 0, notes },
    }))
  }

  function handleNotesBlur(questionId) {
    const a = answers[questionId]
    if (a?.score) saveResponse(questionId, a.score, a.notes ?? '')
  }

  async function handleComplete() {
    setCompleting(true)
    setError('')
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/complete`, { method: 'POST' })
      const d   = await res.json()
      if (!res.ok) {
        setError(d.error ?? 'Could not complete assessment.')
        return
      }
      router.push(`/assessments/${assessmentId}/results`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className={styles.wizard}>
      {/* Top progress bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarInner}>
            <span className={styles.topBarName}>{assessmentName}</span>
            <div className={styles.progressWrap}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className={styles.topBarCount}>{totalAnswered}/{questions.length}</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>

          {/* Sidebar: dimension navigation */}
          <nav className={styles.sidebar} aria-label="Dimension navigation">
            {dimensions.map((dim, i) => {
              const dimQs      = questions.filter((q) => q.dimension === dim.id)
              const answered   = dimQs.filter((q) => answers[q.questionId]?.score).length
              const complete   = answered === dimQs.length
              const isActive   = i === dimIndex
              return (
                <button
                  key={dim.id}
                  className={`${styles.sidebarItem} ${isActive ? styles.sidebarActive : ''}`}
                  onClick={() => setDimIndex(i)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={styles.sidebarDot}
                    style={{ background: complete ? dim.color : (isActive ? dim.color : 'var(--rule)') }}
                    aria-hidden="true"
                  />
                  <span className={styles.sidebarLabel}>{dim.label}</span>
                  <span className={styles.sidebarProg}>{answered}/{dimQs.length}</span>
                </button>
              )
            })}
          </nav>

          {/* Main content */}
          <div className={styles.content}>
            <div className={styles.dimHeader}>
              <span
                className={`eyebrow ${styles.dimEyebrow}`}
                style={{ color: activeDim.color }}
              >
                Dimension {activeDim.number} of {dimensions.length}
              </span>
              <h2 className={styles.dimTitle}>{activeDim.label}</h2>
              <p className={styles.dimDesc}>{activeDim.description}</p>
            </div>

            {error && (
              <div className={styles.error} role="alert">{error}</div>
            )}

            <div className={styles.questions}>
              {dimQuestions.map((q, qi) => (
                <QuestionCard
                  key={q.questionId}
                  question={q}
                  index={qi}
                  answer={answers[q.questionId]}
                  onScore={handleScoreSelect}
                  onNotes={handleNotes}
                  onNotesBlur={handleNotesBlur}
                  dimColor={activeDim.color}
                />
              ))}
            </div>

            {saving && (
              <p className={styles.saving}>
                <span className="spinner" style={{ width: '12px', height: '12px' }} aria-hidden="true" />
                Saving…
              </p>
            )}

            {/* Navigation */}
            <div className={styles.navButtons}>
              <button
                className="btn-ghost"
                onClick={() => setDimIndex((i) => Math.max(0, i - 1))}
                disabled={dimIndex === 0}
              >
                ← Previous
              </button>

              {isLastDim ? (
                <button
                  className="btn-primary"
                  onClick={handleComplete}
                  disabled={!allComplete || completing}
                  title={!allComplete ? 'Answer all 30 questions to complete' : undefined}
                >
                  {completing ? 'Completing…' : 'Complete Assessment →'}
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setDimIndex((i) => i + 1)}
                  disabled={!dimComplete}
                  title={!dimComplete ? 'Answer all questions in this dimension first' : undefined}
                >
                  Next Dimension →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── QuestionCard ──────────────────────────────────────────────────────────────

function QuestionCard({ question: q, index, answer, onScore, onNotes, onNotesBlur, dimColor }) {
  const [expanded, setExpanded] = useState(false)
  const selected = answer?.score ?? 0
  const selectedAnchor = selected ? q.anchors[selected - 1] : null

  return (
    <div className={`${styles.qCard} ${selected ? styles.qCardAnswered : ''}`}>
      <div className={styles.qHeader}>
        <div className={styles.qHeaderMain}>
          <span className={styles.qNum} style={{ color: dimColor }}>Q{index + 1}</span>
          <h3 className={styles.qTitle}>{q.title}</h3>
        </div>
        <span
          className={`${styles.qStatus} ${selected ? styles.qStatusDone : styles.qStatusPending}`}
          style={selected ? { borderColor: dimColor, color: dimColor } : undefined}
        >
          {selected ? `Selected: ${selected}/5` : 'Not answered'}
        </span>
      </div>

      {selectedAnchor && (
        <p className={styles.selectedSummary} style={{ borderLeftColor: dimColor }}>
          <span className={styles.selectedSummaryLabel}>Current selection</span>
          <span className={styles.selectedSummaryText}>{selectedAnchor}</span>
        </p>
      )}

      {/* Why we ask toggle */}
      <button
        className={styles.whyToggle}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? '▲ Hide guidance' : '▼ Why we ask this'}
      </button>
      {expanded && <p className={styles.whyText}>{q.whyWeAsk}</p>}

      {/* Score buttons */}
      <div className={styles.scores} role="radiogroup" aria-label={`Score for ${q.title}`}>
        {q.anchors.map((anchor, i) => {
          const score   = i + 1
          const isActive = selected === score
          return (
            <button
              key={score}
              role="radio"
              aria-checked={isActive}
              className={`${styles.scoreBtn} ${isActive ? styles.scoreBtnActive : ''}`}
              style={isActive ? { borderColor: dimColor, background: `${dimColor}18` } : {}}
              onClick={() => onScore(q.questionId, score)}
              title={anchor}
            >
              <span className={`${styles.scoreBtnNum} ${isActive ? styles.scoreBtnNumActive : ''}`}>{score}</span>
              <span className={styles.scoreBtnBody}>
                <span className={styles.scoreBtnText}>{anchor}</span>
                <span className={styles.scoreBtnHint}>{isActive ? 'Selected answer' : 'Click to choose this score'}</span>
              </span>
              <span className={`${styles.scoreBtnCheck} ${isActive ? styles.scoreBtnCheckActive : ''}`} aria-hidden="true">
                {isActive ? 'Selected' : ''}
              </span>
            </button>
          )
        })}
      </div>

      {/* Notes */}
      <textarea
        className={styles.notesInput}
        placeholder="Optional notes for this question…"
        value={answer?.notes ?? ''}
        rows={2}
        maxLength={500}
        onChange={(e) => onNotes(q.questionId, e.target.value)}
        onBlur={() => onNotesBlur(q.questionId)}
        aria-label={`Notes for ${q.title}`}
      />
    </div>
  )
}
