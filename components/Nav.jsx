'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import OrgSwitcher from './OrgSwitcher'
import styles from './Nav.module.css'

export default function Nav() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const pathname                    = usePathname()
  const { data: session, status }   = useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} role="navigation" aria-label="Main navigation">
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="SpanForge home">
          <span className={styles.logoSpan}>Span</span>
          <span className={styles.logoForge}>Forge</span>
          <span className={styles.logoSub}>AI Readiness</span>
        </Link>

        {/* Desktop links */}
        <ul className={styles.links} role="list">
          {session && (
            <>
              <li>
                <Link href="/dashboard" className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/assessments" className={`${styles.link} ${isActive('/assessments') ? styles.active : ''}`}>
                  Assessments
                </Link>
              </li>
              <li>
                <Link href="/assessments/quick" className={`${styles.link} ${pathname === '/assessments/quick' ? styles.active : ''}`}>
                  Quick Scan
                </Link>
              </li>
              <li>
                <Link href="/settings" className={`${styles.link} ${isActive('/settings') ? styles.active : ''}`}>
                  Settings
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Auth controls */}
        <div className={styles.actions}>
          {status === 'loading' ? null : session ? (
            <div className={styles.userMenu}>
              {session.user?.image && (
                <img src={session.user.image} alt={session.user.name ?? 'User'} className={styles.avatar} width={32} height={32} />
              )}
              <OrgSwitcher />
              <button
                className={`btn-ghost ${styles.desktopAction}`}
                onClick={() => signOut({ callbackUrl: '/signin' })}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/signin" className={`btn-primary ${styles.desktopAction}`}>
              Sign in
            </Link>
          )}

          {/* Hamburger */}
          {session && (
            <button
              className={styles.hamburger}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(v => !v)}
            >
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && session && (
        <div className={styles.mobileMenu} id="mobile-navigation">
          <div className={styles.mobileMenuHeader}>
            <span className={styles.mobileMenuLabel}>Signed in as</span>
            <span className={styles.mobileMenuValue}>{session.user?.orgName ?? session.user?.name ?? session.user?.email}</span>
          </div>
          <Link href="/dashboard"   className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/assessments" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Assessments</Link>
          <Link href="/assessments/quick" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Quick Scan</Link>
          <Link href="/settings"    className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Settings</Link>
          <button
            className={styles.mobileLink}
            onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/signin' }) }}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
