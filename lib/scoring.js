// lib/scoring.js — Score computation, verdicts, and recommendations

// ─── Constants ────────────────────────────────────────────────────────────────

/** Total questions × max score per question = 30 × 5 = 150 */
export const MAX_TOTAL_SCORE = 150

/** Questions per dimension = 5; max dimension score = 25 */
export const MAX_DIMENSION_SCORE = 25

/** Discover Gate minimum requirements */
export const DISCOVER_GATE = {
  minTotalScore: 90,    // must score ≥ 90/150 overall
  minDimensionScore: 12, // no dimension may fall below 12/25
}

// ─── Verdict Table ─────────────────────────────────────────────────────────────
// Derived from the assessment rubric in the .docx

export const VERDICTS = [
  {
    id:         'ai_ready',
    label:      'AI-Ready',
    range:      [130, 150],
    color:      'var(--discover)',
    description:
      'Your organisation demonstrates strong AI readiness across all dimensions. You are well-positioned to deploy AI initiatives at scale.',
  },
  {
    id:         'developing',
    label:      'Developing',
    range:      [105, 129],
    color:      'var(--define)',
    description:
      'You have solid foundations with some gaps. Target the lower-scoring dimensions to accelerate your AI readiness journey.',
  },
  {
    id:         'emerging',
    label:      'Emerging',
    range:      [75, 104],
    color:      'var(--design)',
    description:
      'AI readiness is emerging but significant capability gaps remain. Structured investment in weaker dimensions is recommended before scaling AI.',
  },
  {
    id:         'not_ready',
    label:      'Not Ready',
    range:      [0, 74],
    color:      'var(--red)',
    description:
      'Foundational work is needed before meaningful AI adoption. Focus on the Discover phase priorities to build the core capabilities required.',
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

/**
 * Given an array of AssessmentResponse rows ({ dimension, score }),
 * returns a map of { [dimensionId]: { score, count } }.
 */
export function computeDimensionScores(responses) {
  const map = {}
  for (const r of responses) {
    if (!map[r.dimension]) map[r.dimension] = { score: 0, count: 0 }
    map[r.dimension].score += r.score
    map[r.dimension].count += 1
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

/**
 * Returns a percentage (0–100) for use in visual progress bars.
 */
export function scoreToPercent(score, max = MAX_DIMENSION_SCORE) {
  return Math.round((score / max) * 100)
}
