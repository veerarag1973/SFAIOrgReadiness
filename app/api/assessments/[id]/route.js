// app/api/assessments/[id]/route.js — GET single + DELETE
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { assertOrgAccessApi } from '@/lib/tenant'

export async function GET(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { id } = await params
    const assessment = await prisma.assessment.findUnique({
      where:   { id },
      include: { responses: true, dimensionScores: true },
    })
    if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const member = await assertOrgAccessApi(session.user.id, assessment.orgId)
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ assessment })
  } catch {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { id } = await params
    const assessment = await prisma.assessment.findUnique({ where: { id } })
    if (!assessment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const member = await assertOrgAccessApi(session.user.id, assessment.orgId)
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.assessment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
  }
}
