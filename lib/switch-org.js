'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function switchOrg(orgId) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorised' }

  // Verify the user is actually a member of the target org
  const membership = await prisma.organisationMember.findUnique({
    where: { orgId_userId: { orgId, userId: session.user.id } },
  })
  if (!membership) return { error: 'Not a member of that organisation.' }

  const cookieStore = await cookies()
  cookieStore.set('sf_active_org', orgId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   365 * 24 * 60 * 60, // 1 year
  })

  revalidatePath('/', 'layout')
  return { success: true }
}
