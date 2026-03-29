// app/api/assessments/[id]/responses/route.js — PATCH (upsert a question response)
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { assertOrgAccess } from '@/lib/tenant'
import { QUESTIONS_BY_ID } from '@/lib/assessment-data'

export async function PATCH(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id: assessmentId } = await params

  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
  if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (assessment.status === 'completed') {
    return NextResponse.json({ error: 'Assessment is already completed.' }, { status: 409 })
  }

  await assertOrgAccess(session.user.id, assessment.orgId)

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { questionId, score, notes } = body

  if (!questionId || !QUESTIONS_BY_ID[questionId]) {
    return NextResponse.json({ error: 'Invalid questionId.' }, { status: 422 })
  }
  if (typeof score !== 'number' || score < 1 || score > 5 || !Number.isInteger(score)) {
    return NextResponse.json({ error: 'Score must be an integer 1–5.' }, { status: 422 })
  }

  const question = QUESTIONS_BY_ID[questionId]

  const response = await prisma.assessmentResponse.upsert({
    where:  { assessmentId_questionId: { assessmentId, questionId } },
    update: { score, notes: notes ?? null, respondentId: session.user.id },
    create: {
      assessmentId,
      questionId,
      dimension:    question.dimension,
      score,
      notes:        notes ?? null,
      respondentId: session.user.id,
    },
  })

  // Flip status to in_progress if still draft
  if (assessment.status === 'draft') {
    await prisma.assessment.update({
      where: { id: assessmentId },
      data:  { status: 'in_progress' },
    })
  }

  return NextResponse.json({ response })
}
