# SpanForge Technical Guide

> **Canonical reference for all SpanForge apps.**  
> Every app in the suite uses this exact stack, database, and architecture. Do not deviate without updating this guide.

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Project Bootstrap](#2-project-bootstrap)
3. [Directory Structure](#3-directory-structure)
4. [Path Aliases & Module Resolution](#4-path-aliases--module-resolution)
5. [Database — Neon PostgreSQL + Prisma](#5-database--neon-postgresql--prisma)
6. [Authentication — Auth.js v5](#6-authentication--authjs-v5)
7. [Multi-Tenant Architecture](#7-multi-tenant-architecture)
8. [Rate Limiting](#8-rate-limiting)
9. [Middleware](#9-middleware)
10. [Environment Variables](#10-environment-variables)
11. [Next.js Configuration](#11-nextjs-configuration)
12. [Data Layer Patterns](#12-data-layer-patterns)
13. [Onboarding Flow](#13-onboarding-flow)
14. [Static vs Dynamic Rendering](#14-static-vs-dynamic-rendering)
15. [SEO & Metadata](#15-seo--metadata)
16. [Analytics & Performance](#16-analytics--performance)
17. [Security Headers](#17-security-headers)
18. [Deployment — Vercel](#18-deployment--vercel)
19. [Development Workflow](#19-development-workflow)
20. [Adding a New App to the Suite](#20-adding-a-new-app-to-the-suite)

---

## 1. Stack Overview

| Layer | Technology | Version |
|---|---|---|
| Framework | **Next.js** (App Router) | `^14.2` |
| Language | **JavaScript** (JSX) — no TypeScript in app code | — |
| Database | **Neon** — serverless PostgreSQL | hosted |
| ORM | **Prisma** | `^5.22` |
| Auth | **Auth.js v5** (next-auth beta) | `^5.0.0-beta.30` |
| Auth adapter | `@auth/prisma-adapter` | `^2.11` |
| OAuth providers | Google (primary) | — |
| Tenancy | Multi-tenant: Organisation + OrganisationMember | — |
| Email | **Resend** (transactional invitations) | `^4.0` |
| Styling | **CSS Modules** + global CSS variables | — |
| Fonts | Google Fonts via `next/font` | — |
| Analytics | **Vercel Analytics** + **Vercel Speed Insights** | — |
| Hosting | **Vercel** | — |
| Linting | ESLint + `eslint-config-next` | `^8` / `^14.2` |

**TypeScript note:** `lib/prisma.ts` is `.ts` (Prisma singleton requires it). All other files are `.js` / `.jsx`. Do not convert app code to TypeScript — keep this convention.

**Markdown / blog:** `gray-matter`, `react-markdown`, `remark-gfm`, `rehype-highlight`, `rehype-raw`, and `highlight.js` are available as optional dependencies for apps that include a content/blog section. Apps without a blog do not need to install them.

---

## 2. Project Bootstrap

```bash
# 1. Create Next.js app (App Router, no src/ dir, no Tailwind)
npx create-next-app@14 my-app --app --no-src-dir --no-tailwind --eslint --import-alias "@/*"

cd my-app

# 2. Install production dependencies (core multi-tenant SaaS stack)
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client \
  @vercel/analytics @vercel/speed-insights \
  resend

# 3. (Optional) Markdown / blog support — install only if the app has a blog
npm install gray-matter react-markdown remark-gfm rehype-highlight rehype-raw highlight.js

# 4. Install dev tools
npm install -D eslint eslint-config-next

# 5. Initialise Prisma
npx prisma init --datasource-provider postgresql
```

After init, the `postinstall` script in `package.json` must run `prisma generate` automatically on deploy:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "postinstall": "prisma generate"
}
```

---

## 3. Directory Structure

```
my-app/
├── app/                          ← Next.js App Router pages & layouts
│   ├── layout.js                 ← Root layout: fonts, nav, footer, providers
│   ├── page.js                   ← Public landing / marketing page
│   ├── not-found.js              ← Global 404
│   ├── error.js                  ← Global error boundary (client component)
│   ├── global-error.js           ← Root error boundary
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/    ← Auth.js catch-all handler
│   │   │       └── route.js
│   │   ├── organisations/
│   │   │   ├── route.js          ← POST create org (onboarding)
│   │   │   └── current/
│   │   │       ├── route.js      ← GET / PATCH current org
│   │   │       └── members/
│   │   │           └── [userId]/
│   │   │               └── route.js  ← PATCH / DELETE member
│   │   ├── invitations/
│   │   │   ├── route.js          ← GET (list) + POST (create + email)
│   │   │   └── accept/
│   │   │       └── route.js      ← POST accept invitation by token
│   │   └── user/
│   │       └── orgs/
│   │           └── route.js      ← GET list of user's org memberships
│   ├── signin/                   ← Auth sign-in page
│   ├── onboarding/               ← New-user org creation
│   ├── dashboard/                ← Authenticated home (requires org)
│   ├── settings/                 ← Org settings + member management
│   │   └── members/
│   ├── invitations/
│   │   └── accept/               ← Token-based invitation accept page
│   └── [feature]/                ← One folder per major feature
│       ├── page.js
│       ├── page.module.css
│       └── [id]/
│           └── ...
│
├── components/                   ← Shared UI components
│   ├── Nav.jsx + Nav.module.css
│   ├── Footer.jsx + Footer.module.css
│   ├── AuthSessionProvider.jsx   ← 'use client' SessionProvider wrapper
│   ├── OrgSwitcher.jsx           ← Dropdown to switch active organisation
│   └── [Component].jsx + [Component].module.css
│
├── lib/                          ← Server-side utilities
│   ├── prisma.ts                 ← Prisma singleton (TypeScript)
│   ├── tenant.js                 ← Multi-tenant helpers (getActiveOrg, assertOrgAccess, etc.)
│   ├── switch-org.js             ← Server Action: set sf_active_org cookie
│   ├── rate-limit.js             ← In-memory sliding-window rate limiter
│   └── [feature]-data.js         ← Static data / domain constants
│
├── prisma/
│   └── schema.prisma
│
├── styles/
│   ├── globals.css               ← Design tokens + global utility classes
│   └── animations.css            ← Keyframes + animation utilities
│
├── public/
│   ├── robots.txt
│   └── sitemap.xml
│
├── auth.js                       ← Auth.js v5 config (root level)
├── middleware.js                 ← Auth guard + route rules
├── jsconfig.json                 ← Path alias @/* → ./*
├── next.config.js                ← Security headers, redirects, externals
├── .env.local                    ← Secrets (never commit)
└── package.json
```

**Feature folder convention:** Each major feature (e.g. `assessments/`, `settings/`, `onboarding/`) gets its own folder under `app/`. Client-only interactive sub-components live alongside the page file as `FeatureName.jsx` + `FeatureName.module.css`.

---

## 4. Path Aliases & Module Resolution

All imports use the `@/` alias. **Never use relative `../../` paths** across feature directories.

```json
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Examples:
```js
import { prisma }  from '@/lib/prisma'
import Nav         from '@/components/Nav'
import { auth }    from '@/auth'
import styles      from './page.module.css'    // same-dir CSS Module — relative is fine
```

---

## 5. Database — Neon PostgreSQL + Prisma

### Connection

Neon provides two URLs — use **both** for Prisma's connection pooling + direct migration support:

```env
DATABASE_URL=postgresql://...?sslmode=require   # pooled (for queries)
DIRECT_URL=postgresql://...?sslmode=require      # direct (for migrations)
```

Both point to the same Neon instance. `DATABASE_URL` goes through Neon's connection pooler. `DIRECT_URL` bypasses the pooler and is required by `prisma migrate`.

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Prisma singleton

**Always** use the singleton from `lib/prisma.ts` to avoid exhausting connections in development (Next.js hot reload creates new module instances on every change):

```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

In production Next.js each serverless function invocation gets one instance. In development the global prevents leak.

### Schema conventions

```prisma
generator client {
  provider = "prisma-client-js"
}

// ─── AUTH.JS REQUIRED MODELS ─────────────────────────────────────────────────
// Copy these verbatim into every new SpanForge app.

model User {
  id            String    @id @default(cuid())   // always cuid(), not uuid()
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  plan          String    @default("free")        // subscription tier
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts   Account[]
  sessions   Session[]
  // Add app-specific relations below
}

model Account { ... }           // Auth.js — copy verbatim
model Session { ... }           // Auth.js — copy verbatim
model VerificationToken { ... } // Auth.js — copy verbatim

// ─── MULTI-TENANT ORGANISATION MODELS ────────────────────────────────────────

model Organisation {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique          // URL-safe, generated on creation
  plan      String   @default("free")
  logoUrl   String?
  website   String?
  industry  String?
  size      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members     OrganisationMember[]
  // Add feature-specific relations below (e.g. assessments, workspaces)
  invitations Invitation[]
}

model OrganisationMember {
  id        String   @id @default(cuid())
  orgId     String
  userId    String
  role      String   @default("member")  // "owner" | "admin" | "member"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  org  Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([orgId, userId])
  @@index([userId])
}

model Invitation {
  id          String    @id @default(cuid())
  orgId       String
  email       String                    // invitee email
  role        String    @default("member")
  token       String    @unique @default(cuid())
  invitedById String
  acceptedAt  DateTime?
  expiresAt   DateTime                  // default: now + 7 days
  createdAt   DateTime  @default(now())

  org       Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
  invitedBy User         @relation(fields: [invitedById], references: [id])

  @@index([orgId])
  @@index([email])
}

// ─── APP-SPECIFIC MODELS ──────────────────────────────────────────────────────
// Add feature models here. Example pattern — scope everything to orgId:

model FeatureRecord {
  id          String   @id @default(cuid())
  orgId       String                   // always tenant-scoped
  createdById String
  name        String
  status      String   @default("draft")
  inputData   Json?                    // use Json? for flexible payloads
  outputData  Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  org       Organisation @relation(fields: [orgId], references: [id], onDelete: Cascade)
  createdBy User         @relation(fields: [createdById], references: [id])

  @@index([orgId])
  @@index([orgId, status])
}
```

**Conventions:**
- IDs: `@id @default(cuid())` — never auto-increment integers, never raw UUID
- Timestamps: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` on every model
- Cascades: always `onDelete: Cascade` on foreign keys that belong to an Org or User
- Tenant scope: every app-specific model must have `orgId String` and an `@@index([orgId])` — never store records without a tenant owner
- Roles: OrganisationMember uses `role String` with values `"owner"`, `"admin"`, `"member"`. Owner is set on org creation and cannot be changed via the normal member API
- Slug: the `Organisation` model has a `slug` field used in URLs. Generate it via `slugify()` and rely on the `@unique` constraint for collision detection (retry up to 5 times with numeric suffix)
- Flexible data: use `Json?` for variable inputs/outputs rather than many nullable columns
- Plan/tier field: `plan String @default("free")` on both User and Organisation

### Migration workflow

```bash
# Create and apply a new migration
npx prisma migrate dev --name describe-the-change

# Apply migrations on production (Vercel runs this in CI via postinstall)
npx prisma migrate deploy

# Regenerate the Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (local DB browser)
npx prisma studio
```

---

## 6. Authentication — Auth.js v5

### Root config — `auth.js`

Place `auth.js` at the **project root** (not inside `app/`). Auth.js v5 expects it there.

Multi-tenant apps use the **JWT session strategy** so the org context can be embedded in the token without a DB round-trip on every page load. An extra DB query in the `session` callback attaches the user's active org membership.

```js
// auth.js
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: { signIn: '/signin' },
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },   // ← JWT, not database sessions
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub  = user.id
        token.plan = user.plan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.id   = token.sub
        session.user.plan = token.plan ?? 'free'

        // Skip DB in Edge Runtime (middleware)
        if (typeof EdgeRuntime === 'string') return session

        // Attach first (or cookie-preferred) org membership to session
        const membership = await prisma.organisationMember.findFirst({
          where:   { userId: token.sub },
          include: { org: { select: { id: true, name: true, slug: true, plan: true } } },
          orderBy: { createdAt: 'asc' },
        })
        if (membership) {
          session.user.orgId   = membership.org.id
          session.user.orgName = membership.org.name
          session.user.orgSlug = membership.org.slug
          session.user.orgPlan = membership.org.plan
          session.user.orgRole = membership.role
        }
      }
      return session
    },
  },
})
```

**Session fields available everywhere (`session.user`):**

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | User's cuid |
| `plan` | `string` | User-level plan (`"free"`) |
| `orgId` | `string \| undefined` | Active org id — `undefined` if user has no org yet |
| `orgName` | `string \| undefined` | Active org display name |
| `orgSlug` | `string \| undefined` | Active org slug |
| `orgPlan` | `string \| undefined` | Org-level plan |
| `orgRole` | `string \| undefined` | `"owner"` \| `"admin"` \| `"member"` |

`orgId` being `undefined` is the signal to redirect to `/onboarding`.

**Why JWT strategy for multi-tenant apps:**  
Database sessions require a DB round-trip on every request to validate the session token. With JWT, the session is self-contained and only the `session` callback (called at sign-in and token refresh) needs a DB hit to load org membership. Use `revalidatePath('/', 'layout')` after switching org to force a session refresh.

### Route handler — `app/api/auth/[...nextauth]/route.js`

```js
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### Client provider — `components/AuthSessionProvider.jsx`

```jsx
'use client'
import { SessionProvider } from 'next-auth/react'
export default function AuthSessionProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Wrap the root layout body in `<AuthSessionProvider>` so client components can call `useSession()`.

### Sign-in page — `app/signin/page.js`

The sign-in page is a **Server Component** that:
1. Calls `await auth()` — if already signed in, redirects to `/dashboard`
2. Renders a `<form>` with an inline Server Action for each OAuth provider
3. Shows error messages from `searchParams.error`

```js
// app/signin/page.js
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'

export default async function SignInPage({ searchParams }) {
  const session = await auth()
  if (session) redirect('/dashboard')
  // render Google sign-in form with Server Action
}
```

### Protecting pages (Server Components)

```js
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) redirect('/signin?callbackUrl=/protected')
  // session.user.id, session.user.plan are available
}
```

### Reading session in Client Components

```jsx
'use client'
import { useSession } from 'next-auth/react'

export default function UserMenu() {
  const { data: session, status } = useSession()
  if (status === 'loading') return null
  if (!session) return <SignInButton />
  return <span>{session.user.name}</span>
}
```

### OAuth app setup

| Provider | Where to create | Callback URL |
|---|---|---|
| Google | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials | `https://your-domain.com/api/auth/callback/google` |
| GitHub | [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps | `https://your-domain.com/api/auth/callback/github` |

For local dev use `http://localhost:3000/api/auth/callback/google` (add as an additional redirect URI in Google Console — do not replace the production one).

---

## 7. Multi-Tenant Architecture

All SpanForge SaaS apps are multi-tenant: one user can belong to multiple organisations, and all data is scoped to an `orgId`.

### Key concepts

| Concept | Implementation |
|---|---|
| Active org | `sf_active_org` cookie (httpOnly, lax, 1-year maxAge) |
| Org switching | Server Action in `lib/switch-org.js` |
| Org membership assertion | `lib/tenant.js` helpers |
| Session org context | Attached in `auth.js` session callback |

### `lib/tenant.js` — helpers used in every route and page

```js
// Returns the active OrganisationMember row + org.
// Reads sf_active_org cookie; falls back to earliest joined org.
export async function getActiveOrg(userId) { ... }

// Asserts membership and redirects to /dashboard if not found.
// Use in Server Components.
export async function assertOrgAccess(userId, orgId) { ... }

// API-route-safe version — returns null instead of redirecting.
// Use in Route Handlers.
export async function assertOrgAccessApi(userId, orgId) { ... }

// Finds an org by slug; redirects on 404.
export async function getOrgBySlug(slug) { ... }

// Returns all OrganisationMember rows with user details.
export async function getOrgMembers(orgId) { ... }
```

**Rule:** Every Server Component or Route Handler that reads org data must call `getActiveOrg()` (or `assertOrgAccess()`) — never read `session.user.orgId` directly from the session for data access, because the cookie may point to a different org than the JWT.

### `lib/switch-org.js` — Server Action

```js
'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function switchOrg(orgId) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorised' }

  // Verify membership before setting cookie
  const membership = await prisma.organisationMember.findUnique({
    where: { orgId_userId: { orgId, userId: session.user.id } },
  })
  if (!membership) return { error: 'Not a member of that organisation.' }

  const cookieStore = await cookies()
  cookieStore.set('sf_active_org', orgId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   365 * 24 * 60 * 60,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}
```

### `components/OrgSwitcher.jsx` — client dropdown

The `OrgSwitcher` is a `'use client'` component that:
1. Reads `session.user.orgId` / `session.user.orgName` for the current context
2. Fetches `/api/user/orgs` on mount for the full membership list
3. Calls `switchOrg()` Server Action, then `router.push('/dashboard')` + `router.refresh()`
4. Renders nothing if the user belongs to only one org

Mount `<OrgSwitcher />` inside the `<Nav>` component.

### Org member roles

| Role | Can invite | Can manage members | Can delete org |
|---|---|---|---|
| `owner` | ✓ | ✓ | ✓ |
| `admin` | ✓ | ✓ | ✗ |
| `member` | ✗ | ✗ | ✗ |

Check roles in API routes:
```js
if (membership.role !== 'owner' && membership.role !== 'admin') {
  return NextResponse.json({ error: 'Only owners and admins can do this.' }, { status: 403 })
}
```

### Invitation flow

1. Admin/owner POSTs to `/api/invitations` with `{ email, role }`
2. Route creates an `Invitation` row (token = cuid, expires in 7 days) and sends an email via Resend
3. Invitee clicks the link → `/invitations/accept?token=...`
4. On sign-in (if not already signed in), middleware preserves the token through the callbackUrl
5. Accept page POSTs to `/api/invitations/accept` with the token
6. Route validates token (not expired, not already accepted), creates `OrganisationMember`, marks `acceptedAt`

---

## 8. Rate Limiting

`lib/rate-limit.js` provides a lightweight **in-memory sliding-window limiter** for single-instance environments. Use it on any mutation API route to prevent abuse.

```js
// lib/rate-limit.js
export function rateLimit(key, limit, windowMs) {
  // Returns { allowed: boolean, remaining: number }
}
```

**Usage in a Route Handler:**
```js
import { rateLimit } from '@/lib/rate-limit'

// Allow 10 invitations per user per 10 minutes
const { allowed } = rateLimit(`invite:${session.user.id}`, 10, 10 * 60 * 1000)
if (!allowed) {
  return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
}
```

**Key naming convention:** `action:userId` — e.g. `create-org:usr_abc123`, `invite:usr_abc123`.

**Production note:** This implementation is correct for single-process deployments. For Vercel serverless (multiple instances), replace with `@upstash/ratelimit` backed by a Redis store so limits are enforced across all function instances.

---

## 9. Middleware

`middleware.js` at the project root is the global auth guard. It runs on the Edge runtime before every request.

```js
// middleware.js
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES   = ['/signin']
const PUBLIC_PREFIXES = ['/api/auth', '/_next', '/favicon']
const INVITE_ROUTE    = '/invitations/accept'

export default auth(function middleware(req) {
  const { pathname, searchParams } = req.nextUrl
  const session = req.auth

  // Static assets and Next internals — always pass through
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Landing page — redirect signed-in users to /dashboard
  if (pathname === '/') {
    if (session) return redirect(req, '/dashboard')
    return NextResponse.next()
  }

  // Sign-in page — bounce already-authenticated users
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (session) {
      const cb = searchParams.get('callbackUrl') ?? '/dashboard'
      return redirect(req, cb.startsWith('/') ? cb : '/dashboard')
    }
    return NextResponse.next()
  }

  // Invitation accept — preserve token through sign-in redirect
  if (pathname.startsWith(INVITE_ROUTE)) {
    if (!session) {
      const token       = searchParams.get('token') ?? ''
      const callbackUrl = `${INVITE_ROUTE}?token=${token}`
      return redirectToSignIn(req, callbackUrl)
    }
    return NextResponse.next()
  }

  // All other routes require authentication
  if (!session) {
    const callbackUrl = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    return redirectToSignIn(req, callbackUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)'],
}
```

**Key rules:**
- The `matcher` pattern excludes static files so the middleware doesn't run on them
- `req.auth` contains the JWT session on the Edge — no DB call in middleware
- The invitation route receives special handling to preserve the `token` query param through the sign-in redirect
- The landing page `/` is **public but redirects authenticated users** to `/dashboard` — not a protected route

---

## 10. Environment Variables

Every SpanForge app needs these variables. Never commit `.env.local`.

```env
# ── Database ──────────────────────────────────────────────────────────
# BOTH urls point to the same Neon project.
# DATABASE_URL uses the pooled endpoint (for runtime queries).
# DIRECT_URL uses the direct endpoint (for prisma migrate).
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.neon.tech:5432/neondb?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-xxx.neon.tech:5432/neondb?sslmode=require

# ── Auth.js ───────────────────────────────────────────────────────────
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-random-secret-here

# ── App URL (used for invitation links, metadataBase, OAuth redirects) ─
AUTH_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# ── Google OAuth ──────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# ── Email \u2014 Resend ────────────────────────────────────────────────────
# Used to send invitation emails.
RESEND_API_KEY=re_xxx
```

**Vercel:** Add all of these in Project → Settings → Environment Variables. Set them for Production, Preview, and Development environments.

**`AUTH_URL` vs `NEXT_PUBLIC_APP_URL`:** Both should be the same production URL. `AUTH_URL` is read by Auth.js for redirect validation. `NEXT_PUBLIC_APP_URL` is used in app-level code (e.g. building invitation accept links) and is safe to expose to the client.

**Generating `AUTH_SECRET`:**
```bash
openssl rand -base64 32
# or: npx auth secret
```

---

## 11. Next.js Configuration

```js
// next.config.js
const isDev = process.env.NODE_ENV !== 'production'

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-eval' only in dev for Next.js hot reload
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    'https://vitals.vercel-insights.com',
    'https://va.vercel-scripts.com',
    ...(isDev ? ['ws://localhost:3000', 'http://localhost:3000'] : []),
  ].join(' '),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  // HSTS only in production (breaks local dev over HTTP)
  ...(!isDev ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
]

const nextConfig = {
  experimental: {
    // Required: prevents Prisma from being bundled client-side
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return []
  },
}

module.exports = nextConfig
```

**Critical:** `serverComponentsExternalPackages: ['@prisma/client', 'prisma']` must be present. Without it, Prisma is bundled into the client bundle and the build breaks.

**CSP note:** If you add a third-party script (e.g., analytics, fonts), add its origin to the relevant `script-src` or `connect-src` directive. Never use `'unsafe-eval'`.

---

## 12. Data Layer Patterns

### Pattern 1 — Static data files (no DB)

Use plain JS files in `lib/` for domain constants, question banks, scoring rules, and any data that doesn't need to be stored:

```js
// lib/assessment-data.js
export const DIMENSIONS = [
  { id: 'strategy', label: 'Strategy', ... },
]
export const QUESTIONS = [ ... ]
export const MAX_TOTAL_SCORE = 150
```

Import directly in Server Components — no `async`, no fetch, no DB call.

### Pattern 2 — Prisma queries in Server Components (tenant-scoped)

Always resolve the active org first, then scope every query to `orgId`:

```js
// app/dashboard/page.js  (Server Component)
import { auth }        from '@/auth'
import { getActiveOrg } from '@/lib/tenant'
import { prisma }      from '@/lib/prisma'
import { redirect }    from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  const membership = await getActiveOrg(session.user.id)
  if (!membership) redirect('/onboarding')    // no org → onboarding

  const { org } = membership

  const [items, memberCount] = await Promise.all([
    prisma.featureRecord.findMany({
      where:   { orgId: org.id },
      orderBy: { updatedAt: 'desc' },
      take:    10,
    }),
    prisma.organisationMember.count({ where: { orgId: org.id } }),
  ])
  // ...
}
```

Never import `prisma` in a Client Component (`'use client'`). Fetch in a Server Component parent and pass data down as props.

### Pattern 3 — API Routes for mutations (tenant-scoped)

All mutation routes follow the same shape: auth check → active org lookup → role check → input validation → rate limit (if needed) → DB write.

```js
// app/api/[feature]/route.js
import { NextResponse } from 'next/server'
import { auth }          from '@/auth'
import { getActiveOrg }  from '@/lib/tenant'
import { prisma }        from '@/lib/prisma'
import { rateLimit }     from '@/lib/rate-limit'

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const membership = await getActiveOrg(session.user.id)
  if (!membership)
    return NextResponse.json({ error: 'No organisation found' }, { status: 404 })

  // Optional role check
  if (membership.role !== 'owner' && membership.role !== 'admin')
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 })

  // Optional rate limit
  const { allowed } = rateLimit(`feature:${session.user.id}`, 20, 60 * 1000)
  if (!allowed)
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // Input validation (whitelist fields, check length/type)
  const name = (body.name ?? '').trim()
  if (!name || name.length < 2 || name.length > 200)
    return NextResponse.json({ error: 'Name must be 2–200 characters.' }, { status: 422 })

  try {
    const record = await prisma.featureRecord.create({
      data: {
        name,
        orgId:       membership.orgId,
        createdById: session.user.id,
      },
    })
    return NextResponse.json({ record }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
  }
}
```

**Error response conventions:**

| Status | Use case |
|---|---|
| `401` | Not authenticated |
| `403` | Authenticated but insufficient role |
| `404` | Resource not found / not in org |
| `409` | Conflict (duplicate, already exists) |
| `422` | Input validation failure |
| `429` | Rate limit exceeded |
| `500` | Unexpected server/DB error — always return a generic message, never expose internals |

### Pattern 4 — Server Actions

For simple form submissions (sign-in, cookie writes, single-field updates), use Server Actions — no separate route file needed.

```js
// lib/switch-org.js
'use server'
export async function switchOrg(orgId) { ... }
```

Call from a Client Component with `useTransition`:
```jsx
const [pending, startTransition] = useTransition()
startTransition(async () => {
  await switchOrg(orgId)
  router.push('/dashboard')
  router.refresh()
})
```

### Pattern 5 — Prisma transactions for multi-model writes

When a mutation must update two or more models atomically, use `prisma.$transaction`:

```js
await prisma.$transaction([
  prisma.modelA.update({ where: { id }, data: { ... } }),
  prisma.modelB.createMany({ data: [...] }),
])
```

---

## 13. Onboarding Flow

Every new user who signs in for the first time has no org. The middleware does not enforce org membership — instead, Server Components check and redirect:

```
sign-in → /dashboard → getActiveOrg() returns null → redirect('/onboarding')
```

The `/onboarding` page renders a form to create the first organisation. On submit:
1. Client POSTs to `/api/organisations` with `{ name, industry, size, website }`
2. Route creates `Organisation` + `OrganisationMember` (role `"owner"`) in a single `prisma.organisation.create` with nested `members.create`
3. A unique `slug` is generated from the org name via `slugify()`; if the slug collides (`P2002`), retry up to 5 times with a numeric suffix
4. On success, client redirects to `/dashboard`

**Org creation rate limit:** 3 orgs per user per hour (`rateLimit('create-org:userId', 3, 3600000)`).

---

## 14. Static vs Dynamic Rendering

| Route | Strategy | Why |
|---|---|---|
| `/` landing | Static | No user data; redirects auth'd users via middleware |
| `/signin` | Dynamic | Reads session to redirect if already signed in |
| `/onboarding` | Dynamic | Reads session, checks org membership |
| `/dashboard` | Dynamic | Reads session + org DB queries per user |
| `/settings` | Dynamic | Org data per user |
| `/settings/members` | Dynamic | Member list per org |
| `/invitations/accept` | Dynamic | Token lookup per request |
| `/[feature]` | Dynamic | All authenticated feature pages |
| `/[feature]/[id]` | Dynamic | Per-record DB query |
| `/api/auth/[...nextauth]` | Dynamic | Session management |
| `/api/*` | Dynamic | All mutations |

**Default to dynamic for authenticated apps.** Static rendering is only appropriate for the public landing page and any truly public, user-agnostic content. Use `export const dynamic = 'force-dynamic'` on pages that can't be statically inferred.

---

## 15. SEO & Metadata

### Root metadata (`app/layout.js`)

```js
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    template: '%s — AppName',
    default:  'AppName — Tagline',
  },
  description: '...',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    type:        'website',
    siteName:    'SpanForge',
    title:       'AppName — Tagline',
    description: '...',
  },
  twitter: { card: 'summary_large_image' },
  robots:  { index: true, follow: true },
}
```

### Per-page metadata

```js
// Static page
export const metadata = {
  title: 'Page Title',              // renders as "Page Title — AppName"
  description: 'Page description.',
}

// Dynamic pages (reads DB)
export async function generateMetadata({ params }) {
  const { id } = await params
  const record = await prisma.model.findUnique({ where: { id }, select: { name: true } })
  return { title: record ? `${record.name} — Results` : 'Results' }
}
```

### Sitemap and robots

Maintain `public/sitemap.xml` and `public/robots.txt` manually. Exclude authenticated routes from sitemap (they are not indexable).

```
# public/robots.txt
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /onboarding
Disallow: /settings
Disallow: /api/
Sitemap: https://your-domain.com/sitemap.xml
```

Suppress indexing on auth and app pages:
```js
// app/signin/page.js, app/dashboard/page.js, etc.
export const metadata = { robots: { index: false } }
```

---

### Optional: Markdown / Blog

If the app includes a content section, install the optional dependencies (see §2), add a `content/blog/` directory with `.mdx` files, and create a `lib/blog.js` module with `getAllPosts()`, `getPostBySlug()`, and `getAllSlugs()` helpers. Blog pages are statically generated with `generateStaticParams`.

---

## 16. Analytics & Performance

Both are installed as zero-config React components in the root layout:

```js
// app/layout.js
import { Analytics }    from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

- **Vercel Analytics** — page views, referrers, device breakdown. No cookie banner required (privacy-friendly).
- **Vercel Speed Insights** — Core Web Vitals (LCP, FID, CLS) tracked per-page in the Vercel dashboard.

Both are automatically disabled in development (`NODE_ENV !== 'production'`).

---

## 17. Security Headers

Applied globally in `next.config.js` via `async headers()`. Key headers and their effect:

| Header | Value | Effect |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Blocks clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter for older browsers |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `HSTS` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years |
| `Permissions-Policy` | `camera=(), microphone=(),...` | Disables unused browser APIs |
| `Content-Security-Policy` | see below | Restricts resource origins |

**CSP directives:**
- `default-src 'self'` — baseline: all resources must be same-origin
- `script-src 'self' 'unsafe-inline'` — inline scripts needed for Next.js hydration
- `frame-ancestors 'none'` — stronger than X-Frame-Options, blocks all framing
- `form-action 'self'` — forms can only submit to same origin

When adding third-party services, extend the relevant directive rather than widening `default-src`.

---

## 18. Deployment — Vercel

### `vercel.json`

Minimal — only declare the framework:

```json
{ "framework": "nextjs" }
```

Vercel auto-detects Next.js configuration. Do not duplicate `next.config.js` settings here.

### Deployment checklist

- [ ] All environment variables set in Vercel dashboard (Production + Preview)
- [ ] `DATABASE_URL` and `DIRECT_URL` set to the **pooled** and **direct** Neon connection strings respectively
- [ ] `AUTH_SECRET` set (unique per project, never share across apps)
- [ ] `AUTH_URL` set to `https://your-domain.com` (production domain, no trailing slash)
- [ ] `NEXT_PUBLIC_APP_URL` set to `https://your-domain.com`
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set
- [ ] `RESEND_API_KEY` set for transactional email (invitations)
- [ ] Google OAuth redirect URIs include the production domain (`https://your-domain.com/api/auth/callback/google`)
- [ ] `prisma generate` runs automatically via `postinstall`
- [ ] `prisma migrate deploy` runs automatically — add to build command: `prisma migrate deploy && next build`
- [ ] Custom domain configured and HTTPS certificate issued
- [ ] `CNAME` file present in `public/` for custom domain (`www.your-domain.com`)

### Vercel build command (when using Prisma migrations)

Go to Project → Settings → Build & Development Settings:

```
Build Command: npx prisma migrate deploy && next build
```

This ensures the database schema is always up-to-date before the app starts serving traffic.

---

## 19. Development Workflow

### First-time setup

```bash
git clone <repo>
cd <repo>
npm install

# Copy env template (create .env.local from .env.example)
cp .env.example .env.local
# Fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_URL, NEXT_PUBLIC_APP_URL,
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, RESEND_API_KEY

# Apply existing migrations to your local/Neon dev DB
npx prisma migrate dev

# Start dev server
npm run dev
```

### Day-to-day

```bash
npm run dev                          # start Next.js dev server (localhost:3000)
npx prisma studio                    # open DB browser at localhost:5555
npx prisma migrate dev --name name   # create a new migration
npx prisma generate                  # regenerate client after manual schema edits
```

### Adding a new page

1. Create `app/[route]/page.js` and `app/[route]/page.module.css`
2. Export `metadata` (static) or `generateMetadata` (dynamic)
3. If it needs data from DB — import `prisma` and `auth`, call `await auth()` first
4. Add route to the Nav links array in `components/Nav.jsx`
5. Add to `public/sitemap.xml`

### Adding a new Prisma model

1. Add the model to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add-model-name`
3. The `prisma generate` step runs automatically after migration
4. Import `prisma` from `@/lib/prisma` in server files

---

## 20. Adding a New App to the Suite

When starting a new SpanForge sub-app (e.g., `agentobs-app`, `llmdiff-app`):

### Shared across all apps

These are **identical** in every app — copy without modification (except where noted):

```
lib/prisma.ts                             ← Prisma singleton
lib/tenant.js                             ← Multi-tenant helpers (copy as-is)
lib/switch-org.js                         ← Server Action for org switching (copy as-is)
lib/rate-limit.js                         ← In-memory rate limiter (copy as-is)
styles/globals.css                        ← Design tokens
styles/animations.css                     ← Animation utilities
components/Nav.jsx + Nav.module.css       ← Navigation (update links only)
components/Footer.jsx + Footer.module.css ← Footer (update columns only)
components/AuthSessionProvider.jsx
components/OrgSwitcher.jsx + OrgSwitcher.module.css  ← Org switcher (copy as-is)
next.config.js                            ← Security headers block
middleware.js                             ← Auth guard (update PUBLIC_ROUTES if needed)
auth.js                                   ← Auth config (Google OAuth, JWT strategy)
jsconfig.json                             ← Path aliases
```

### Per-app customization

| File | What changes |
|---|---|
| `prisma/schema.prisma` | Add app-specific models below the auth + org block (always include `orgId` + `@@index([orgId]))`) |
| `app/layout.js` | App name, description, metadataBase URL |
| `middleware.js` | Add to `PUBLIC_ROUTES` if needed — otherwise copy as-is |
| `components/Nav.jsx` | Link array |
| `components/Footer.jsx` | Column structure |
| `lib/[feature]-data.js` | App-specific static data |
| `.env.local` | Fresh `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, new Neon project, new Google OAuth app IDs, `RESEND_API_KEY` |
| `public/robots.txt` | App domain |
| `public/sitemap.xml` | App routes |

### Shared Neon database vs separate

**Option A — One Neon project per app (recommended for isolation):**  
Create a new Neon project per app. Use the same Auth.js User model so users sign in with Google and get separate User rows per app.

**Option B — One Neon project, multiple databases:**  
Create additional databases inside the same Neon project. Useful when apps share user accounts.

**Option C — Schema isolation:**  
Single database, use Prisma's `@@schema` directive if Neon's schemas feature is used.

Start with **Option A** for simplicity. Migrate to shared DB only when you need cross-app user data.

---

## Quick Checklist — New App Setup

```
[ ] npx create-next-app@14 with App Router, no Tailwind, import alias @/*
[ ] npm install (see §2 for full dependency list)
[ ] Copy: prisma.ts, globals.css, animations.css, Nav, Footer, AuthSessionProvider, OrgSwitcher (+ module.css files)
[ ] Copy: auth.js, middleware.js, next.config.js, jsconfig.json
[ ] Copy: lib/tenant.js, lib/switch-org.js, lib/rate-limit.js
[ ] npx prisma init
[ ] Paste Auth.js models into schema.prisma
[ ] Add Organisation, OrganisationMember, Invitation models (copy from reference app)
[ ] Add app-specific feature models (always include orgId + @@index([orgId]))
[ ] Set up Neon project, copy DATABASE_URL and DIRECT_URL to .env.local
[ ] Generate AUTH_SECRET: openssl rand -base64 32
[ ] Set AUTH_URL=http://localhost:3000 and NEXT_PUBLIC_APP_URL=http://localhost:3000 in .env.local
[ ] Create Google OAuth app, add localhost:3000 + production domain callback URIs
[ ] Set RESEND_API_KEY in .env.local (Resend test key for dev)
[ ] Add "postinstall": "prisma generate" to package.json scripts
[ ] Run: npx prisma migrate dev --name init
[ ] Create /onboarding page + POST /api/organisations route (copy from reference app)
[ ] Create /dashboard page that calls getActiveOrg() and redirects to /onboarding if null
[ ] Run: npm run dev and verify sign-in → onboarding → dashboard flow
[ ] Deploy to Vercel, set all env vars (see §18), add build command: prisma migrate deploy && next build
[ ] Verify security headers at securityheaders.com
[ ] Verify Google OAuth callback URL includes production domain
```
