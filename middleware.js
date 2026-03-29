// middleware.js — global auth guard
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES  = ['/signin']
const PUBLIC_PREFIXES = ['/api/auth', '/_next', '/favicon']
const INVITE_ROUTE   = '/invitations/accept'

export default auth(function middleware(req) {
  const { pathname, searchParams } = req.nextUrl
  const session = req.auth

  // Static assets, Next internals, auth API
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Public marketing landing page — redirect signed-in users to dashboard
  if (pathname === '/') {
    if (session) {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Sign-in page — authenticated users don't need it
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (session) {
      const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
      const url = req.nextUrl.clone()
      url.pathname = callbackUrl.startsWith('/') ? callbackUrl : '/dashboard'
      url.search   = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Invitation accept page — preserve token through sign-in redirect
  if (pathname.startsWith(INVITE_ROUTE)) {
    if (!session) {
      const token       = searchParams.get('token') ?? ''
      const callbackUrl = `${INVITE_ROUTE}?token=${token}`
      const url         = req.nextUrl.clone()
      url.pathname      = '/signin'
      url.search        = ''
      url.searchParams.set('callbackUrl', callbackUrl)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // All other routes require authentication
  if (!session) {
    const callbackUrl = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    const url         = req.nextUrl.clone()
    url.pathname      = '/signin'
    url.search        = ''
    url.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)'],
}
