// app/api/invitations/accept/route.js — POST: accept an invitation by token
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const token = (body.token ?? '').trim()
  if (!token) return NextResponse.json({ error: 'Token is required.' }, { status: 422 })

  const invitation = await prisma.invitation.findUnique({ where: { token } })

  if (!invitation) return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 })
  if (invitation.acceptedAt) return NextResponse.json({ error: 'Invitation has already been accepted.' }, { status: 409 })
  if (invitation.expiresAt < new Date()) return NextResponse.json({ error: 'Invitation has expired.' }, { status: 410 })

  // The logged-in user's email must match the invited address
  const currentEmail = session.user.email?.toLowerCase()
  if (currentEmail !== invitation.email.toLowerCase()) {
    return NextResponse.json(
      { error: `This invitation was sent to ${invitation.email}. Please sign in with that account.` },
      { status: 403 }
    )
  }

  // Check not already a member
  const alreadyMember = await prisma.organisationMember.findUnique({
    where: { orgId_userId: { orgId: invitation.orgId, userId: session.user.id } },
  })
  if (alreadyMember) {
    // Mark invitation accepted and return success — idempotent
    await prisma.invitation.update({ where: { token }, data: { acceptedAt: new Date() } })
    return NextResponse.json({ success: true, orgId: invitation.orgId })
  }

  // Create membership + mark accepted in a transaction
  await prisma.$transaction([
    prisma.organisationMember.create({
      data: { orgId: invitation.orgId, userId: session.user.id, role: invitation.role },
    }),
    prisma.invitation.update({
      where: { token },
      data:  { acceptedAt: new Date() },
    }),
  ])

  return NextResponse.json({ success: true, orgId: invitation.orgId })
}
