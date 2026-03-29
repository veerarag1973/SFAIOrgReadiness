// app/api/organisations/current/route.js — PATCH: update current org settings
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export async function PATCH(request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation' }, { status: 404 })

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners and admins can edit settings.' }, { status: 403 })
  }

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const name     = (body.name     ?? '').trim()
  const industry = (body.industry ?? '').trim()
  const size     = (body.size     ?? '').trim()
  const website  = (body.website  ?? '').trim()

  if (!name || name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: 'Name must be 2–120 characters.' }, { status: 422 })
  }

  const org = await (async () => {
    try {
      return await prisma.organisation.update({
        where: { id: membership.orgId },
        data: {
          name,
          industry: industry || null,
          size:     size     || null,
          website:  website  || null,
        },
      })
    } catch {
      return null
    }
  })()
  if (!org) return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })

  return NextResponse.json({ org })
}
