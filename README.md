# SpanForge AI Organisational Readiness Assessment

A multi-tenant web application that evaluates whether an organisation is ready to invest in and deploy AI at scale. It delivers a structured 150-point scored assessment across six dimensions, an Executive Quick Scan, industry benchmarks, a 90-day roadmap, and a board-ready results page.

---

## Table of Contents

- [Overview](#overview)
- [Assessment Framework](#assessment-framework)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [Key Features](#key-features)
- [API Routes](#api-routes)
- [Scoring Logic](#scoring-logic)
- [Security](#security)
- [Deployment](#deployment)

---

## Overview

The SpanForge AI Readiness Assessment is a v2.1 implementation of the SpanForge framework. Organisations score themselves across six dimensions using a facilitated workshop format (recommended 5–10 participants, 3 hours). Results produce a total score out of 150, a verdict, dimension-level playbooks, and a 90-day action roadmap.

The application supports multiple organisations per deployment (multi-tenant), with role-based access, team invitations, and score history tracking across re-assessments.

---

## Assessment Framework

### Full Assessment — 150 points

30 questions across 6 dimensions, each scored 1–5 by the workshop team.

| # | Dimension | Max Score | Key Question |
|---|-----------|-----------|--------------|
| 1 | Strategy | 25 | Does leadership have a coherent, funded, and committed AI strategy? |
| 2 | Data | 25 | Is your data ready to power AI systems at the quality and scale required? |
| 3 | Infrastructure | 25 | Can your systems support AI at production scale, speed, and reliability? |
| 4 | Talent | 25 | Do you have the skills to build, evaluate, deploy, govern, and sustain AI? |
| 5 | Governance | 25 | Can you govern AI responsibly and meet regulatory obligations? |
| 6 | Culture | 25 | Will your organisation adopt, sustain, and improve AI — or resist and abandon it? |

### Overall Score Bands (v2.1)

| Band | Range | Guidance |
|------|-------|----------|
| Ready | 120–150 | Proceed with confidence. Benchmark against AI leaders in your sector. |
| Developing | 90–119 | AI projects can begin in stronger dimensions. Address gaps within 90 days. |
| Emerging | 75–89 | Targeted readiness work required. Use the dimension playbooks. |
| Nascent | 0–74 | Stop. Build foundations first — do not commit to significant AI investment. |

### Dimension Maturity Bands

Each dimension (scored 0–25) is classified independently:

| Band | Range |
|------|-------|
| Nascent | 0–10 |
| Emerging | 11–17 |
| Operational | 18–22 |
| Leading | 23–25 |

### Executive Quick Scan — 50 points

A 10-question board-level subset (one per dimension pair) scored 1–5 each. Produces a fast readiness signal without the full workshop commitment. Verdicts: Critical gaps (0–29), Developing (30–39), Ready for full assessment (40–50).

### Discover Gate

An organisation clears the Discover Gate when `totalScore >= 90` AND every individual dimension scores `>= 12`. The gate is surfaced on the results page.

### Bonus — AI Economics (unscored)

Three qualitative prompts that test whether AI investment is financially sustainable. A composite score below 8/15 is treated as a programme risk flag.

### Industry Benchmarks

Benchmark ranges are matched automatically from the organisation's industry and size profile:

- Large enterprise (>5,000 employees)
- Mid-market (500–5,000 employees)
- Financial services, Healthcare, Technology, Manufacturing, Government, Professional services, SME

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript (JSX), with `lib/prisma.ts` in TypeScript |
| Auth | Auth.js v5 (`next-auth@5.0.0-beta`) — Google OAuth, JWT sessions |
| ORM | Prisma 5.22 |
| Database | PostgreSQL (Neon serverless, `directUrl` for migrations) |
| Email | Resend (team invitations) |
| Analytics | Vercel Analytics + Speed Insights |
| Styling | CSS Modules + global CSS custom properties |
| Fonts | Playfair Display (headings), DM Sans (body), DM Mono (code/scores) |

---

## Project Structure

```
├── app/
│   ├── layout.js                  # Root layout — fonts, nav, footer, analytics
│   ├── page.js                    # Marketing landing page
│   ├── dashboard/                 # Authenticated home
│   ├── assessments/
│   │   ├── page.js                # Assessment list (grouped by status)
│   │   ├── new/                   # Create full assessment
│   │   ├── quick/                 # Create executive quick scan (not in tree above — see api)
│   │   └── [id]/
│   │       ├── page.js            # Assessment detail / status
│   │       ├── take/              # Assessment wizard (client component)
│   │       └── results/           # Scored results page
│   ├── settings/
│   │   ├── page.js                # Organisation settings
│   │   └── members/               # Team management + invite
│   ├── onboarding/                # First-time org creation
│   ├── invitations/accept/        # Accept email invite
│   └── signin/                    # Sign-in page (Google OAuth)
│
├── components/
│   ├── Nav.jsx                    # Top navigation with org switcher
│   ├── Footer.jsx
│   ├── OrgSwitcher.jsx            # Switch active organisation
│   └── AuthSessionProvider.jsx    # Wraps SessionProvider for client components
│
├── lib/
│   ├── assessment-data.js         # Single source of truth — all questions, benchmarks,
│   │                              #   dimensions, score bands, roadmap, verdicts
│   ├── scoring.js                 # All score computation functions
│   ├── assessment-kind.js         # kind detection helpers (full vs quick_scan)
│   ├── tenant.js                  # Multi-tenant helpers (getActiveOrg, assertOrgAccess)
│   ├── switch-org.js              # Active org cookie management
│   └── prisma.ts                  # Prisma client singleton
│
├── prisma/
│   └── schema.prisma              # Database schema
│
├── auth.js                        # Auth.js v5 config (Google provider, PrismaAdapter)
├── middleware.js                  # Global auth guard + redirect logic
├── next.config.js                 # Security headers, CSP
└── styles/
    ├── globals.css                # CSS custom properties, resets, utility classes
    └── animations.css             # Shared keyframe animations
```

---

## Data Model

### Core Models

**`Organisation`** — the tenant unit. Every assessment belongs to an org.

```
id, name, slug (unique), plan, logoUrl, website, industry, size
```

**`OrganisationMember`** — links a `User` to an `Organisation` with a role (`owner` | `admin` | `member`).

**`Assessment`** — a single scored session.

```
id, orgId, createdById
name, description
kind        String  "full" | "quick_scan"   (default: "full")
status      String  "draft" | "in_progress" | "completed"
totalScore  Int?
completedAt DateTime?
```

**`AssessmentResponse`** — one row per answered question.

```
assessmentId, questionId, dimension, score (1–5), notes
```

**`AssessmentCollaborator`** — additional users who can edit an assessment.

**`Invitation`** — email-based team invitations (token, expires, role).

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech))
- Google OAuth credentials

### Installation

```bash
git clone <repo-url>
cd SFAIOrgReadiness
npm install        # also runs prisma generate via postinstall
```

### Development

```bash
npm run dev        # starts on http://localhost:3000
```

The landing page redirects authenticated users to `/dashboard`. Sign in with Google to create your first organisation.

### Production Build

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (Neon or any PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth.js v5
AUTH_SECRET="your-random-secret-min-32-chars"
AUTH_URL="http://localhost:3000"

# Google OAuth — https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend (email invitations) — https://resend.com/
RESEND_API_KEY="re_xxxx"
RESEND_FROM="SpanForge <invitations@yourdomain.com>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`DATABASE_URL` is used by Prisma at runtime (pooled connection on Neon). `DIRECT_URL` is used by `prisma migrate` (direct connection bypasses the pooler).

---

## Database Setup

```bash
# Apply all migrations to a fresh database
npx prisma migrate deploy

# Or during development — create + apply in one step
npx prisma migrate dev

# Regenerate the Prisma client after schema changes
npx prisma generate

# Open Prisma Studio to inspect data
npx prisma studio
```

### Migration History

| Migration | Change |
|-----------|--------|
| `20260329xxxxxx_init` | Initial schema — all models |
| `20260329144754_add_assessment_kind` | Added `Assessment.kind String @default("full")` |

---

## Authentication

Auth.js v5 with the Prisma adapter and Google OAuth. Sessions use JWT strategy with the user ID, plan, and active org membership attached to the token.

### Protected Routes

All routes except `/`, `/signin`, `/api/auth/*`, and `/invitations/accept` require authentication. This is enforced by `middleware.js` at the edge.

### Multi-Org Support

A user can belong to multiple organisations. The active org is stored in an `sf_active_org` cookie and switched via the `OrgSwitcher` component in the nav. The `getActiveOrg()` helper resolves the active org on every server request.

---

## Key Features

### Assessment Wizard

The `AssessmentWizard` client component (`app/assessments/[id]/take/`) steps through all questions for the assessment kind. Responses are persisted to the API as the user progresses. The wizard is resumable — returning to `/assessments/[id]/take` resumes from the last unanswered question.

### Results Page

The full assessment results page (`/assessments/[id]/results`) renders:

- **Verdict Banner** — overall score, band, and Discover Gate status
- **Overview Cards** — Quick Scan sub-score, benchmark match, SpanForge Platform callout
- **Dimension Scores** — radar chart + maturity bar list with AI Economics cross-reference strips for Strategy, Infrastructure, and Governance
- **Executive Quick Scan** — 10-question board summary derived from responses
- **Industry Benchmarks** — matched benchmark row highlighted, with methodology note and usage tips
- **90-Day Roadmap** — focus dimensions (weakest first) with playbook actions, plus a 3-month task grid
- **Comparison** — delta against the previous assessment (if one exists)
- **AI Economics** — 3 unscored prompts with a risk flag if composite score is below 8/15
- **Full Response Log** — every question, score, and facilitator note
- **Score History** — links to all previous completed assessments for the same org
- **Workshop Facilitation Guide** — participants, duration, scoring rule, conflict resolution
- **Platform Upgrade** — SpanForge platform onboarding steps

### Recommended Usage Path

Before creating a new full assessment, users see a "Before you begin" callout with the recommended 4-step sequence: run today → re-run in 6 months → track improvement → share with board.

### Team Management

Organisation owners and admins can invite team members by email (`/settings/members`). Invitations are sent via Resend and expire after 7 days. The invitee accepts via a tokenised link that works pre- or post-authentication.

### Score History & Re-assessment

The platform stores all completed assessments per org. The results page shows dimension deltas against the previous assessment of the same kind. The recommended re-assessment cadence is every 6 months.

---

## API Routes

All API routes are Next.js Route Handlers under `app/api/`.

| Route | Method | Description |
|-------|--------|-------------|
| `/api/assessments` | GET, POST | List org assessments; create full assessment |
| `/api/assessments/quick` | POST | Create executive quick scan |
| `/api/assessments/[id]` | GET, PATCH, DELETE | Get, update, or delete an assessment |
| `/api/assessments/[id]/responses` | POST | Save question responses |
| `/api/assessments/[id]/complete` | POST | Mark assessment complete, compute total score |
| `/api/assessments/[id]/collaborators` | GET, POST, DELETE | Manage collaborators |
| `/api/organisations` | POST | Create organisation (onboarding) |
| `/api/organisations/current` | GET, PATCH | Get or update the active org |
| `/api/organisations/current/members/[userId]` | PATCH, DELETE | Update member role or remove |
| `/api/invitations` | POST | Send email invitation |
| `/api/invitations/accept` | POST | Accept invitation by token |
| `/api/user/orgs` | GET | List all orgs the current user belongs to |
| `/api/auth/[...nextauth]` | * | Auth.js handler |

---

## Scoring Logic

All computation lives in `lib/scoring.js`. The single source of truth for questions, dimensions, and bands is `lib/assessment-data.js`.

### `computeDimensionScores(responses)`
Returns a map of `dimensionId → { score, count, percent }` for each dimension.

### `computeAssessmentVerdict(assessment)`
Matches the `totalScore` against `VERDICTS` to return the band label, colour, and description.

### `computeQuickScan(responses)`
Extracts the 10 quick-scan question responses from a full assessment and scores them as a sub-total out of 50.

### `getFailureSignals(dimScoresMap)`
Returns any dimensions that breach the critical failure thresholds defined in `FAILURE_SIGNALS`.

### `buildRoadmap(dimScoresMap)`
Returns the 2–3 weakest dimensions with their maturity band and ordered playbook actions, plus the 3-month task grid from `ROADMAP_MONTHS`.

### `getBenchmarksForOrg(org)`
Filters `BENCHMARKS` entries against the org's industry and size, setting `isMatch: true` on the closest benchmark.

### `getScoreGuide(totalScore)`
Returns the `SCORE_GUIDE` entry (v2.1 bands) that brackets the total score.

---

## Security

The `next.config.js` sets the following security headers on every response:

- `Content-Security-Policy` — strict CSP; `unsafe-eval` removed in production
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, mic, geolocation, and topics all denied
- `Strict-Transport-Security` — max-age 63072000 (production only)

Tenant isolation is enforced at the data layer: every API route calls `assertOrgAccess()` before returning or mutating any assessment. Users can only access data belonging to organisations they are members of.

---

## Deployment

The application is designed for deployment on [Vercel](https://vercel.com) with a [Neon](https://neon.tech) PostgreSQL database.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables from the [Environment Variables](#environment-variables) section in the Vercel dashboard. Run `prisma migrate deploy` against the production database before the first deployment.

For the `postinstall` script to run correctly on Vercel, ensure `DATABASE_URL` is set as a build-time environment variable so `prisma generate` can complete during the build step.

