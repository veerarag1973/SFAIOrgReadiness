'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { switchOrg } from '@/lib/switch-org'
import styles from './OrgSwitcher.module.css'

export default function OrgSwitcher() {
  const { data: session } = useSession()
  const router   = useRouter()
  const [open, setOpen]            = useState(false)
  const [memberships, setMemberships] = useState([])
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/user/orgs')
      .then((r) => r.json())
      .then((d) => { if (d.memberships) setMemberships(d.memberships) })
      .catch(() => {})
  }, [session?.user?.id])

  const currentOrgId   = session?.user?.orgId
  const currentOrgName = session?.user?.orgName

  if (!currentOrgName) return null

  if (memberships.length <= 1) {
    return <span className={styles.orgName}>{currentOrgName}</span>
  }

  function handleSwitch(orgId) {
    if (orgId === currentOrgId) { setOpen(false); return }
    setOpen(false)
    startTransition(async () => {
      await switchOrg(orgId)
      router.push('/dashboard')
      router.refresh()
    })
  }  return (
    <div className={styles.root}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch organisation"
        aria-expanded={open}
        disabled={pending}
      >
        <span className={styles.orgName}>{currentOrgName}</span>
        <svg className={`${styles.chevron} ${open ? styles.chevronUp : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.dropdown}>
            <p className={styles.dropdownLabel}>Switch organisation</p>
            {memberships.map((m) => (
              <button
                key={m.org.id}
                className={`${styles.dropdownItem} ${m.org.id === currentOrgId ? styles.active : ''}`}
                onClick={() => handleSwitch(m.org.id)}
              >
                <span className={styles.dropdownOrgName}>{m.org.name}</span>
                <span className={styles.dropdownRole}>{m.role}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
