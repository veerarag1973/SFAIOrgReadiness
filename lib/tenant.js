// lib/tenant.js — Multi-tenant helper utilities
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

/**
 * Returns the active OrganisationMember row for a user.
 * Respects the sf_active_org cookie when called from a Server Component.
 * Falls back to the earliest joined org.
 */
export async function getActiveOrg(userId) {
  if (!userId) return null

  // Try to read the cookie — only available in RSC/Route Handler context
  let preferredOrgId = null
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    preferredOrgId = cookieStore.get('sf_active_org')?.value ?? null
  } catch {
    // Not in a request context (e.g. called from middleware) — ignore
  }

  if (preferredOrgId) {
    const member = await prisma.organisationMember.findUnique({
      where: { orgId_userId: { orgId: preferredOrgId, userId } },
      include: { org: true },
    })
    if (member) return member
    // Cookie points to an org the user no longer belongs to — fall through
  }

  return prisma.organisationMember.findFirst({
    where: { userId },
    include: { org: true },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Returns the OrganisationMember row asserting the user
 * belongs to the given org. Redirects to /dashboard if not.
 */
export async function assertOrgAccess(userId, orgId) {
  const member = await prisma.organisationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
    include: { org: true },
  })
  if (!member) redirect('/dashboard')
  return member
}

/**
 * Returns the org slug → orgId mapping (used in URL-slug routes).
 * Throws a 404-style redirect if slug not found.
 */
export async function getOrgBySlug(slug) {
  const org = await prisma.organisation.findUnique({ where: { slug } })
  if (!org) redirect('/dashboard')
  return org
}

/**
 * Returns all members of an organisation with their user details.
 */
export async function getOrgMembers(orgId) {
  return prisma.organisationMember.findMany({
    where: { orgId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: 'asc' },
  })
}
