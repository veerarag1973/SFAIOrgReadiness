// lib/scoring.js — Score computation, maturity, benchmarks, and readiness actions
import {
  BENCHMARKS,
  DIMENSION_MATURITY_LEVELS,
  DIMENSIONS,
  DIMENSIONS_BY_ID,
  DISCOVER_GATE,
  FAILURE_SIGNALS,
  MAX_DIMENSION_SCORE,
  MAX_TOTAL_SCORE,
  QUESTIONS_BY_ID,
  QUICK_SCAN_QUESTIONS,
  ROADMAP_MONTHS,
  SCORE_GUIDE,
} from '@/lib/assessment-data'
import { getAssessmentMaxScore, isQuickScanAssessment } from '@/lib/assessment-kind'

export { DISCOVER_GATE, MAX_DIMENSION_SCORE, MAX_TOTAL_SCORE }

export const VERDICTS = [
  {
    id: 'ready',
    label: 'Ready',
    range: [120, 150],
    color: 'var(--discover)',
    description: 'Proceed with confidence. Benchmark against AI leaders in your sector. Review any dimension below 20 before committing to significant scale.',
  },
  {
    id: 'developing',
    label: 'Developing',
    range: [90, 119],
    color: 'var(--build)',
    description: 'AI projects can begin in stronger dimensions. Build a 90-day plan to address gaps. Revisit in 3 months.',
  },
  {
    id: 'emerging',
    label: 'Emerging',
    range: [75, 89],
    color: 'var(--design)',
    description: 'Targeted readiness work required. Use the dimension playbooks. Limit AI to low-risk experiments. Re-assess every 90 days.',
  },
  {
    id: 'nascent',
    label: 'Nascent',
    range: [0, 74],
    color: 'var(--red)',
    description: 'Stop. Build foundations first — do not commit to significant AI investment. Address Strategy and Data dimensions first.',
  },
]

export const QUICK_VERDICTS = [
  {
    id: 'quick_critical',
    label: 'Critical gaps exist',
    range: [0, 29],
    color: 'var(--red)',
    description: 'Leadership should not treat the organisation as AI-ready yet. At least one foundation is materially weak.',
  },
  {
    id: 'quick_developing',
    label: 'Developing',
    range: [30, 39],
    color: 'var(--build)',
    description: 'Leadership can proceed to the full assessment, but visible readiness gaps still need attention.',
  },
  {
    id: 'quick_ready',
    label: 'Ready for full assessment',
    range: [40, 50],
    color: 'var(--discover)',
    description: 'Leadership foundations look strong enough to justify the full 30-question readiness workshop.',
  },
]

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Returns the verdict object for a given total score (0–150).
 */
export function computeVerdict(totalScore) {
  return (
    VERDICTS.find(
      (v) => totalScore >= v.range[0] && totalScore <= v.range[1]
    ) ?? VERDICTS[VERDICTS.length - 1]
  )
}

export function computeQuickVerdict(totalScore) {
  return (
    QUICK_VERDICTS.find(
      (verdict) => totalScore >= verdict.range[0] && totalScore <= verdict.range[1]
    ) ?? QUICK_VERDICTS[0]
  )
}

export function computeAssessmentVerdict(assessment) {
  return isQuickScanAssessment(assessment)
    ? computeQuickVerdict(assessment.totalScore ?? 0)
    : computeVerdict(assessment.totalScore ?? 0)
}

export function computeDimensionMaturity(score) {
  return (
    DIMENSION_MATURITY_LEVELS.find(
      (level) => score >= level.range[0] && score <= level.range[1]
    ) ?? DIMENSION_MATURITY_LEVELS[0]
  )
}

/**
 * Given an array of AssessmentResponse rows ({ dimension, score }),
 * returns a map of { [dimensionId]: { score, count } }.
 */
export function computeDimensionScores(responses) {
  const map = Object.fromEntries(
    DIMENSIONS.map((dimension) => [dimension.id, { score: 0, count: 0 }])
  )

  for (const r of responses) {
    const dimensionId = QUESTIONS_BY_ID[r.questionId]?.dimension ?? r.dimension
    if (!map[dimensionId]) map[dimensionId] = { score: 0, count: 0 }
    map[dimensionId].score += r.score
    map[dimensionId].count += 1
  }
  return map
}

/**
 * Computes the total score from an array of AssessmentResponse rows.
 */
export function computeTotalScore(responses) {
  return responses.reduce((sum, r) => sum + (r.score ?? 0), 0)
}

/**
 * Returns true if the total score and all dimension scores
 * meet the Discover Gate threshold.
 *
 * @param {Record<string, { score: number, count: number }>} dimensionScores
 * @param {number} totalScore
 */
export function checkDiscoverGate(dimensionScores, totalScore) {
  if (totalScore < DISCOVER_GATE.minTotalScore) return false
  return Object.values(dimensionScores).every(
    (d) => d.score >= DISCOVER_GATE.minDimensionScore
  )
}

