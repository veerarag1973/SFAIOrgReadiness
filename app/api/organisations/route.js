// app/api/organisations/route.js — POST: create org & assign owner role
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

  // Build a unique slug
  const baseSlug = slugify(name)
  let slug       = baseSlug
  let attempt    = 0
  while (await prisma.organisation.findUnique({ where: { slug } })) {
    attempt += 1
    slug = `${baseSlug}-${attempt}`
  }

  const org = await prisma.organisation.create({
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

  return NextResponse.json({ org }, { status: 201 })
}
