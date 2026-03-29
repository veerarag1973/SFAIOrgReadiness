// app/page.js — Public landing page
// Signed-in users are redirected to /dashboard by middleware before this renders.
import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'AI Organisational Readiness Assessment — SpanForge',
  description: 'Is your organisation ready to build, deploy, and govern AI at enterprise scale? Take the 30-question assessment to find out.',
}

const DIMENSIONS = [
  { id: '01', label: 'Strategy',       desc: 'Does leadership have a coherent, funded, and committed AI strategy?' },
  { id: '02', label: 'Data',           desc: 'Is your data ready to power AI systems at the quality and scale required?' },
  { id: '03', label: 'Infrastructure', desc: 'Can your systems support AI at production scale, speed, and reliability?' },
  { id: '04', label: 'Talent',         desc: 'Do you have the skills to build, evaluate, deploy, govern, and sustain AI?' },
  { id: '05', label: 'Governance',     desc: 'Can you govern AI responsibly and meet your regulatory obligations?' },
  { id: '06', label: 'Culture',        desc: 'Will your organisation adopt, sustain, and continuously improve AI?' },
]

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className="eyebrow">
              <span className={styles.pulse} aria-hidden="true" />
              SpanForge · Discover Phase
            </span>
            <h1 className={styles.h1}>
              Is your organisation<br />
              <em className="hero-italic hero-red">ready for AI?</em>
            </h1>
            <p className={styles.sub}>
              This assessment measures organisational readiness — not whether a specific
              project is viable, but whether your organisation has the foundational capabilities
              to build and sustain AI at all. 30 questions. 6 dimensions. 150 points.
            </p>
            <div className={styles.heroCta}>
              <Link href="/signin" className="btn-primary">Start the Assessment</Link>
              <Link href="#dimensions" className="btn-ghost">See the Dimensions</Link>
            </div>
            <p className={styles.heroMeta}>Takes 30–45 minutes when completed honestly by a cross-functional team.</p>
          </div>
        </div>
      </section>

      {/* ── Scoring guide ── */}
      <section className={`section-dark ${styles.scoringSection}`}>
        <div className="container">
          <span className="eyebrow">Scoring Guide</span>
          <h2 className={styles.h2}>What your score means</h2>
          <div className={styles.scoringGrid}>
            {[
              { range: '130 – 150', verdict: 'Ready',      colour: styles.verdictReady,      action: 'Proceed to AI projects with confidence.' },
              { range: '105 – 129', verdict: 'Developing', colour: styles.verdictDeveloping,  action: 'AI projects can begin in stronger dimensions with a 90-day readiness plan.' },
              { range: '75 – 104',  verdict: 'Emerging',   colour: styles.verdictEmerging,    action: 'Limit to low-risk experiments. 6–12 months of foundational work required.' },
              { range: 'Below 75',  verdict: 'Not Ready',  colour: styles.verdictNotReady,    action: 'Do not proceed. Build the foundations first.' },
            ].map(s => (
              <div key={s.verdict} className={styles.scoreCard}>
                <span className={`${styles.scoreRange} ${s.colour}`}>{s.range}</span>
                <strong className={`${styles.scoreVerdict} ${s.colour}`}>{s.verdict}</strong>
                <p className={styles.scoreAction}>{s.action}</p>
              </div>
            ))}
          </div>
          <p className={styles.gateNote}>
            The <strong>Discover Gate</strong> requires a minimum score of <strong>90/150</strong> to progress, with no dimension scoring below <strong>12/25</strong>.
          </p>
        </div>
      </section>

      {/* ── Dimensions ── */}
      <section id="dimensions" className={`section-charcoal`}>
        <div className="container">
          <span className="eyebrow">Six Dimensions</span>
          <h2 className={styles.h2}>What we measure</h2>
          <p className={styles.sectionSub}>
            Each dimension contributes 25 points. Five questions per dimension, scored 1–5 based on what is demonstrably true today — not aspirations or plans.
          </p>
          <div className={styles.dimensionsGrid}>
            {DIMENSIONS.map(d => (
              <div key={d.id} className={styles.dimCard}>
                <span className={styles.dimNumber}>{d.id}</span>
                <h3 className={styles.dimLabel}>{d.label}</h3>
                <p className={styles.dimDesc}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`section-dark ${styles.ctaSection}`}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 className={styles.h2}>Ready to assess your organisation?</h2>
            <p className={styles.sub}>
              Sign in with Google or GitHub to create your organisation and start the assessment.
              Invite your cross-functional team to score together.
            </p>
            <Link href="/signin" className="btn-primary">Get Started — It&apos;s Free</Link>
          </div>
        </div>
      </section>
    </>
  )
}
