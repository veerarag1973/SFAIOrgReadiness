// app/api/assessments/[id]/complete/route.js — POST: compute scores & mark complete
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { assertOrgAccessApi } from '@/lib/tenant'
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

  let assessment
  try {
    assessment = await prisma.assessment.findUnique({
      where:   { id: assessmentId },
      include: { responses: true },
    })
  } catch {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
  }
  if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (assessment.status === 'completed') {
    return NextResponse.json({ error: 'Already completed.' }, { status: 409 })
  }

  const member = await assertOrgAccessApi(session.user.id, assessment.orgId)
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

  try {
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
  } catch {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
  }

  return NextResponse.json({ totalScore, verdictId: verdict.id })
}
