# SpanForge AI Organisational Readiness Assessment — Implementation Plan

> **App codename:** `sf-ai-org-readiness`  
> **Suite:** SpanForge platform (getspanforge.com)  
> **Discover Phase Tool** — evaluates whether an organisation has the foundational capability to build and sustain AI at enterprise scale.

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Auth & Access Flow](#2-auth--access-flow)
3. [Multi-Tenant Architecture](#3-multi-tenant-architecture)
4. [Database Schema](#4-database-schema)
5. [Directory Structure](#5-directory-structure)
6. [Routes & Pages](#6-routes--pages)
7. [API Routes](#7-api-routes)
8. [Middleware — Auth Guard](#8-middleware--auth-guard)
9. [Core Features](#9-core-features)
10. [Key Components](#10-key-components)
11. [Assessment Data Layer](#11-assessment-data-layer)
12. [Scoring Logic](#12-scoring-logic)
13. [Environment Variables](#13-environment-variables)
14. [Implementation Phases](#14-implementation-phases)

---

## 1. App Overview

### What it does

The AI Organisational Readiness Assessment is a structured scoring tool that measures whether an organisation has the foundational capabilities to build, deploy, and govern AI at enterprise scale. It is a **Discover Phase** instrument — used before any significant AI investment is committed.

### Assessment structure

| # | Dimension | Questions | Max Score |
|---|---|---|---|
| 1 | Strategy | Q1–Q5 | 25 |
| 2 | Data | Q6–Q10 | 25 |
| 3 | Infrastructure | Q11–Q15 | 25 |
| 4 | Talent | Q16–Q20 | 25 |
| 5 | Governance | Q21–Q25 | 25 |
| 6 | Culture | Q26–Q30 | 25 |
| — | **TOTAL** | **30 questions** | **150** |

### Scoring verdicts

| Score Range | Verdict | Action |
|---|---|---|
| 130–150 | **Ready** | Proceed to AI projects with confidence |
| 105–129 | **Developing** | Begin in stronger dimensions; build 90-day readiness plan |
| 75–104 | **Emerging** | Limit to low-risk experiments; 6–12 months foundational work |
| Below 75 | **Not Ready** | Do not proceed; build foundations first |

**Discover Gate:** minimum 90/150 overall, with no individual dimension below 12/25.

### Intended users

- C-suite and board members sponsoring AI programmes
- AI leads, CDOs, CTOs
- Cross-functional assessment teams (data, legal, HR, engineering, business)
- SpanForge consultants running readiness workshops for clients

---

## 2. Auth & Access Flow

### Rule

Every page in this app (except the public landing page) is protected. An unauthenticated user is **always** redirected to the SpanForge sign-in page.

### Flow diagram

```
User visits any URL in the app
        │
        ▼
  Next.js middleware runs
        │
        ├─ Has valid session? ──► Yes ──► Proceed to requested page
        │
        └─ No session ──► redirect to /signin?callbackUrl=<original-url>
                                │
                                ▼
                     SpanForge sign-in page
                     (Google OAuth / GitHub OAuth)
                                │
                            Signs in
                                │
                                ▼
                   callbackUrl returns user to
                   the originally requested page
                                │
                                ▼
                 Has org membership? ──► Yes ──► Dashboard
                                │
                               No
                                │
                                ▼
                         /onboarding
                   (create or join an org)
```

### Sign-in page

The `/signin` page follows the pattern in TECHNICAL-GUIDE.md §6 exactly:

- Server Component — calls `await auth()` first
- If already signed in, redirect to `/dashboard`
- Renders OAuth buttons (Google primary, GitHub secondary)
- Styled with SpanForge design tokens (dark background, red accents)
- `callbackUrl` is preserved through the OAuth round-trip via the `redirectTo` parameter

### Session data exposed to client

Auth.js `session` callback must expose:

```js
session.user.id        // cuid — used for all DB queries
session.user.plan      // free | pro | enterprise
session.user.orgId     // active org (set after onboarding)
session.user.orgRole   // owner | admin | member
session.user.orgSlug   // for URL construction
```

`orgId`, `orgRole`, and `orgSlug` are populated by querying `OrganisationMember` in the `session` callback and attaching them to the session object.

---

## 3. Multi-Tenant Architecture

### Tenant model

Each **Organisation** is a tenant. One user account can belong to multiple organisations (e.g., a SpanForge consultant working across client organisations). The currently active organisation is tracked in the session.

### Tenancy principles

| Principle | Implementation |
|---|---|
| **Data isolation** | Every DB query is scoped with `orgId`. No cross-org data leakage is possible. |
| **Row-level scoping** | All `Assessment`, `AssessmentResponse`, and `DimensionScore` records carry `orgId` as a direct foreign key. |
| **Role-based access** | Three roles per org: `owner`, `admin`, `member`. Destructive actions (delete assessment, remove member) require `admin` or `owner`. |
| **Org switching** | Session stores `activeOrgId`. An `OrgSwitcher` component lets users with multiple org memberships switch context without re-authenticating. |
| **Slug-based routing** | Each org has a `slug` (e.g., `acme-corp`) used in display but not in API routing (internal `orgId` cuid is used for all DB calls). |
| **Invitation system** | `Invitation` records with time-limited signed tokens allow org owners/admins to add team members by email. |
| **Plan tiers** | Orgs have a `plan` field (`free`, `pro`, `enterprise`). Feature gating is handled server-side by checking `org.plan`. |

### Plan feature matrix (initial)

| Feature | Free | Pro | Enterprise |
|---|---|---|---|
| Assessments per org | 1 | Unlimited | Unlimited |
| Collaborators per assessment | 1 | 5 | Unlimited |
| Assessment history & trend | ✗ | ✓ | ✓ |
| PDF export | ✗ | ✓ | ✓ |
| Custom org branding | ✗ | ✗ | ✓ |
| Priority support | ✗ | ✗ | ✓ |

---

## 4. Database Schema

Stack: **Neon PostgreSQL + Prisma** (as per TECHNICAL-GUIDE.md §5). All IDs use `cuid()`. All models carry `createdAt`/`updatedAt`. All foreign keys use `onDelete: Cascade`.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ──────────────────────────────────────────────────────────────────────────────
// AUTH.JS REQUIRED MODELS
// ──────────────────────────────────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  plan          String    @default("free")       // personal plan tier
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Auth.js relations
  accounts      Account[]
  sessions      Session[]

  // App relations
  orgMembers    OrganisationMember[]
  assessments   Assessment[]           @relation("AssessmentCreatedBy")
  responses     AssessmentResponse[]
  collaborations AssessmentCollaborator[]
  invitations   Invitation[]           @relation("InvitedBy")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// ──────────────────────────────────────────────────────────────────────────────
// MULTI-TENANT ORGANISATION MODELS
// ──────────────────────────────────────────────────────────────────────────────

model Organisation {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique                   // url-safe identifier, e.g. "acme-corp"
  plan      String   @default("free")          // free | pro | enterprise
  logoUrl   String?
  website   String?
  industry  String?
  size      String?                            // 1-50 | 51-200 | 201-1000 | 1000+
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members     OrganisationMember[]
  assessments Assessment[]
  invitations Invitation[]
}

model OrganisationMember {
  id        String   @id @default(cuid())
  orgId     String
  userId    String
  role      String   @default("member")        // owner | admin | member
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  org  Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([orgId, userId])
  @@index([userId])
}

// ──────────────────────────────────────────────────────────────────────────────
// ASSESSMENT MODELS
// ──────────────────────────────────────────────────────────────────────────────

model Assessment {
  id          String    @id @default(cuid())
  orgId       String
  createdById String
  name        String    @default("AI Readiness Assessment")
  description String?
  status      String    @default("draft")      // draft | in_progress | completed
  totalScore  Int?                             // 0-150, null until completed
  verdict     String?                          // ready | developing | emerging | not_ready
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  org           Organisation            @relation(fields: [orgId], references: [id], onDelete: Cascade)
  createdBy     User                    @relation("AssessmentCreatedBy", fields: [createdById], references: [id])
  responses     AssessmentResponse[]
  dimensionScores DimensionScore[]
  collaborators AssessmentCollaborator[]

  @@index([orgId])
  @@index([orgId, status])
}

model AssessmentResponse {
  id           String   @id @default(cuid())
  assessmentId String
  questionId   String                          // "Q1" – "Q30"
  dimension    String                          // strategy|data|infrastructure|talent|governance|culture
  score        Int                             // 1-5
  notes        String?  @db.Text              // optional team discussion notes
  respondentId String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  assessment Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  respondent User       @relation(fields: [respondentId], references: [id])

  @@unique([assessmentId, questionId])        // one score per question per assessment
  @@index([assessmentId])
  @@index([assessmentId, dimension])
}

model DimensionScore {
  id           String   @id @default(cuid())
  assessmentId String
  dimension    String                          // strategy|data|infrastructure|talent|governance|culture
  score        Int                             // 0-25
  maxScore     Int      @default(25)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  assessment Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  @@unique([assessmentId, dimension])
  @@index([assessmentId])
}

model AssessmentCollaborator {
  id           String    @id @default(cuid())
  assessmentId String
  userId       String
  invitedAt    DateTime  @default(now())
  joinedAt     DateTime?

  assessment Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([assessmentId, userId])
  @@index([assessmentId])
}

// ──────────────────────────────────────────────────────────────────────────────
// INVITATION MODEL
// ──────────────────────────────────────────────────────────────────────────────

model Invitation {
  id          String    @id @default(cuid())
  orgId       String
  email       String                          // invitee email
  role        String    @default("member")    // owner | admin | member
  token       String    @unique @default(cuid())  // time-limited acceptance token
  invitedById String
  acceptedAt  DateTime?
  expiresAt   DateTime                        // 7 days from creation
  createdAt   DateTime  @default(now())

  org       Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
  invitedBy User         @relation("InvitedBy", fields: [invitedById], references: [id])

  @@index([orgId])
  @@index([token])
  @@index([email])
}
```

### Schema notes

- `Assessment.status` drives UI state: `draft` → not yet started, `in_progress` → partially completed, `completed` → all 30 questions answered and scores calculated.
- `AssessmentResponse` has a `@@unique([assessmentId, questionId])` constraint — one canonical score per question per assessment. Updates replace, they do not append.
- `DimensionScore` is computed and stored when an assessment is marked complete (not recalculated on every read).
- `Invitation.token` is used in the accept link: `/invitations/accept?token=<cuid>`. Time-boxed to 7 days via `expiresAt`.

---

## 5. Directory Structure

Following conventions from TECHNICAL-GUIDE.md §3. No TypeScript in app code; `lib/prisma.ts` remains `.ts`.

```
sf-ai-org-readiness/
├── app/
│   ├── layout.js                          ← Root layout: fonts, Nav, Footer, providers
│   ├── page.js                            ← Public landing page / smart redirect
│   ├── not-found.js
│   ├── opengraph-image.jsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.js     ← Auth.js handler
│   │   ├── organisations/
│   │   │   └── route.js                   ← POST: create org
│   │   ├── assessments/
│   │   │   ├── route.js                   ← GET: list, POST: create
│   │   │   └── [id]/
│   │   │       ├── route.js               ← GET: detail, PATCH: update, DELETE
│   │   │       ├── responses/
│   │   │       │   └── route.js           ← GET: all responses, POST/PUT: upsert score
│   │   │       ├── complete/
│   │   │       │   └── route.js           ← POST: finalise, compute scores, set verdict
│   │   │       └── collaborators/
│   │   │           └── route.js           ← GET/POST/DELETE collaborators
│   │   └── invitations/
│   │       ├── route.js                   ← POST: send invitation
│   │       └── accept/route.js            ← POST: accept invitation via token
│   │
│   ├── signin/
│   │   ├── page.js
│   │   └── page.module.css
│   │
│   ├── onboarding/
│   │   ├── page.js                        ← Create new org or join via invite
│   │   └── page.module.css
│   │
│   ├── dashboard/
│   │   ├── page.js                        ← Org home: assessment overview, recent activity
│   │   └── page.module.css
│   │
│   ├── assessments/
│   │   ├── page.js                        ← All assessments list
│   │   ├── page.module.css
│   │   ├── new/
│   │   │   ├── page.js                    ← Create assessment form
│   │   │   └── page.module.css
│   │   └── [id]/
│   │       ├── page.js                    ← Assessment overview & status
│   │       ├── page.module.css
│   │       ├── take/
│   │       │   ├── page.js                ← The question-by-question scoring flow
│   │       │   └── page.module.css
│   │       └── results/
│   │           ├── page.js                ← Scores, radar chart, verdict, recommendations
│   │           └── page.module.css
│   │
│   ├── settings/
│   │   ├── page.js                        ← Org profile settings
│   │   ├── page.module.css
│   │   └── members/
│   │       ├── page.js                    ← Member management, invite flow
│   │       └── page.module.css
│   │
│   └── invitations/
│       └── accept/
│           ├── page.js                    ← Accept invite landing page
│           └── page.module.css
│
├── components/
│   ├── Nav.jsx + Nav.module.css
│   ├── Footer.jsx + Footer.module.css
│   ├── AuthSessionProvider.jsx
│   ├── OrgSwitcher.jsx + OrgSwitcher.module.css
│   ├── AssessmentCard.jsx + AssessmentCard.module.css
│   ├── DimensionPanel.jsx + DimensionPanel.module.css
│   ├── QuestionCard.jsx + QuestionCard.module.css
│   ├── ScoreSlider.jsx + ScoreSlider.module.css
│   ├── RadarChart.jsx + RadarChart.module.css
│   ├── VerdictBanner.jsx + VerdictBanner.module.css
│   ├── ProgressStepper.jsx + ProgressStepper.module.css
│   ├── MemberRow.jsx + MemberRow.module.css
│   └── InviteModal.jsx + InviteModal.module.css
│
├── lib/
│   ├── prisma.ts                          ← Prisma singleton (TypeScript)
│   ├── assessment-data.js                 ← All 30 questions, dimensions, scoring rubrics
│   ├── scoring.js                         ← Score calculation, verdict logic
│   └── tenant.js                          ← Helpers: getActiveOrg, assertOrgAccess
│
├── prisma/
│   └── schema.prisma
│
├── styles/
│   ├── globals.css
│   └── animations.css
│
├── public/
│   ├── robots.txt
│   └── sitemap.xml
│
├── auth.js                                ← Auth.js v5 root config
├── middleware.js                          ← Route protection + auth guard
├── jsconfig.json
├── next.config.js
└── .env.local
```

---

## 6. Routes & Pages

### Public routes (no auth required)

| Route | Purpose |
|---|---|
| `/` | Landing page. Checks session: if authenticated → redirect to `/dashboard`; if not → marketing content with sign-in CTA |
| `/signin` | SpanForge sign-in page. Google + GitHub OAuth buttons. Accepts `callbackUrl` query param. |
| `/invitations/accept` | Accept an org invitation via `?token=<token>`. Requires sign-in first; preserves token through redirect. |

### Protected routes (auth + org membership required)

| Route | Purpose | Min Role |
|---|---|---|
| `/onboarding` | First-time user flow: create new org or join via invite link. | — (no org yet) |
| `/dashboard` | Org overview. Shows latest assessment status, score trend, quick actions. | member |
| `/assessments` | Full list of all assessments for the active org. | member |
| `/assessments/new` | Create a new assessment (name, description, optional collaborators). | admin / owner |
| `/assessments/[id]` | Assessment overview: status, progress, collaborators, dimension breakdown. | member |
| `/assessments/[id]/take` | Live scoring flow. Step through 6 dimensions × 5 questions. Auto-saves. | member |
| `/assessments/[id]/results` | Final results: overall score, verdict, radar chart, per-dimension scores, recommendations. | member |
| `/settings` | Edit org profile: name, slug, industry, size, logo. | admin / owner |
| `/settings/members` | View members, change roles, remove members, send invitations. | admin / owner |

### Rendering strategy

| Route | Strategy | Reason |
|---|---|---|
| `/` | Static | Marketing content, no user data |
| `/signin` | Dynamic | Reads session |
| `/onboarding` | Dynamic | Reads session + org membership |
| `/dashboard` | Dynamic | Reads org + assessments per user |
| `/assessments` | Dynamic | Reads org-scoped assessment list |
| `/assessments/new` | Dynamic | Reads session |
| `/assessments/[id]` | Dynamic | Reads assessment data |
| `/assessments/[id]/take` | Dynamic | Read + write responses |
| `/assessments/[id]/results` | Dynamic | Reads computed scores |
| `/settings` | Dynamic | Reads org |
| `/settings/members` | Dynamic | Reads org members |
| `/api/*` | Dynamic | All mutations |

---

## 7. API Routes

All API routes follow Pattern 3 from TECHNICAL-GUIDE.md §9: authenticate with `await auth()`, return `401` if no session, scope all queries to `session.user.id` and the active `orgId`.

### Organisations

| Method | Route | Action | Auth |
|---|---|---|---|
| `POST` | `/api/organisations` | Create new org, auto-assign creator as `owner`, set `activeOrgId` on session | Any signed-in user |

### Assessments

| Method | Route | Action | Auth |
|---|---|---|---|
| `GET` | `/api/assessments` | List all assessments for active org | member+ |
| `POST` | `/api/assessments` | Create assessment, set `status: draft` | admin+ |
| `GET` | `/api/assessments/[id]` | Get assessment + responses + dimension scores | member+ |
| `PATCH` | `/api/assessments/[id]` | Update name, description | admin+ |
| `DELETE` | `/api/assessments/[id]` | Delete assessment and all responses | owner only |
| `POST` | `/api/assessments/[id]/complete` | Compute dimension scores, set verdict, mark `completed` | member+ |

### Assessment Responses

| Method | Route | Action | Auth |
|---|---|---|---|
| `GET` | `/api/assessments/[id]/responses` | Get all responses for this assessment | member+ |
| `POST` | `/api/assessments/[id]/responses` | Upsert a single question score (`@@unique` on assessmentId + questionId) | member+ |

The `POST` responses endpoint uses Prisma `upsert` — the same handler covers both creating a new score and updating an existing one. Auto-transitions assessment `status` to `in_progress` on first response.

### Collaborators

| Method | Route | Action | Auth |
|---|---|---|---|
| `GET` | `/api/assessments/[id]/collaborators` | List collaborators | member+ |
| `POST` | `/api/assessments/[id]/collaborators` | Add a collaborator by userId | admin+ |
| `DELETE` | `/api/assessments/[id]/collaborators` | Remove collaborator | admin+ |

### Invitations

| Method | Route | Action | Auth |
|---|---|---|---|
| `POST` | `/api/invitations` | Send invite email, create `Invitation` record with 7-day `expiresAt` | admin+ |
| `POST` | `/api/invitations/accept` | Validate token, check expiry, create `OrganisationMember`, mark `acceptedAt` | Any signed-in user |

---

## 8. Middleware — Auth Guard

`middleware.js` at the project root intercepts every request before it reaches a page. It uses `auth()` from Auth.js v5.

```js
// middleware.js
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/signin', '/api/auth']
const INVITE_ROUTE  = '/invitations/accept'

export default auth(function middleware(req) {
  const { pathname, searchParams } = req.nextUrl
  const session = req.auth

  // Allow public routes and API auth callbacks
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Allow invitation acceptance page (user may not have a session yet)
  if (pathname.startsWith(INVITE_ROUTE)) {
    if (!session) {
      // Preserve the token through the sign-in redirect
      const token = searchParams.get('token')
      const callbackUrl = `${INVITE_ROUTE}?token=${token}`
      const url = req.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('callbackUrl', callbackUrl)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // All other routes require authentication
  if (!session) {
    const url = req.nextUrl.clone()
    const callbackUrl = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    url.pathname = '/signin'
    url.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

**Onboarding guard:** Pages under `/dashboard`, `/assessments`, and `/settings` additionally check for active org membership server-side at the top of each page component:

```js
// Shared server-side guard pattern (used in every protected page)
import { auth }   from '@/auth'
import { redirect } from 'next/navigation'
import { getActiveOrg } from '@/lib/tenant'

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) redirect('/signin?callbackUrl=/dashboard')

  const org = await getActiveOrg(session.user.id)
  if (!org) redirect('/onboarding')

  // ... page content
}
```

---

## 9. Core Features

### 9.1 Onboarding

**Flow:**
1. New user signs in for the first time → no `OrganisationMember` record exists → middleware/page guard redirects to `/onboarding`
2. Two options presented:
   - **Create organisation** — enter name (slug auto-generated from name), industry, size → creates `Organisation` + `OrganisationMember` with `role: owner`
   - **Join via invitation** — if user arrived from an invite link, the invite token is pre-populated → accepts invite → creates `OrganisationMember` with the invited `role`
3. On completion → redirect to `/dashboard`

### 9.2 Creating an Assessment

1. Org `admin` or `owner` navigates to `/assessments/new`
2. Enters:
   - Assessment name (default: "AI Readiness Assessment")
   - Optional description
   - Optional: add collaborators from existing org members
3. `Assessment` record created with `status: draft`
4. Redirect to `/assessments/[id]`

### 9.3 Taking the Assessment (Scoring Flow)

The `/assessments/[id]/take` page is the primary interactive experience.

**UX flow:**
- Six-step wizard — one dimension per step
- Each step shows 5 question cards
- Each question card displays:
  - Question number badge (e.g., `Q1`)
  - Dimension eyebrow label
  - Question title
  - "Why we ask" rationale (collapsible)
  - Three scoring anchors: "Score 1 — Early stage", "Score 3 — Developing", "Score 5 — Ready"
  - A 1–5 score selector (radio buttons styled as score tiles)
  - Optional notes text field for team discussion capture
- Scores are saved via `POST /api/assessments/[id]/responses` on every score selection (auto-save — no explicit submit button per question)
- Assessment `status` transitions to `in_progress` on first response
- Dimension progress bar shows how many of the 5 questions in the current dimension have been scored
- Overall progress indicator shows which of the 6 dimensions are complete
- Navigation: Previous / Next dimension buttons; jump to any dimension via the stepper
- **Collaborative scoring:** Multiple team members with access can score simultaneously. The last saved score wins (per `@@unique` constraint). Collaborator avatars shown on the progress stepper.

**Auto-save pattern:**
```
User selects score 
  → debounced POST to /api/assessments/[id]/responses
  → optimistic UI update
  → success: score confirmed
  → failure: retry indicator shown
```

### 9.4 Completing the Assessment

When all 30 questions have been scored, a "Complete Assessment" button appears.

On click → `POST /api/assessments/[id]/complete`:
1. Server validates all 30 `AssessmentResponse` records exist for this assessment
2. Computes 6 dimension scores (sum of 5 question scores per dimension)
3. Computes `totalScore` (sum of all 6 dimension scores)
4. Determines `verdict` based on scoring ranges
5. Checks Discover Gate condition (totalScore ≥ 90 AND no dimension below 12)
6. Creates/updates 6 `DimensionScore` records
7. Sets `Assessment.status = 'completed'`, `Assessment.completedAt = now()`
8. Returns computed results → client redirects to `/assessments/[id]/results`

### 9.5 Results Page

`/assessments/[id]/results` shows:

- **Verdict banner** — colour-coded: green (Ready), amber (Developing), orange (Emerging), red (Not Ready) — with the score and verdict label
- **Total score** — `X / 150`, large display
- **Discover Gate status** — pass/fail indicator with condition detail
- **Radar chart** — hexagonal spider chart of 6 dimension scores (0–25 each), rendered with a lightweight canvas or SVG solution (no Chart.js to keep bundle lean; implementation uses a custom SVG radar)
- **Dimension scorecard table** — each dimension as a row: name, score `/25`, traffic-light indicator, "watch" flag if below 12
- **Recommendations panel** — for dimensions scoring below 18, display targeted readiness building actions
- **Assessment metadata** — date completed, team members who participated, assessment name
- **Next step prompt** — if score ≥ 90: "Proceed to the AI Project Qualification Assessment"; if below 90: "Build a 90-day readiness plan for your low-scoring dimensions"

### 9.6 Historical Comparison (Pro / Enterprise)

When an org has more than one completed assessment, the results page shows a trend panel:

- Score history chart (line chart — total score across dates)
- Delta indicators on dimension scores (improvement / regression vs previous assessment)
- "Previous assessment" quick link

### 9.7 Invitation System

Admin or owner sends an invite from `/settings/members`:

1. Enters email + role
2. `POST /api/invitations` → creates `Invitation` record + sends email with link: `https://app.getspanforge.com/invitations/accept?token=<cuid>`
3. Invitee clicks link → if not signed in, redirected to `/signin` with `callbackUrl` preserving the token
4. After sign-in, lands on `/invitations/accept?token=<token>`:
   - Server validates token: exists, not expired (`expiresAt > now()`), not already accepted
   - Shows org name and role being offered
   - Confirm button → `POST /api/invitations/accept` → creates `OrganisationMember`, sets `acceptedAt`
   - Redirect to `/dashboard`

### 9.8 Org Settings

`/settings` — editable fields:
- Organisation name
- Slug (with uniqueness validation)
- Industry
- Size category
- Website
- Logo URL

`/settings/members` — member management:
- Table of all `OrganisationMember` records with name, email, role, join date
- Role change (owner/admin only; cannot demote the last owner)
- Remove member (cannot remove self if last owner)
- Pending invitations panel with resend / revoke actions

---

## 10. Key Components

### `QuestionCard`

The primary interactive unit of the assessment flow. Receives:
- `question` — question data object from `assessment-data.js`
- `savedScore` — current saved score from DB (if any)
- `onScore(questionId, score, notes)` — callback that triggers auto-save
- `disabled` — boolean for read-only mode (viewing a completed assessment)

Renders: eyebrow dimension label, question title, "Why we ask" accordion, three-anchor scoring rubric display, 1–5 score selector tiles, notes textarea.

### `RadarChart`

Pure SVG component. Takes:
- `scores` — object `{ strategy: 18, data: 20, infrastructure: 15, talent: 22, governance: 16, culture: 19 }`
- `maxScore` — `25` (constant)

Renders a hexagonal radar chart using SpanForge colour tokens. No external charting library — custom SVG paths calculated from polar coordinates. Reduced-motion safe.

### `VerdictBanner`

Takes `verdict` and `totalScore`. Returns one of four colour states mapped to SpanForge tokens:
- Ready → `--design` green accent
- Developing → `--build` amber accent
- Emerging → custom orange
- Not Ready → `--red`

### `ProgressStepper`

Six-step horizontal stepper showing dimension completion state. Each step: dimension number badge, dimension label, completion tick or question count. Clicking a completed or in-progress dimension navigates directly to it in the take flow.

### `OrgSwitcher`

Client Component using `useSession()`. Shows current org name. If the user belongs to multiple orgs, renders a dropdown to switch. Switching calls a server action that updates `session.user.activeOrgId` and refreshes the session.

---

## 11. Assessment Data Layer

All 30 questions, their dimension mapping, question IDs, and scoring rubric text live in a static data file — no database calls needed for this content.

```js
// lib/assessment-data.js

export const DIMENSIONS = [
  { id: 'strategy',       label: 'Strategy',       number: '01', color: 'var(--discover)' },
  { id: 'data',           label: 'Data',            number: '02', color: 'var(--design)' },
  { id: 'infrastructure', label: 'Infrastructure',  number: '03', color: 'var(--build)' },
  { id: 'talent',         label: 'Talent',          number: '04', color: 'var(--govern)' },
  { id: 'governance',     label: 'Governance',      number: '05', color: 'var(--scale)' },
  { id: 'culture',        label: 'Culture',         number: '06', color: 'var(--red-dim)' },
]

export const QUESTIONS = [
  {
    id:        'Q1',
    dimension: 'strategy',
    number:    1,
    title:     'Has the board or executive team defined a specific AI strategy — not just expressed AI ambition?',
    whyWeAsk:  '...',
    anchors: [
      { score: 1, label: 'Early stage', description: '...' },
      { score: 3, label: 'Developing',  description: '...' },
      { score: 5, label: 'Ready',       description: '...' },
    ],
  },
  // ... Q2 through Q30
]

export const QUESTIONS_BY_DIMENSION = DIMENSIONS.reduce((acc, dim) => {
  acc[dim.id] = QUESTIONS.filter(q => q.dimension === dim.id)
  return acc
}, {})
```

This file is imported directly by Server Components and API routes — no async, no fetch calls.

---

## 12. Scoring Logic

```js
// lib/scoring.js

export const VERDICTS = [
  { min: 130, max: 150, id: 'ready',      label: 'Ready',      action: 'Proceed to AI projects with confidence.' },
  { min: 105, max: 129, id: 'developing', label: 'Developing', action: 'Begin in stronger dimensions. Build a 90-day readiness plan.' },
  { min: 75,  max: 104, id: 'emerging',   label: 'Emerging',   action: 'Limit to low-risk experiments. 6–12 months of foundational work required.' },
  { min: 0,   max: 74,  id: 'not_ready',  label: 'Not Ready',  action: 'Do not proceed. Build foundations first.' },
]

export function computeVerdict(totalScore) {
  return VERDICTS.find(v => totalScore >= v.min && totalScore <= v.max) ?? VERDICTS[3]
}

export function computeDimensionScores(responses) {
  // responses: AssessmentResponse[]
  // returns: { strategy: 18, data: 20, ... }
  return responses.reduce((acc, r) => {
    acc[r.dimension] = (acc[r.dimension] ?? 0) + r.score
    return acc
  }, {})
}

export function checkDiscoverGate(dimensionScores, totalScore) {
  const meetsTotal = totalScore >= 90
  const allDimensionsMeetFloor = Object.values(dimensionScores).every(s => s >= 12)
  return { passes: meetsTotal && allDimensionsMeetFloor, meetsTotal, allDimensionsMeetFloor }
}

export function getDimensionRecommendations(dimensionScores) {
  // Returns targeted action text for any dimension scoring below 18
  return Object.entries(dimensionScores)
    .filter(([, score]) => score < 18)
    .map(([dimension, score]) => ({ dimension, score, recommendation: RECOMMENDATIONS[dimension] }))
}
```

---

## 13. Environment Variables

```env
# ── Database (Neon) ───────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.neon.tech:5432/neondb?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-xxx.neon.tech:5432/neondb?sslmode=require

# ── Auth.js ───────────────────────────────────────────────────────────────────
AUTH_SECRET=<openssl rand -base64 32>

# ── Google OAuth ──────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# ── GitHub OAuth (optional) ───────────────────────────────────────────────────
GITHUB_CLIENT_ID=Ov23liXXX
GITHUB_CLIENT_SECRET=xxx

# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://readiness.getspanforge.com

# ── Email (for invitation emails) ─────────────────────────────────────────────
# Resend or similar transactional email service
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@getspanforge.com
```

---

## 14. Implementation Phases

### Phase 1 — Foundation (Week 1–2)

**Goal:** Working app skeleton with auth, DB, and org creation.

- [ ] Bootstrap Next.js 14 app with `--app --no-src-dir --no-tailwind`
- [ ] Install all dependencies (next-auth, prisma, @auth/prisma-adapter, vercel analytics)
- [ ] Copy SpanForge shared files: `globals.css`, `animations.css`, `Nav`, `Footer`
- [ ] Set up Neon project; configure `DATABASE_URL` + `DIRECT_URL`
- [ ] Write and migrate the full Prisma schema (all models from §4)
- [ ] Configure Auth.js v5: `auth.js`, route handler, `AuthSessionProvider`
- [ ] Implement `middleware.js` auth guard
- [ ] Build `/signin` page with Google + GitHub buttons, SpanForge styling
- [ ] Build `/onboarding` page: create org form + join via invite
- [ ] `/api/organisations` POST route
- [ ] Basic `/dashboard` page (static shell, session guard)
- [ ] Test end-to-end: sign in → onboarding → dashboard

---

### Phase 2 — Assessment Flow (Week 3–4)

**Goal:** Users can create, take, and complete a full assessment.

- [ ] Write `lib/assessment-data.js` with all 30 questions, rubrics, and dimension mappings (from the .docx content)
- [ ] Write `lib/scoring.js` with verdict logic, dimension score computation, Discover Gate check
- [ ] Build `/assessments` list page
- [ ] Build `/assessments/new` create form
- [ ] `POST /api/assessments` route
- [ ] Build `/assessments/[id]` overview page
- [ ] Build `QuestionCard` component with 1–5 score selector and notes field
- [ ] Build `ProgressStepper` component
- [ ] Build `/assessments/[id]/take` six-step wizard
- [ ] `GET/POST /api/assessments/[id]/responses` upsert route (auto-save)
- [ ] `POST /api/assessments/[id]/complete` scoring + finalisation route
- [ ] Test: complete a full 30-question assessment, verify scores computed correctly

---

### Phase 3 — Results & Reporting (Week 5)

**Goal:** Rich results page with radar chart and recommendations.

- [ ] Build custom SVG `RadarChart` component
- [ ] Build `VerdictBanner` component
- [ ] Build `/assessments/[id]/results` page
- [ ] Discover Gate pass/fail indicator
- [ ] Per-dimension scorecard table with traffic-light indicators
- [ ] Recommendations panel for low-scoring dimensions
- [ ] "Next step" action prompt based on verdict
- [ ] Read-only view of completed assessment (re-open `/take` in review mode)

---

### Phase 4 — Collaboration & Team Features (Week 6)

**Goal:** Multiple team members can participate in an assessment.

- [ ] Build `InviteModal` and `MemberRow` components
- [ ] Build `/settings/members` page
- [ ] `POST /api/invitations` route
- [ ] `POST /api/invitations/accept` route (token validation + membership creation)
- [ ] `/invitations/accept` landing page
- [ ] Invite email integration (Resend or equivalent)
- [ ] Assessment collaborator management: `GET/POST/DELETE /api/assessments/[id]/collaborators`
- [ ] Collaborative real-time indicator on `/take` (show collaborator avatars, last-save attribution)
- [ ] `OrgSwitcher` component for multi-org users

---

### Phase 5 — Settings, Admin & Polish (Week 7)

**Goal:** Org management complete; production-ready quality.

- [ ] Build `/settings` org profile page with edit form
- [ ] Role-based access enforcement on all API routes (owner/admin/member checks)
- [ ] Plan-based feature gating (assessment count limit for `free` plan)
- [ ] Assessment history trend view (Pro feature gate)
- [ ] 404 and error boundary pages
- [ ] Full security headers in `next.config.js`
- [ ] SEO metadata for all pages
- [ ] `public/robots.txt` (noindex on auth + app routes)
- [ ] Vercel Analytics + Speed Insights

---

### Phase 6 — Deployment (Week 8)

**Goal:** Live on Vercel, connected to production Neon DB.

- [ ] Deploy to Vercel; configure all environment variables
- [ ] Configure production OAuth redirect URIs (Google Console + GitHub)
- [ ] Run `prisma migrate deploy` on production DB
- [ ] Smoke test full user journey on production URL
- [ ] Set custom domain: `readiness.getspanforge.com`
- [ ] Configure `NEXT_PUBLIC_APP_URL`
- [ ] Verify security headers with [securityheaders.com](https://securityheaders.com)
- [ ] Add app entry in SpanForge nav and homepage with auth-aware link

---

## Security Considerations

| Risk | Mitigation |
|---|---|
| Cross-tenant data access | Every DB query includes `orgId` scoped to session; API routes assert org membership before returning data |
| IDOR on assessment routes | `/api/assessments/[id]` verifies `assessment.orgId === session.user.activeOrgId` before processing |
| Invitation token abuse | Tokens expire after 7 days; single-use (`acceptedAt` set on first use and checked on subsequent requests) |
| Unauthenticated access | Middleware covers all routes; Server Component pages add a second guard layer |
| CSRF on Server Actions | Auth.js v5 Server Actions use built-in origin checking |
| Injection via notes/names | Prisma parameterised queries prevent SQL injection; all user content is stored and rendered as plain text |
| Session fixation | Auth.js v5 rotates session tokens on sign-in |
| Plan bypass | Plan checks are server-side only; `org.plan` is read from DB on every gated request, never from client state |

---

*Document version: 1.0 — March 2026*  
*SpanForge AI Organisational Readiness Assessment — Discover Phase*
