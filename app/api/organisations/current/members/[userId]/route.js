// app/api/organisations/current/members/[userId]/route.js — PATCH role / DELETE member
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

async function resolveContext(currentUserId) {
  const membership = await getActiveOrg(currentUserId)
  if (!membership) return { error: 'No organisation', status: 404 }
  if (membership.role !== 'owner' && membership.role !== 'admin') {
    return { error: 'Insufficient permissions.', status: 403 }
  }
  return { membership }
}

export async function PATCH(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { userId: targetId } = await params
  const ctx = await resolveContext(session.user.id)
  if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const { membership } = ctx

  // Cannot demote the org owner
  const target = await prisma.organisationMember.findUnique({
    where: { orgId_userId: { orgId: membership.orgId, userId: targetId } },
  })
  if (!target) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
  if (target.role === 'owner') return NextResponse.json({ error: 'Cannot change owner role.' }, { status: 409 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const role = body.role
  if (!['admin', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Role must be admin or member.' }, { status: 422 })
  }

  const updated = await prisma.organisationMember.update({
    where: { orgId_userId: { orgId: membership.orgId, userId: targetId } },
    data:  { role },
  })
  return NextResponse.json({ member: updated })
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { userId: targetId } = await params
  const ctx = await resolveContext(session.user.id)
  if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status })

  const { membership } = ctx

  const target = await prisma.organisationMember.findUnique({
    where: { orgId_userId: { orgId: membership.orgId, userId: targetId } },
  })
  if (!target) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
  if (target.role === 'owner') return NextResponse.json({ error: 'Cannot remove the owner.' }, { status: 409 })

  await prisma.organisationMember.delete({
    where: { orgId_userId: { orgId: membership.orgId, userId: targetId } },
  })
  return NextResponse.json({ success: true })
}
