import Link from 'next/link'
import styles from './not-found.module.css'

export const metadata = { title: '404 — Page Not Found | SpanForge AI Readiness' }

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <p className={styles.code}>404</p>
        <h1 className={styles.heading}>Page not found</h1>
        <p className={styles.body}>
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link href="/dashboard" className={styles.cta}>
          Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
