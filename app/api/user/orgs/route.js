// app/api/user/orgs/route.js — GET all org memberships for the signed-in user
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const memberships = await prisma.organisationMember.findMany({
    where:   { userId: session.user.id },
    include: { org: { select: { id: true, name: true, slug: true, plan: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ memberships })
}
