// app/signin/page.js — Server Component
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import SignInButton from './SignInButton'
import styles from './page.module.css'

export const metadata = {
  title: 'Sign In',
  robots: { index: false },
}

export default async function SignInPage({ searchParams }) {
  const session     = await auth()
  const params      = await searchParams
  const callbackUrl = params?.callbackUrl ?? '/dashboard'
  const error       = params?.error
  const safeCallbackUrl = callbackUrl.startsWith('/') ? callbackUrl : '/dashboard'

  if (session) redirect(safeCallbackUrl)

  const errorMessages = {
    OAuthAccountNotLinked: 'This email is already linked to a different sign-in provider.',
    OAuthCallbackError:    'Sign-in was cancelled or failed. Please try again.',
    SessionRequired:       'You must be signed in to access that page.',
    Default:               'An unexpected error occurred. Please try again.',
  }
  const errorMsg = error ? (errorMessages[error] ?? errorMessages.Default) : null

  const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoSpan}>Span</span>
          <span className={styles.logoForge}>Forge</span>
        </div>
        <h1 className={styles.heading}>Sign in to SpanForge</h1>
        <p className={styles.sub}>AI Organisational Readiness Assessment</p>
        <p className={styles.helper}>Use your Google work account to continue. You will return here automatically after sign-in.</p>

        {errorMsg && (
          <div className={styles.error} role="alert">{errorMsg}</div>
        )}

        <div className={styles.providers}>
          {hasGoogle ? (
            <SignInButton callbackUrl={safeCallbackUrl} />
          ) : (
            <p className={styles.noProviders}>
              No OAuth provider configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.
            </p>
          )}
        </div>

        <p className={styles.legal}>
          By signing in you agree to SpanForge&apos;s terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}

