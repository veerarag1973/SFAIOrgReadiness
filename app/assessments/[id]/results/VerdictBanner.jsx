'use client'
import styles from './page.module.css'

export default function VerdictBanner({ verdict, totalScore, maxScore = 150, scoreGuide, discoverGatePassed }) {
  return (
    <div
      className={styles.verdictBanner}
      style={{ borderColor: verdict.color, background: `${verdict.color}10` }}
    >
      <div className={styles.verdictLeft}>
        <p className={styles.verdictLabel}>Overall Score</p>
        <p className={styles.verdictScore}>
          {totalScore}
          <span className={styles.verdictMax}>/{maxScore}</span>
        </p>
        <p className={styles.verdictId} style={{ color: verdict.color }}>{verdict.label}</p>
      </div>

      <div className={styles.verdictBody}>
        <div className={styles.verdictMeta}>
          <span className={styles.verdictChip}>{scoreGuide.label} band</span>
          <span className={`${styles.verdictChip} ${discoverGatePassed ? styles.chipPass : styles.chipFail}`}>
            {discoverGatePassed ? 'Discover gate passed' : 'Discover gate blocked'}
          </span>
        </div>
        <p className={styles.verdictDesc}>{verdict.description}</p>
        <p className={styles.verdictDescSecondary}>{scoreGuide.description}</p>
      </div>
    </div>
  )
}