/**
 * Returns an array of dimension IDs where the score is below 18/25,
 * indicating dimensions that need focused improvement.
 *
 * @param {Record<string, { score: number, count: number }>} dimensionScores
 */
export function getDimensionRecommendations(dimensionScores) {
  const THRESHOLD = 18
  return Object.entries(dimensionScores)
    .filter(([, d]) => d.score < THRESHOLD)
    .sort(([, a], [, b]) => a.score - b.score)
    .map(([dimensionId]) => dimensionId)
}

export function getPriorityDimensions(dimensionScores, limit = 3) {
  return Object.entries(dimensionScores)
    .sort(([, left], [, right]) => left.score - right.score)
    .slice(0, limit)
    .map(([dimensionId, value]) => ({
      dimensionId,
      dimension: DIMENSIONS_BY_ID[dimensionId],
      score: value.score,
      count: value.count,
      maturity: computeDimensionMaturity(value.score),
    }))
}

export function computeQuickScan(responses) {
  const responseMap = Object.fromEntries(
    responses.map((response) => [response.questionId, response])
  )

  const items = QUICK_SCAN_QUESTIONS.map((item) => {
    const score = responseMap[item.questionId]?.score ?? 0
    return { ...item, score }
  })

  const totalScore = items.reduce((sum, item) => sum + item.score, 0)

  return {
    items,
    totalScore,
    maxScore: QUICK_SCAN_QUESTIONS.length * 5,
    verdict:
      totalScore < 30
        ? 'Critical gaps exist.'
        : totalScore < 40
          ? 'Developing.'
          : 'Ready for the full assessment.',
  }
}

export function getFailureSignals(dimensionScores) {
  return FAILURE_SIGNALS.flatMap((signal) => {
    if (signal.anyDimension) {
      const affectedDimensions = Object.entries(dimensionScores)
        .filter(([, value]) => value.score < signal.threshold)
        .map(([dimensionId]) => DIMENSIONS_BY_ID[dimensionId])

      if (affectedDimensions.length === 0) return []

      return [{
        ...signal,
        affectedDimensions,
      }]
    }

    const isTriggered = signal.dimensionIds.every(
      (dimensionId) => (dimensionScores[dimensionId]?.score ?? 0) < signal.threshold
    )

    return isTriggered
      ? [{
          ...signal,
          affectedDimensions: signal.dimensionIds.map((dimensionId) => DIMENSIONS_BY_ID[dimensionId]),
        }]
      : []
  })
}

function benchmarkEntryScore(entry) {
  const numeric = entry.typicalScore.split('-').map((part) => Number.parseInt(part, 10))
  return Number.isFinite(numeric[0]) ? numeric[0] : 0
}

export function getMatchedBenchmark(org = {}) {
  const industryMatch = BENCHMARKS.find((benchmark) =>
    benchmark.industries?.includes(org.industry)
  )

  if (industryMatch) return industryMatch

  return BENCHMARKS.find((benchmark) => benchmark.sizeKeys?.includes(org.size)) ?? null
}

export function getBenchmarksForOrg(org = {}) {
  const matchedBenchmark = getMatchedBenchmark(org)

  return BENCHMARKS
    .slice()
    .sort((left, right) => benchmarkEntryScore(right) - benchmarkEntryScore(left))
    .map((benchmark) => ({
      ...benchmark,
      isMatch: matchedBenchmark?.id === benchmark.id,
    }))
}

export function computeDimensionDelta(currentScores, previousScores = {}) {
  return DIMENSIONS.map((dimension) => {
    const current = currentScores[dimension.id]?.score ?? 0
    const previous = previousScores[dimension.id]?.score ?? 0
    return {
      dimension,
      current,
      previous,
      delta: current - previous,
    }
  })
}

export function buildRoadmap(dimensionScores, limit = 3) {
  const focusDimensions = getPriorityDimensions(dimensionScores, limit).map((item) => ({
    ...item,
    actions: item.dimension.playbook[item.maturity.id === 'leading' ? 'operational' : item.maturity.id],
  }))

  return {
    focusDimensions,
    months: ROADMAP_MONTHS,
  }
}

export function getScoreGuide(totalScore) {
  return (
    SCORE_GUIDE.find((entry) => totalScore >= entry.range[0] && totalScore <= entry.range[1])
    ?? SCORE_GUIDE[SCORE_GUIDE.length - 1]
  )
}

export function getAssessmentScale(assessment) {
  return {
    maxScore: getAssessmentMaxScore(assessment),
    scoreLabel: `${assessment.totalScore ?? 0}/${getAssessmentMaxScore(assessment)}`,
  }
}

/**
 * Returns a percentage (0–100) for use in visual progress bars.
 */
export function scoreToPercent(score, max = MAX_DIMENSION_SCORE) {
  return Math.round((score / max) * 100)
}
