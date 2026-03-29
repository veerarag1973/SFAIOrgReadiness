'use client'
// app/settings/members/MemberList.jsx
import { useState } from 'react'
import styles from '../page.module.css'

const ROLE_LABEL = { owner: 'Owner', admin: 'Admin', member: 'Member' }

export default function MemberList({ members, currentUserId, currentUserRole, orgId }) {
  const [list,    setList]    = useState(members)
  const [loading, setLoading] = useState(null)
  const [error,   setError]   = useState('')

  async function updateRole(userId, newRole) {
    setLoading(userId)
    setError('')
    try {
      const res = await fetch(`/api/organisations/current/members/${userId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to update role.')
        return
      }
      setList((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      )
    } catch {
      setError('Network error.')
    } finally {
      setLoading(null)
    }
  }

  async function removeMember(userId) {
    if (!window.confirm('Remove this member from the organisation?')) return
    setLoading(userId)
    setError('')
    try {
      const res = await fetch(`/api/organisations/current/members/${userId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to remove member.')
        return
      }
      setList((prev) => prev.filter((m) => m.userId !== userId))
    } catch {
      setError('Network error.')
    } finally {
      setLoading(null)
    }
  }

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  return (
    <div className={styles.memberList}>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      {list.map((m) => {
        const isMe        = m.userId === currentUserId
        const isOwner     = m.role === 'owner'
        const canChange   = canManage && !isOwner && !isMe
        return (
          <div key={m.userId} className={styles.memberRow}>
            <div className={styles.memberAvatar}>
              {m.user.image
                ? <img src={m.user.image} alt="" width="32" height="32" referrerPolicy="no-referrer" />
                : <span>{(m.user.name ?? m.user.email ?? '?')[0].toUpperCase()}</span>
              }
            </div>
            <div className={styles.memberInfo}>
              <p className={styles.memberName}>{m.user.name ?? 'Unknown'} {isMe && <span className={styles.youBadge}>you</span>}</p>
              <p className={styles.memberEmail}>{m.user.email}</p>
            </div>
            <div className={styles.memberActions}>
              {canChange ? (
                <select
                  value={m.role}
                  onChange={(e) => updateRole(m.userId, e.target.value)}
                  className={styles.select}
                  disabled={loading === m.userId}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              ) : (
                <span className={styles.roleTag}>{ROLE_LABEL[m.role]}</span>
              )}
              {canChange && (
                <button
                  className={styles.removeBtn}
                  onClick={() => removeMember(m.userId)}
                  disabled={loading === m.userId}
                  aria-label={`Remove ${m.user.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
