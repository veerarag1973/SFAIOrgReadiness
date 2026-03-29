import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoSpan}>Span</span>
            <span className={styles.logoForge}>Forge</span>
          </div>
          <p className={styles.tagline}>Where Enterprise AI Goes to Production</p>
          <p className={styles.sub}>AI Organisational Readiness Assessment</p>
        </div>

        <div className={styles.col}>
          <span className={styles.colHead}>Assessment</span>
          <ul>
            <li><Link href="/assessments"     className={styles.colLink}>All Assessments</Link></li>
            <li><Link href="/assessments/new" className={styles.colLink}>New Assessment</Link></li>
            <li><Link href="/dashboard"       className={styles.colLink}>Dashboard</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <span className={styles.colHead}>Account</span>
          <ul>
            <li><Link href="/settings"         className={styles.colLink}>Organisation Settings</Link></li>
            <li><Link href="/settings/members" className={styles.colLink}>Team Members</Link></li>
            <li><Link href="/signin"           className={styles.colLink}>Sign In</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <span className={styles.colHead}>SpanForge</span>
          <ul>
            <li><a href="https://getspanforge.com" className={styles.colLink} target="_blank" rel="noopener noreferrer">Platform Home</a></li>
            <li><a href="https://getspanforge.com/blog" className={styles.colLink} target="_blank" rel="noopener noreferrer">Blog</a></li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span className={styles.copyright}>© {year} SpanForge. All rights reserved.</span>
      </div>
    </footer>
  )
}
