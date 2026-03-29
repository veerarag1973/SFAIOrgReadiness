'use client'
// app/assessments/[id]/results/RadarChart.jsx
// Pure SVG spider chart — no external charting libraries
import { useMemo } from 'react'
import styles from './page.module.css'

const SIZE   = 280
const CENTER = SIZE / 2
const RADIUS = 100
const LEVELS = 5

function polarToXY(angle, r) {
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  }
}

export default function RadarChart({ data }) {
  const n = data.length
  if (n < 3) return null

  const angles = data.map((_, i) => (360 / n) * i)

  const points = useMemo(
    () =>
      data.map((d, i) => {
        const pct = d.score / d.max
        return polarToXY(angles[i], RADIUS * pct)
      }),
    [data, angles]
  )

  const gridLines = Array.from({ length: LEVELS }, (_, li) => {
    const r = (RADIUS / LEVELS) * (li + 1)
    return angles.map((a) => polarToXY(a, r)).map(({ x, y }) => `${x},${y}`).join(' ')
  })

  const polyPoints = points.map(({ x, y }) => `${x},${y}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={styles.radar}
      aria-label="Radar chart showing dimension scores"
      role="img"
    >
      {/* Grid level polygons */}
      {gridLines.map((pts, li) => (
        <polygon key={li} points={pts} fill="none" stroke="var(--rule)" strokeWidth="1" />
      ))}

      {/* Axis lines */}
      {angles.map((angle, i) => {
        const end = polarToXY(angle, RADIUS)
        return <line key={i} x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} stroke="var(--rule)" strokeWidth="1" />
      })}

      {/* Score polygon */}
      <polygon points={polyPoints} fill="rgba(192,57,43,0.15)" stroke="var(--red)" strokeWidth="2" />

      {/* Score dots */}
      {points.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={data[i].color ?? 'var(--red)'} />
      ))}

      {/* Labels */}
      {angles.map((angle, i) => {
        const labelR = RADIUS + 22
        const pos    = polarToXY(angle, labelR)
        const anchor =
          Math.abs(pos.x - CENTER) < 10 ? 'middle' : pos.x < CENTER ? 'end' : 'start'
        return (
          <text
            key={i}
            x={pos.x}
            y={pos.y + 4}
            textAnchor={anchor}
            fill="var(--muted)"
            fontSize="9"
            fontFamily="var(--font-dm-mono, monospace)"
          >
            {data[i].dimension.split(' ')[0]}
          </text>
        )
      })}

      {/* Score labels on dots */}
      {points.map(({ x, y }, i) => (
        <text
          key={`s${i}`}
          x={x}
          y={y - 7}
          textAnchor="middle"
          fill="var(--white)"
          fontSize="8.5"
          fontFamily="var(--font-dm-mono, monospace)"
        >
          {data[i].score}
        </text>
      ))}
    </svg>
  )
}
