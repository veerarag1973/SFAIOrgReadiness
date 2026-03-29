// app/api/assessments/[id]/collaborators/route.js — GET / POST / DELETE collaborators
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

async function resolveAssessment(assessmentId, orgId) {
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
  if (!assessment || assessment.orgId !== orgId) return null
  return assessment
}

export async function GET(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params
  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation' }, { status: 404 })

  const assessment = await resolveAssessment(id, membership.org.id)
  if (!assessment) return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 })

  const collaborators = await prisma.assessmentCollaborator.findMany({
    where:   { assessmentId: id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { invitedAt: 'asc' },
  })
  return NextResponse.json({ collaborators })
}

export async function POST(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params
  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation' }, { status: 404 })

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners and admins can add collaborators.' }, { status: 403 })
  }

  const assessment = await resolveAssessment(id, membership.org.id)
  if (!assessment) return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const userId = body.userId
  if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 422 })

  // Must be an org member
  const targetMember = await prisma.organisationMember.findUnique({
    where: { orgId_userId: { orgId: membership.org.id, userId } },
  })
  if (!targetMember) {
    return NextResponse.json({ error: 'User is not a member of this organisation.' }, { status: 422 })
  }

  // Upsert — idempotent
  const collaborator = await prisma.assessmentCollaborator.upsert({
    where:  { assessmentId_userId: { assessmentId: id, userId } },
    create: { assessmentId: id, userId, joinedAt: new Date() },
    update: {},
  })
  return NextResponse.json({ collaborator }, { status: 201 })
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params
  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation' }, { status: 404 })

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners and admins can remove collaborators.' }, { status: 403 })
  }

  const assessment = await resolveAssessment(id, membership.org.id)
  if (!assessment) return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const userId = body.userId
  if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 422 })

  await prisma.assessmentCollaborator.deleteMany({
    where: { assessmentId: id, userId },
  })
  return NextResponse.json({ success: true })
}
