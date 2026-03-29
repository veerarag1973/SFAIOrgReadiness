// app/api/assessments/route.js — GET (list) + POST (create)
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getActiveOrg } from '@/lib/tenant'

// GET /api/assessments — list org assessments
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation found' }, { status: 404 })

  const assessments = await prisma.assessment.findMany({
    where:   { orgId: membership.orgId },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ assessments })
}

// POST /api/assessments — create a new assessment
export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation found' }, { status: 404 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const name        = (body.name        ?? '').trim()
  const description = (body.description ?? body.notes ?? '').trim()

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Assessment name must be at least 2 characters.' }, { status: 422 })
  }

  const assessment = await prisma.assessment.create({
    data: {
      name,
      description:  description || null,
      orgId:        membership.orgId,
      createdById:  session.user.id,
      status:       'draft',
    },
  })

  return NextResponse.json({ assessment }, { status: 201 })
}
