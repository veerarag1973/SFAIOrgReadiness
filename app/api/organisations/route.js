// app/api/organisations/route.js — POST: create org & assign owner role
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name     = (body.name     ?? '').trim()
  const industry = (body.industry ?? '').trim()
  const size     = (body.size     ?? '').trim()
  const website  = (body.website  ?? '').trim()

  if (!name || name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: 'Organisation name must be 2–120 characters.' }, { status: 422 })
  }

  // Rate limit: 3 organisations per user per hour
  const { allowed } = rateLimit(`create-org:${session.user.id}`, 3, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many organisations created. Please wait before creating another.' }, { status: 429 })
  }

  // Build a unique slug — relies on the DB @unique constraint; retries on collision (P2002)
  const baseSlug = slugify(name)
  let org = null
  for (let attempt = 0; attempt <= 5; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`
    try {
      org = await prisma.organisation.create({
        data: {
          name,
          slug,
          industry: industry || null,
          size:     size     || null,
          website:  website  || null,
          plan:     'free',
          members: {
            create: {
              userId: session.user.id,
              role:   'owner',
            },
          },
        },
      })
      break // success
    } catch (err) {
      // P2002 = unique constraint violation; retry with suffixed slug
      if (err?.code === 'P2002' && err?.meta?.target?.includes('slug') && attempt < 5) continue
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
    }
  }

  if (!org) return NextResponse.json({ error: 'Could not generate a unique identifier for this organisation name.' }, { status: 409 })

  return NextResponse.json({ org }, { status: 201 })
}
