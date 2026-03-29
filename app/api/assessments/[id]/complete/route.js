// app/api/assessments/[id]/complete/route.js — POST: compute scores & mark complete
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { assertOrgAccess } from '@/lib/tenant'
import {
  computeTotalScore,
  computeDimensionScores,
  computeVerdict,
} from '@/lib/scoring'
import { QUESTIONS } from '@/lib/assessment-data'

export async function POST(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id: assessmentId } = await params

  const assessment = await prisma.assessment.findUnique({
    where:   { id: assessmentId },
    include: { responses: true },
  })
  if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (assessment.status === 'completed') {
    return NextResponse.json({ error: 'Already completed.' }, { status: 409 })
  }

  await assertOrgAccess(session.user.id, assessment.orgId)

  // Require all 30 questions answered
  if (assessment.responses.length < QUESTIONS.length) {
    return NextResponse.json(
      { error: `All ${QUESTIONS.length} questions must be answered before completing.` },
      { status: 422 }
    )
  }

  const totalScore    = computeTotalScore(assessment.responses)
  const dimScoresMap  = computeDimensionScores(assessment.responses)
  const verdict       = computeVerdict(totalScore)

  // Write dimension scores + mark as complete in a transaction
  await prisma.$transaction([
    ...Object.entries(dimScoresMap).map(([dimensionId, { score }]) =>
      prisma.dimensionScore.upsert({
        where:  { assessmentId_dimension: { assessmentId, dimension: dimensionId } },
        update: { score },
        create: { assessmentId, dimension: dimensionId, score },
      })
    ),
    prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status:      'completed',
        totalScore,
        verdict:     verdict.id,
        completedAt: new Date(),
      },
    }),
  ])

  return NextResponse.json({ totalScore, verdictId: verdict.id })
}
