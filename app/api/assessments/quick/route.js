import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { QUICK_SCAN_QUESTIONS, QUESTIONS_BY_ID } from '@/lib/assessment-data'
import { buildQuickScanName } from '@/lib/assessment-kind'
import { computeDimensionScores, computeQuickVerdict, computeTotalScore } from '@/lib/scoring'
import { getActiveOrg } from '@/lib/tenant'

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation found' }, { status: 404 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const answers = body.answers ?? {}
  const notes = (body.notes ?? '').trim()

  const missingQuestions = QUICK_SCAN_QUESTIONS.filter((question) => {
    const score = answers[question.id]
    return !Number.isInteger(score) || score < 1 || score > 5
  })

  if (missingQuestions.length > 0) {
    return NextResponse.json({ error: 'All 10 quick-scan questions must be scored before saving.' }, { status: 422 })
  }

  const completedAt = new Date()
  const responses = QUICK_SCAN_QUESTIONS.map((question) => {
    const mappedQuestion = QUESTIONS_BY_ID[question.questionId]
    return {
      questionId: question.questionId,
      dimension: mappedQuestion.dimension,
      score: answers[question.id],
      notes: null,
      respondentId: session.user.id,
    }
  })

  const totalScore = computeTotalScore(responses)
  const verdict = computeQuickVerdict(totalScore)
  const dimensionScores = computeDimensionScores(responses)

  const assessment = await prisma.assessment.create({
    data: {
      name: buildQuickScanName(membership.org.name, completedAt),
      description: notes || null,
      kind: 'quick_scan',
      orgId: membership.orgId,
      createdById: session.user.id,
      status: 'completed',
      totalScore,
      verdict: verdict.id,
      completedAt,
      responses: {
        create: responses,
      },
      dimensionScores: {
        create: Object.entries(dimensionScores).map(([dimension, value]) => ({
          dimension,
          score: value.score,
          maxScore: value.count * 5,
        })),
      },
    },
    select: { id: true },
  })

  return NextResponse.json({ assessmentId: assessment.id }, { status: 201 })
}