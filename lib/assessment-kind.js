export function isQuickScanAssessment(assessment) {
  return assessment?.kind === 'quick_scan'
}

export function stripAssessmentDescriptionMetadata(description = '') {
  return description.trim()
}

export function getAssessmentMaxScore(assessment) {
  return isQuickScanAssessment(assessment) ? 50 : 150
}

export function getAssessmentQuestionCount(assessment) {
  return isQuickScanAssessment(assessment) ? 10 : 30
}

export function getAssessmentKindLabel(assessment) {
  return isQuickScanAssessment(assessment) ? 'Quick Scan' : 'Full Assessment'
}

export function buildQuickScanName(orgName, completedAt = new Date()) {
  const formattedDate = completedAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${orgName} Executive Quick Scan - ${formattedDate}`
}
