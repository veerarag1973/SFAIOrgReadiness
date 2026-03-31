# SpanForge Design System — Style Guide

> **This is the canonical style guide for all SpanForge apps.**  
> Every app in the SpanForge ecosystem must follow these conventions so the suite feels unified.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color Tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Spacing Scale](#4-spacing-scale)
5. [Layout & Container](#5-layout--container)
6. [Buttons](#6-buttons)
7. [Cards](#7-cards)
8. [Badges & Labels](#8-badges--labels)
9. [Navigation](#9-navigation)
10. [Hero Sections](#10-hero-sections)
11. [Section Patterns](#11-section-patterns)
12. [Breadcrumbs](#12-breadcrumbs)
13. [Footer](#13-footer)
14. [Animations](#14-animations)
15. [Terminal / Code Blocks](#15-terminal--code-blocks)
16. [Accessibility](#16-accessibility)
17. [CSS Architecture Rules](#17-css-architecture-rules)
18. [Naming Conventions](#18-naming-conventions)
19. [Next.js / Font Setup](#19-nextjs--font-setup)

---

## 1. Brand Identity

| Element | Value |
|---|---|
| Product family | **SpanForge** |
| Wordmark structure | `Span` (white) + `Forge` (red) |
| Display font | Playfair Display |
| UI font | DM Sans |
| Mono / code font | DM Mono |
| Tagline | *"Where Enterprise AI Goes to Production"* |
| Five lifecycle phases | Discover · Design · Build · Govern · Scale |

The wordmark is always rendered as two adjacent spans with no space — `<span>Span</span><span style="color:var(--red)">Forge</span>` — using `font-family: var(--font-playfair)`, `font-weight: 700`.

A small monospace sub-label (e.g., `"The AI Lifecycle Platform"`) can optionally sit beneath the logo at `font-size: 0.58–0.6rem`, `color: var(--mid)`, `letter-spacing: 0.08em`.

---

## 2. Color Tokens

Paste the entire `:root` block into `styles/globals.css` for every SpanForge app.

```css
:root {
  /* ── Brand palette ── */
  --red:       #C0392B;   /* primary action, active indicators, accents */
  --red-light: #E8574A;   /* hover state for red elements */
  --red-dim:   #7B2218;   /* subtle red backgrounds / glows */

  /* ── Neutral backgrounds ── */
  --dark:      #111318;   /* page background */
  --charcoal:  #1A1F2E;   /* footer, secondary background */
  --surface:   #1E2330;   /* card / panel background */
  --surface-2: #252B3A;   /* elevated card, tab bar, code chrome */

  /* ── Text & borders ── */
  --rule:      #2A3145;   /* dividers, borders */
  --mid:       #64748B;   /* secondary labels, icon strokes */
  --muted:     #94A3B8;   /* body copy, descriptions */
  --light:     #F1F5F9;   /* primary text on dark */
  --white:     #FFFFFF;   /* high-emphasis text, button labels */

  /* ── Phase accent colours ── */
  --discover:  #1A5276;
  --design:    #145A32;
  --build:     #784212;
  --govern:    #4A235A;
  --scale:     #7B2218;
}
```

### How to use colors

| Use case | Token |
|---|---|
| Page background | `--dark` |
| Card / panel | `--surface` |
| Elevated panel / hover state | `--surface-2` |
| Footer background | `--charcoal` |
| Dividers / borders | `--rule` |
| Body text | `--muted` |
| Headings / primary text | `--light` or `--white` |
| High-emphasis headlines | `--white` |
| Secondary labels | `--mid` |
| Eyebrows, red accents | `--red` |
| Hover on red | `--red-light` |

**Never hard-code hex values** in component files. Always reference a token.

---

## 3. Typography

### Font faces

```js
// Next.js layout.js — import all three
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair',
  display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})
```

Apply all three variables to the `<html>` or `<body>` tag via `className`.

### Type roles

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Page H1 (hero) | Playfair Display | 900 | `clamp(2.5rem, 5vw, 4rem)` | Italic variant for emphasis words |
| Section H1 | Playfair Display | 900 | `clamp(2rem, 4vw, 3rem)` | line-height 1.1 |
| Section H2 | Playfair Display | 700 | `clamp(1.6rem, 3vw, 2.2rem)` | |
| Phase label | DM Mono | 500 | `clamp(1.6rem, 3.5vw, 2.6rem)` | letter-spacing 0.06em |
| Card title | DM Mono | 600 | `0.95rem` | |
| Blog post title | Playfair Display | 700 | `1.2rem` | line-height 1.35 |
| Body copy | DM Sans | 400 | `0.875–1.05rem` | line-height 1.6–1.75 |
| Secondary copy | DM Sans | 400 | `0.8–0.82rem` | color `--muted` |
| Eyebrow | DM Mono | 400 | `0.72rem` | uppercase, letter-spacing 0.18em, color `--red` |
| Nav link | DM Sans | 500 | `0.88rem` | color `--muted`, active `--white` |
| Footer column head | DM Mono | 400 | `0.7rem` | uppercase, letter-spacing 0.15em, color `--red` |
| Meta / mono labels | DM Mono | 400 | `0.68–0.78rem` | |

### Type patterns

**Eyebrow** — appears above section headings to label the content topic:
```css
.eyebrow {
  display: block;
  font-family: var(--font-dm-mono, 'DM Mono', monospace);
  font-size: 0.72rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--red);
  margin-bottom: 0.75rem;
}
```

**Italic emphasis in headlines** — use `<em>` or a `<span class="italic">` inside a Playfair `font-weight: 400` for contrast:
```css
.heroItalic { font-style: italic; font-weight: 400; }
.heroRed    { color: var(--red); }
```

---

## 4. Spacing Scale

All spacing uses a **4px base unit**. Reference these tokens instead of arbitrary `px`/`rem` values.

```css
--s-1:   4px;   /* tight internal spacing */
--s-2:   8px;
--s-3:  12px;
--s-4:  16px;
--s-5:  24px;
--s-6:  32px;
--s-8:  48px;
--s-10: 64px;
--s-14: 112px;
--s-20: 160px;
```

**Section vertical padding:** `80px 0` (dark sections) or `80px 0` (charcoal sections).  
**Hero vertical padding:** `140px 0 100px` (home), `56–60px 0 80px` (inner pages).

---

## 5. Layout & Container

```css
:root {
  --max-width:    1200px;
  --side-padding: 2rem;   /* 1.25rem on mobile ≤600px */
}

.container {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--side-padding);
}
```

### Common grid patterns

| Pattern | CSS |
|---|---|
| Two-col hero | `grid-template-columns: 1fr 400px; gap: 5rem` |
| Footer columns | `grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 3rem` |
| Phase row | `grid-template-columns: 280px 1fr 28px; gap: 2rem` |

Always collapse to a single column at `≤700px` or `≤768px` breakpoints.

---

## 6. Buttons

### Primary button

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 1.5rem;
  background: var(--red);
  color: var(--white);
  font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  border: none;
  transition: background 0.2s, transform 0.2s;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  gap: 0.5rem;
}
.btn-primary:hover    { background: var(--red-light); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
```

### Ghost button

```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 1.5rem;
  background: transparent;
  color: var(--white);
  font-family: var(--font-dm-sans, 'DM Sans', sans-serif);
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
  transition: background 0.2s, transform 0.2s;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  gap: 0.5rem;
}
.btn-ghost:hover    { background: var(--surface); transform: translateY(-1px); }
.btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
```

**Rules:**
- Minimum touch target: `48px` height (`min-height`, not `height`)
- Always pair primary + ghost in CTA groups with `display: flex; gap: 1rem; flex-wrap: wrap`
- Never use a red ghost button — ghost is always neutral
- Include `gap: 0.5rem` on buttons that contain an icon alongside text

---

## 7. Cards

All cards share a common base:

```css
/* Base card */
background: var(--surface);
border: 1px solid var(--rule);
border-radius: 4px;          /* tools, tight UI */
/* or */
border-radius: 6px;          /* blog, phase rows */
/* or */
border-radius: 8px;          /* trust / softer layouts */
padding: 1.5rem;
transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
```

### Red top-bar hover effect (tool & blog cards)

```css
.card { position: relative; }
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--red);
  opacity: 0;                     /* tool card — fade in */
  /* or: transform: scaleX(0);    blog card — slide in */
  border-radius: 4px 4px 0 0;
  transition: opacity 0.2s;
}
.card:hover::before { opacity: 1; /* or: transform: scaleX(1); */ }
```

### Phase row (interactive list item)

```css
.row {
  display: grid;
  grid-template-columns: 280px 1fr 28px;
  gap: 2rem;
  align-items: center;
  padding: 1.5rem 2rem;
  border: 1px solid var(--rule);
  border-radius: 6px;
  transition: transform 0.2s, border-color 0.2s, background 0.2s;
}
.row:hover {
  transform: translateX(4px);
  border-color: var(--red);
  background: var(--surface);
}
```

### Locked / disabled card state

```css
.locked {
  opacity: 0.35;
  cursor: not-allowed;
  user-select: none;
}
.locked:hover { background: var(--surface); /* no lift, no accent bar */ }
```

---

## 8. Badges & Labels

### Assessment dimension badge

Each assessment dimension has a corresponding badge color. Use these when labeling question groups, results, or any dimensional UI:

```css
.badge {
  display: inline-block;
  font-family: var(--font-dm-mono, 'DM Mono', monospace);
  font-size: 0.65rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
}

/* Dimension variants — match the phase colour palette */
.badge-strategy   { background: rgba(26,82,118,0.35);    color: #5DADE2; }
.badge-data       { background: rgba(20,90,50,0.35);     color: #58D68D; }
.badge-infra      { background: rgba(120,66,18,0.35);    color: #F0A500; }
.badge-talent     { background: rgba(74,35,90,0.35);     color: #AF7AC5; }
.badge-governance { background: rgba(123,34,24,0.35);    color: #EC7063; }
.badge-culture    { background: rgba(100,116,139,0.2);   color: #94A3B8; }
```

### Verdict color states

Verdict labels in results pages use these utility classes:

```css
.verdict-ready      { color: #58D68D; }   /* ≥ 120 / 150 */
.verdict-developing { color: #F0A500; }   /* 90–119 */
.verdict-emerging   { color: #F39C12; }   /* 75–89 */
.verdict-not-ready  { color: var(--red-light); }  /* < 75 */
```

Apply directly on the verdict label element — they are global utilities defined in `globals.css`.

### Footer section headers / column labels

```css
/* Monospace, uppercase, red — labels hierarchy in nav columns */
font-family: var(--font-dm-mono);
font-size: 0.7rem;
text-transform: uppercase;
letter-spacing: 0.15em;
color: var(--red);
```

---

## 9. Navigation

- **Height:** `64px`, `position: fixed`, `z-index: 100`
- **Default state:** transparent background, no border
- **Scrolled state:** `background: rgba(17,19,24,0.92)`, `backdrop-filter: blur(12px)`, `border-bottom: 1px solid var(--rule)`
- **Nav links:** DM Sans 500, `0.88rem`, color `--muted`; hover + active → `--white`
- **Active indicator:** `2px` bottom border using `--red`, `position: absolute; bottom: 0`
- **Logo:** `font-family: var(--font-playfair)`, `font-size: 1.35rem`, `font-weight: 700`
  - `Span` → `--white`, `Forge` → `--red`
  - Optional sub-label hidden below `900px`
- **Mobile breakpoint:** collapse links below `900px`, show hamburger menu

---

## 10. Hero Sections

### Home page hero

```css
.hero {
  padding: 140px 0 100px;
  background: var(--dark);
  background-image:
    radial-gradient(ellipse 800px 600px at 60% 40%, rgba(192,57,43,0.06) 0%, transparent 70%);
}
```

- H1: `clamp(2.5rem, 5vw, 4rem)`, Playfair 900, `--white`, line-height 1.1
- Sub-copy: `1.05rem`, DM Sans, `--muted`, line-height 1.7
- A live-pulse red dot (`8px`, border-radius `50%`, `animation: pulseRed`) can precede the eyebrow

### Inner page / product hero

```css
.hero {
  padding: 56px 0 80px;
  background: var(--dark);
  background-image:
    radial-gradient(ellipse 700px 400px at 75% 40%, rgba(192,57,43,0.06) 0%, transparent 70%);
}
```

- Label: DM Mono, `0.75rem`, uppercase, letter-spacing `0.14em`, `--red`
- H1: `clamp(2rem, 4vw, 3rem)`, Playfair 900, `--white`, max-width `700px`
- Sub: `1.05rem`, `--muted`, line-height 1.75, max-width `600px`

### Phase hero (numbered)

```css
.phaseNum {
  font-family: var(--font-playfair);
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  color: var(--phase-color);   /* set via inline style */
}
.phaseLabel {
  font-family: var(--font-dm-mono);
  font-size: clamp(1.6rem, 3.5vw, 2.6rem);
  font-weight: 500;
  letter-spacing: 0.06em;
}
```

---

## 11. Section Patterns

### Dark section (alternating)

```css
.sectionDark {
  padding: 80px 0;
  background: var(--dark);
  border-top: 1px solid var(--rule);
}
```

### Charcoal section (alternating)

```css
.sectionCharcoal {
  padding: 80px 0;
  background: var(--charcoal);
  border-top: 1px solid var(--rule);
}
```

**Alternate** `--dark` and `--charcoal` for visual rhythm. Never use two identical backgrounds in a row unless separated by a strong rule or image.

### Section head pattern

```html
<span class="eyebrow">Section Label</span>
<h2>Section Headline</h2>
<p>Supporting copy…</p>
```

---

## 12. Breadcrumbs

```css
.breadcrumb {
  padding: 1.25rem 0 0;
  background: var(--dark);
}
.breadcrumbLink {
  font-family: var(--font-dm-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  color: var(--mid);
  text-decoration: none;
  transition: color 0.15s;
}
.breadcrumbLink:hover { color: var(--light); }
.breadcrumbSep { color: var(--rule); margin: 0 0.5rem; }
.breadcrumbCurrent {
  font-family: var(--font-dm-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  color: var(--muted);
}
```

---

## 13. Footer

Structure: `--charcoal` background, `border-top: 1px solid var(--rule)`.

```
[Brand column 1.6fr] [Nav col 1fr] [Nav col 1fr] [Nav col 1fr]
─────────────────────────────────────────────────────────────
Copyright                                          LinkedIn icon
```

- Column headers: DM Mono, `0.7rem`, uppercase, `--red`
- Column links: DM Sans, `0.82rem`, `--mid` → hover `--light`
- Brand tagline: DM Sans, `0.82rem`, `--mid`
- URL / sub info: DM Mono, `0.75rem`, `--mid`
- Collapse to single column on mobile (`≤768px`)

---

## 14. Animations

Import `styles/animations.css` into every app's global stylesheet.

### Keyframes

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulseRed {
  0%, 100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.6); }
  50%       { box-shadow: 0 0 0 6px rgba(192,57,43,0); }
}
```

### Utility classes

```css
.fade-up   { animation: fadeUp 0.7s ease forwards; opacity: 0; }
.fade-up-1 { animation: fadeUp 0.7s ease 0.1s forwards; opacity: 0; }
.fade-up-2 { animation: fadeUp 0.7s ease 0.2s forwards; opacity: 0; }
.fade-up-3 { animation: fadeUp 0.7s ease 0.3s forwards; opacity: 0; }
.fade-up-4 { animation: fadeUp 0.7s ease 0.4s forwards; opacity: 0; }

.pulse-red { animation: pulseRed 2s infinite; }

/* Scroll reveal — toggled by IntersectionObserver */
.reveal           { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
.reveal.is-visible { opacity: 1; transform: translateY(0); }
```

### Reduced motion

**Always** include this:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transform: none !important;
  }
}
```

### Transition conventions

| Element | Duration | Easing |
|---|---|---|
| Color, background, border | `0.2s` | `ease` |
| Transform (lift, slide) | `0.2s` | `ease` |
| Scroll reveal | `0.5s` | `ease` |
| Intro fade-up | `0.7s` | `ease` |
| Nav background on scroll | `0.3s` | (default) |

---

## 15. Terminal / Code Blocks

Use the `TerminalMock` component pattern for all code demonstrations.

```
┌─ Tab bar (--dark bg, monospace 0.72rem, --muted text) ─┐
├─ Chrome bar (--surface-2, three colored dots) ──────────┤
└─ Body (--surface, padding 1.5rem, DM Mono 0.78rem) ─────┘
```

- Outer: `background: var(--surface)`, `border: 1px solid var(--rule)`, `border-radius: 6px`
- Active tab: `background: var(--surface)`, bottom border matches surface to create tab merge effect
- Code lines: `font-size: 0.78rem`, `line-height: 1.7`, `white-space: pre`
- Comments: `color: var(--muted)`, `opacity: 0.45`, `font-size: 0.75rem`
- Divider lines within code: `height: 1px; background: var(--rule)`
- Colored dots: close `#FF5F57`, minimize `#FEBC2E`, expand `#28C840`

---

## 16. Accessibility

### Focus styles

```css
:focus-visible {
  outline: 3px solid rgba(232, 87, 74, 0.95);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px rgba(232, 87, 74, 0.18);
}
```

The outer glow (`box-shadow`) improves visibility on dark surfaces — do not drop it.

### Skip link

```css
.skip-to-content {
  position: absolute;
  top: -100%;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: var(--red);
  color: var(--white);
  font-weight: 600;
  border-radius: 4px;
  z-index: 9999;
  transition: top 0.2s;
}
.skip-to-content:focus { top: 1rem; }
```

- Place `<a href="#main-content" class="skip-to-content">Skip to content</a>` as the **first child** of `<body>`
- All interactive elements must be reachable by keyboard
- Icon-only buttons must have `aria-label`
- Min contrast ratio: 4.5:1 for body text, 3:1 for large text

---

## 17. CSS Architecture Rules

1. **Design tokens** live in `styles/globals.css` `:root`. Never repeat them in component files.
2. **Component styles** use **CSS Modules** (`.module.css`). No styled-components, no inline styles except data-driven values (`color: var(--phase-color)` set via `style` prop).
3. **Global utility classes** (`btn-primary`, `container`, `eyebrow`, `badge`, `fade-up`, `section-dark`, `section-charcoal`, `verdict-*`, `spinner`, etc.) are defined in `globals.css` and `animations.css` only. Note: global classes use **kebab-case**; CSS Module classes use **camelCase**.
4. **No magic numbers.** Use spacing tokens, or document the exception with a comment.
5. Breakpoints:
   - **Mobile base**: `≤600px` — adjust `--side-padding` to `1.25rem`
   - **Layout collapse**: `≤700px` — collapse multi-col grids
   - **Nav collapse**: `<900px` — hide desktop links, show hamburger
   - **Desktop min**: `≥900px` — full multi-column layouts

### App-shell layout pattern

All apps use an `app-shell` flex wrapper so the footer always sticks to the bottom:

```css
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-shell-main {
  flex: 1;
  padding-top: 64px;  /* offset for fixed nav */
}
```

In `layout.js`:
```jsx
<body>
  <AuthSessionProvider>
    <div className="app-shell">
      <Nav />
      <main id="main-content" className="app-shell-main">
        {children}
      </main>
      <Footer />
    </div>
  </AuthSessionProvider>
  <Analytics />
  <SpeedInsights />
</body>
```

### Spinner (loading state)

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--rule);
  border-top-color: var(--red);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

Use the `.spinner` global class inline when an async action is pending (e.g. form submit, API call). Never build per-component spinners.

---

## 18. Naming Conventions

### CSS Module class names

Use **camelCase** for all CSS Module selectors:

| Pattern | Example |
|---|---|
| Element wrapper | `.card`, `.row`, `.hero`, `.section` |
| Modifier state | `.cardHover`, `.locked`, `.scrolled`, `.active` |
| Sub-element | `.cardTitle`, `.heroH1`, `.navLink` |
| Variant suffix | `.sectionDark`, `.sectionCharcoal` |

### CSS variable names

All custom properties use `--kebab-case`. Group by category prefix:
- Colors: `--red`, `--surface`, `--dark`, `--muted`
- Spacing: `--s-4`, `--s-8`
- Fonts: `--font-playfair`, `--font-dm-sans`, `--font-dm-mono`
- Layout: `--max-width`, `--side-padding`
- Phase colors: `--discover`, `--design`, `--build`, `--govern`, `--scale`

### Component files

```
components/
  ComponentName.jsx         — the component
  ComponentName.module.css  — scoped styles for that component
```

### Page-level styles

```
app/
  pageName/
    page.js
    page.module.css         — layout and section styles for that route
```

---

## 19. Next.js / Font Setup

Reference `layout.js`:

```js
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import '../styles/globals.css'
import '../styles/animations.css'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400','700','900'], variable: '--font-playfair', display: 'swap' })
const dmSans   = DM_Sans({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-dm-sans', display: 'swap' })
const dmMono   = DM_Mono({ subsets: ['latin'], weight: ['400','500'], variable: '--font-dm-mono', display: 'swap' })

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <Nav />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### Shared files to copy into every new SpanForge app

```
styles/
  globals.css       ← full token + utility class file
  animations.css    ← keyframes + utility animation classes
components/
  Nav.jsx + Nav.module.css
  Footer.jsx + Footer.module.css
```

Customize Nav links and Footer columns per-app; keep all tokens and class names identical.

---

## Quick Reference Card

```
Backgrounds  dark #111318 · charcoal #1A1F2E · surface #1E2330 · surface-2 #252B3A
Accents      red #C0392B · red-light #E8574A
Text         white #FFF · light #F1F5F9 · muted #94A3B8 · mid #64748B
Borders      rule #2A3145

Fonts        Playfair Display (headlines) · DM Sans (body) · DM Mono (code, labels, eyebrows)

Buttons      min-h=48px · border-radius 8px · primary=red · ghost=transparent+rule border · gap=0.5rem
Cards        surface bg · rule border · radius 4–8px · red top-bar on hover
Eyebrow      dm-mono 0.72rem · uppercase · letter-spacing 0.18em · color red
Sections     80px vertical padding · alt dark/charcoal · border-top rule

Hero glow    radial-gradient(ellipse at 60–75%, rgba(192,57,43,0.06), transparent 70%)
Transition   0.2s ease (most) · 0.5s ease (reveals) · 0.7s ease (intros)

Verdicts     ready=#58D68D · developing=#F0A500 · emerging=#F39C12 · not-ready=red-light
Dimension badges  strategy=#5DADE2 · data=#58D68D · infra=#F0A500 · talent=#AF7AC5 · governance=#EC7063 · culture=#94A3B8
Layout       app-shell(flex col min-h-100vh) · app-shell-main(flex:1 pt=64px)
```
