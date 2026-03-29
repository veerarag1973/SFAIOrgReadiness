// app/api/assessments/[id]/route.js — GET single + DELETE
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { assertOrgAccess } from '@/lib/tenant'

async function getAssessmentForUser(assessmentId, userId) {
  const assessment = await prisma.assessment.findUnique({
    where:   { id: assessmentId },
    include: {
      responses:        true,
      dimensionScores:  true,
    },
  })
  if (!assessment) return null
  // Verify user belongs to the org
  await assertOrgAccess(userId, assessment.orgId)
  return assessment
}

export async function GET(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params
  const assessment = await getAssessmentForUser(id, session.user.id)
  if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ assessment })
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params
  const assessment = await prisma.assessment.findUnique({ where: { id } })
  if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await assertOrgAccess(session.user.id, assessment.orgId)

  await prisma.assessment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
