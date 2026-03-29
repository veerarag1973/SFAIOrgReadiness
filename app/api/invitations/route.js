// app/api/invitations/route.js — POST: create invitation, GET: list pending
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/rate-limit'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation' }, { status: 404 })

  try {
    const invitations = await prisma.invitation.findMany({
      where:   { orgId: membership.orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ invitations })
  } catch {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const membership = await getActiveOrg(session.user.id)
  if (!membership) return NextResponse.json({ error: 'No organisation' }, { status: 404 })

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners and admins can invite members.' }, { status: 403 })
  }

  // Rate limit: 10 invitations per user per 10 minutes
  const { allowed } = rateLimit(`invite:${session.user.id}`, 10, 10 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many invitations sent. Please wait before sending more.' }, { status: 429 })
  }

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const email = (body.email ?? '').trim().toLowerCase()
  const role  = body.role ?? 'member'

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email address required.' }, { status: 422 })
  }
  if (!['admin', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Role must be admin or member.' }, { status: 422 })
  }

  try {
  // Check if email already a member of this org
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    const alreadyMember = await prisma.organisationMember.findUnique({
      where: { orgId_userId: { orgId: membership.orgId, userId: existingUser.id } },
    })
    if (alreadyMember) {
      return NextResponse.json({ error: 'This person is already a member of your organisation.' }, { status: 409 })
    }
  }

  // Check for existing pending non-expired invitation
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      orgId:      membership.orgId,
      email,
      acceptedAt: null,
      expiresAt:  { gt: new Date() },
    },
  })
  if (existingInvite) {
    return NextResponse.json({ error: 'A pending invitation for this address already exists.' }, { status: 409 })
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invitation = await prisma.invitation.create({
    data: {
      orgId:       membership.orgId,
      email,
      role,
      invitedById: session.user.id,
      expiresAt,
    },
  })

  // Email sending is handled by the app layer; return the accept URL for now
  const appUrl    = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const acceptUrl = `${appUrl}/invitations/accept?token=${invitation.token}`
  let emailSent = false
  let emailWarning = null

  // Send invitation email via Resend (gracefully degraded — non-fatal)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const inviterName = session.user.name ?? session.user.email ?? 'Someone'
      await resend.emails.send({
        from:    process.env.EMAIL_FROM ?? 'SpanForge <noreply@getspanforge.com>',
        to:      email,
        subject: `${inviterName} invited you to join ${membership.org.name} on SpanForge`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; background: #0d0d0d; margin: 0; padding: 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto;">
    <tr>
      <td style="padding-bottom: 32px;">
        <span style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
          <span style="color: #ffffff;">Span</span><span style="color: #c0392b;">Forge</span>
        </span>
      </td>
    </tr>
    <tr>
      <td style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 40px;">
        <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #666; margin: 0 0 16px;">Invitation</p>
        <h1 style="font-size: 24px; font-weight: 700; color: #f0f0f0; margin: 0 0 16px; line-height: 1.2;">
          You're invited to join<br><span style="color:#c0392b;">${membership.org.name}</span>
        </h1>
        <p style="font-size: 15px; color: #999; margin: 0 0 32px; line-height: 1.6;">
          <strong style="color: #e0e0e0;">${inviterName}</strong> has invited you to join as a
          <strong style="color: #e0e0e0;">${role === 'admin' ? 'Administrator' : 'Member'}</strong>.
          This invitation expires in 7 days.
        </p>
        <a href="${acceptUrl}"
           style="display: inline-block; background: #c0392b; color: #fff; text-decoration: none;
                  font-family: monospace; font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
                  text-transform: uppercase; padding: 14px 28px; border-radius: 6px;">
          Accept Invitation
        </a>
        <p style="font-size: 12px; color: #555; margin: 24px 0 0; line-height: 1.5;">
          Or copy this link: <a href="${acceptUrl}" style="color: #888;">${acceptUrl}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top: 24px;">
        <p style="font-size: 12px; color: #444; margin: 0; line-height: 1.5;">
          SpanForge · AI Organisational Readiness Assessment<br>
          If you did not expect this invitation, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
      })
      emailSent = true
    } catch (emailErr) {
      // Log but don't fail the request — invitation record already created
      console.error('Failed to send invitation email:', emailErr)
      emailWarning = 'Invitation created, but the email could not be sent. Use the accept link below.'
    }
  } else {
    emailWarning = 'Invitation created, but email delivery is not configured. Add RESEND_API_KEY and EMAIL_FROM to enable email sending.'
  }

  return NextResponse.json({ invitation, acceptUrl, emailSent, emailWarning }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
  }
}
