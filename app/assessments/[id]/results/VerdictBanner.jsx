'use client'
// app/assessments/[id]/results/VerdictBanner.jsx
import styles from './page.module.css'

export default function VerdictBanner({ verdict, totalScore }) {
  return (
    <div
      className={styles.verdictBanner}
      style={{ borderColor: verdict.color, background: `${verdict.color}10` }}
    >
      <div className={styles.verdictLeft}>
        <p className={styles.verdictLabel}>Overall Score</p>
        <p className={styles.verdictScore}>
          {totalScore}
          <span className={styles.verdictMax}>/150</span>
        </p>
        <p className={styles.verdictId} style={{ color: verdict.color }}>{verdict.label}</p>
      </div>
      <p className={styles.verdictDesc}>{verdict.description}</p>
    </div>
  )
}
