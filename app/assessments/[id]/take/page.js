// app/assessments/[id]/take/page.js — Assessment wizard (Server Shell)
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { assertOrgAccess } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { QUESTIONS, DIMENSIONS } from '@/lib/assessment-data'
import { isQuickScanAssessment } from '@/lib/assessment-kind'
import AssessmentWizard from './AssessmentWizard'
import styles from './page.module.css'

export async function generateMetadata({ params }) {
  const { id } = await params
  const a = await prisma.assessment.findUnique({ where: { id }, select: { name: true } })
  return { title: a?.name ?? 'Assessment' }
}

export default async function TakePage({ params }) {
  const session = await auth()
  if (!session) redirect('/signin')

  const { id } = await params

  const assessment = await prisma.assessment.findUnique({
    where:   { id },
    include: { responses: { select: { questionId: true, score: true, notes: true } } },
  })

  if (!assessment) redirect('/assessments')
  if (isQuickScanAssessment(assessment)) redirect(`/assessments/${id}/results`)
  if (assessment.status === 'completed') redirect(`/assessments/${id}/results`)

  await assertOrgAccess(session.user.id, assessment.orgId)

  // Build initial answers map from saved responses
  const savedAnswers = {}
  for (const r of assessment.responses) {
    savedAnswers[r.questionId] = { score: r.score, notes: r.notes ?? '' }
  }

  return (
    <main className={styles.main}>
      <AssessmentWizard
        assessmentId={id}
        assessmentName={assessment.name ?? 'Untitled Assessment'}
        questions={QUESTIONS}
        dimensions={DIMENSIONS}
        savedAnswers={savedAnswers}
      />
    </main>
  )
}
