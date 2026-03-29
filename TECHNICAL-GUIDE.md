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
7. [Environment Variables](#7-environment-variables)
8. [Next.js Configuration](#8-nextjs-configuration)
9. [Data Layer Patterns](#9-data-layer-patterns)
10. [Content — MDX / Markdown Blog](#10-content--mdx--markdown-blog)
11. [Static vs Dynamic Rendering](#11-static-vs-dynamic-rendering)
12. [SEO & Metadata](#12-seo--metadata)
13. [Analytics & Performance](#13-analytics--performance)
14. [Security Headers](#14-security-headers)
15. [Deployment — Vercel](#15-deployment--vercel)
16. [Development Workflow](#16-development-workflow)
17. [Adding a New App to the Suite](#17-adding-a-new-app-to-the-suite)

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
| OAuth providers | Google (primary), GitHub (secondary) | — |
| Styling | **CSS Modules** + global CSS variables | — |
| Fonts | Google Fonts via `next/font` | — |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-highlight` + `rehype-raw` | — |
| Front matter | `gray-matter` | `^4` |
| Syntax highlight | `highlight.js` | `^11` |
| Analytics | **Vercel Analytics** + **Vercel Speed Insights** | — |
| Hosting | **Vercel** | — |
| Linting | ESLint + `eslint-config-next` | `^8` / `^14.2` |

**TypeScript note:** `lib/prisma.ts` is `.ts` (Prisma singleton requires it). All other files are `.js` / `.jsx`. Do not convert app code to TypeScript — keep this convention.

---

## 2. Project Bootstrap

```bash
# 1. Create Next.js app (App Router, no src/ dir, no Tailwind)
npx create-next-app@14 my-app --app --no-src-dir --no-tailwind --eslint --import-alias "@/*"

cd my-app

# 2. Install production dependencies
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client \
  @vercel/analytics @vercel/speed-insights \
  gray-matter react-markdown remark-gfm rehype-highlight rehype-raw highlight.js

# 3. Install dev tools
npm install -D eslint eslint-config-next

# 4. Initialise Prisma
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
├── app/                        ← Next.js App Router pages & layouts
│   ├── layout.js               ← Root layout: fonts, nav, footer, providers
│   ├── page.js                 ← Home page
│   ├── not-found.js            ← Global 404
│   ├── opengraph-image.jsx     ← Dynamic OG image
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/  ← Auth.js catch-all route handler
│   │           └── route.js
│   ├── signin/
│   │   ├── page.js
│   │   └── page.module.css
│   ├── blog/
│   │   ├── page.js
│   │   ├── page.module.css
│   │   └── [slug]/
│   │       ├── page.js
│   │       └── page.module.css
│   └── [feature]/              ← One folder per major feature area
│       ├── page.js
│       └── page.module.css
│
├── components/                 ← Shared UI components
│   ├── Nav.jsx + Nav.module.css
│   ├── Footer.jsx + Footer.module.css
│   ├── AuthSessionProvider.jsx ← 'use client' SessionProvider wrapper
│   └── [Component].jsx + [Component].module.css
│
├── content/                    ← File-based content
│   └── blog/
│       └── *.mdx               ← Blog posts (frontmatter + markdown)
│
├── lib/                        ← Server-side utilities and data
│   ├── prisma.ts               ← Prisma singleton (TypeScript)
│   ├── blog.js                 ← Blog content helpers (getAllPosts, getPostBySlug)
│   └── [feature]-data.js       ← Static data files (no DB calls)
│
├── prisma/
│   └── schema.prisma           ← Database schema
│
├── styles/
│   ├── globals.css             ← Design tokens + global utility classes
│   └── animations.css          ← Keyframes + animation utilities
│
├── public/
│   ├── robots.txt
│   └── sitemap.xml
│
├── auth.js                     ← Auth.js v5 config (root level)
├── jsconfig.json               ← Path alias @/* → ./*
├── next.config.js              ← Security headers, redirects, externals
├── .env.local                  ← Secrets (never commit)
└── package.json
```

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

model User {
  id            String    @id @default(cuid())   // always cuid(), not uuid()
  email         String    @unique
  emailVerified DateTime?
  image         String?
  plan          String    @default("free")        // subscription tier
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Auth.js required relations
  accounts  Account[]
  sessions  Session[]
}

// Auth.js required models — copy verbatim
model Account { ... }
model Session { ... }
model VerificationToken { ... }

// App-specific models — add below the Auth.js block
model Workspace {
  id        String   @id @default(cuid())
  userId    String
  name      String   @default("My Workspace")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ToolResult {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String
  toolId      String
  phase       String
  inputData   Json?
  outputData  Json?
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(...)
  user        User      @relation(...)
}

model UsageEvent {
  id        String   @id @default(cuid())
  userId    String
  toolId    String
  phase     String
  action    String
  metadata  Json?
  createdAt DateTime @default(now())
  user      User     @relation(...)
}
```

**Conventions:**
- IDs: `@id @default(cuid())` — never auto-increment integers, never raw UUID
- Timestamps: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` on every model
- Cascades: always `onDelete: Cascade` on foreign keys that belong to a User
- Flexible data: use `Json?` for variable tool inputs/outputs rather than many nullable columns
- Plan/tier field: `plan String @default("free")` on User for access control

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

```js
// auth.js
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@/lib/prisma'

const providers = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }))
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }))
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: { signIn: '/signin' },
  providers,
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id   = user.id
        session.user.plan = user.plan   // expose plan to client
      }
      return session
    },
  },
})
```

**Guard providers with env checks** — if an OAuth secret is missing the provider is simply not registered. The sign-in page checks `Boolean(process.env.GOOGLE_CLIENT_ID && ...)` before rendering each button.

### Route handler — `app/api/auth/[...nextauth]/route.js`

```js
// app/api/auth/[...nextauth]/route.js
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
1. Calls `await auth()` — if already signed in, redirects immediately to `/platform`
2. Renders a `<form action={async () => { 'use server'; await signIn('google', ...) }}>` for each OAuth provider
3. Shows error messages from `searchParams.error`

```js
// app/signin/page.js
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'

export default async function SignInPage({ searchParams }) {
  const session = await auth()
  if (session) redirect('/platform')

  return (
    <form action={async () => {
      'use server'
      await signIn('google', { redirectTo: '/platform' })
    }}>
      <button type="submit">Sign in with Google</button>
    </form>
  )
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

## 7. Environment Variables

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

# ── Google OAuth ──────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# ── GitHub OAuth (optional) ───────────────────────────────────────────
GITHUB_CLIENT_ID=Ov23liXXX
GITHUB_CLIENT_SECRET=xxx
```

**Vercel:** Add all of these in Project → Settings → Environment Variables. Set them for Production, Preview, and Development environments.

**Generating `AUTH_SECRET`:**
```bash
openssl rand -base64 32
# or: npx auth secret
```

---

## 8. Next.js Configuration

```js
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',        value: '1; mode=block' },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://plausible.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://plausible.io https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
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
    return [
      // Add permanent redirects here for moved pages
    ]
  },
}

module.exports = nextConfig
```

**Critical:** `serverComponentsExternalPackages: ['@prisma/client', 'prisma']` must be present. Without it, Prisma is bundled into the client bundle and the build breaks.

**CSP note:** If you add a third-party script (e.g., analytics, fonts), add its origin to the relevant `script-src` or `connect-src` directive. Never use `'unsafe-eval'`.

---

## 9. Data Layer Patterns

### Pattern 1 — Static data files (no DB)

Use plain JS files in `lib/` for data that doesn't need to be stored or queried:

```js
// lib/tools-data.js
export const showcaseTools = [
  { id: 'tool-id', type: 'webapp', phase: 'discover', name: '...', description: '...' },
]

export const phaseSummary = { discover: { count: 20, label: '...' } }
```

Import directly in Server Components — no `async`, no fetch, no DB call.

### Pattern 2 — Prisma queries in Server Components

```js
// app/platform/page.js  (Server Component)
import { prisma } from '@/lib/prisma'
import { auth }   from '@/auth'

export default async function PlatformPage() {
  const session   = await auth()
  const workspace = await prisma.workspace.findFirst({
    where: { userId: session.user.id },
  })
  return <div>{workspace.name}</div>
}
```

Never import `prisma` in a Client Component (`'use client'`). Use a Server Component parent to fetch, then pass data down as props.

### Pattern 3 — API Routes for mutations

For form submissions and write operations, use Route Handlers:

```js
// app/api/tool-result/route.js
import { NextResponse } from 'next/server'
import { auth }         from '@/auth'
import { prisma }       from '@/lib/prisma'

export async function POST(req) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const result = await prisma.toolResult.create({
    data: {
      userId:      session.user.id,
      workspaceId: body.workspaceId,
      toolId:      body.toolId,
      phase:       body.phase,
      inputData:   body.inputData,
      outputData:  body.outputData,
    },
  })
  return NextResponse.json(result)
}
```

### Pattern 4 — Server Actions

For simple form submissions (sign-in, single-field updates), use Server Actions inline in Server Components — no separate route file needed. See the sign-in page pattern in §6.

---

## 10. Content — MDX / Markdown Blog

Blog posts live in `content/blog/` as `.mdx` or `.md` files with YAML front matter.

### Frontmatter schema

```yaml
---
title: "Post Title Here"
date: "2026-03-29"       # ISO date, used for sorting
phase: "govern"          # discover | design | build | govern | scale | general
excerpt: "One sentence."
readingTime: "8 min read"
author: "SpanForge"
---
```

### Content helpers — `lib/blog.js`

```js
import fs     from 'fs'
import path   from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export function getAllPosts() {
  // reads all .md and .mdx files, returns frontmatter sorted by date desc
}

export function getPostBySlug(slug) {
  // returns frontmatter + content string for a single post
}

export function getAllSlugs() {
  // returns slug array for generateStaticParams
}
```

### Blog post page rendering

```js
// app/blog/[slug]/page.js
import ReactMarkdown from 'react-markdown'
import remarkGfm     from 'remark-gfm'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export default async function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug)
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {post.content}
    </ReactMarkdown>
  )
}
```

`generateStaticParams` makes all blog posts **statically generated at build time** — no server round-trip for readers.

---

## 11. Static vs Dynamic Rendering

| Route | Strategy | Why |
|---|---|---|
| `/` home | Static | No user data |
| `/platform` | Static | Phase data is static |
| `/platform/[phase]` | Static | Phase content is static |
| `/tools` | Static (client filter) | Tool list is static JS |
| `/blog` | Static | File-system posts |
| `/blog/[slug]` | Static (`generateStaticParams`) | Pre-rendered at build |
| `/signin` | Dynamic | Reads session |
| `/platform/[phase]/[tool]` | Dynamic | User workspace data |
| `/api/auth/[...nextauth]` | Dynamic | Session management |
| `/api/*` | Dynamic | Mutations |

**Default to static.** Mark a page as dynamic only when it reads session data or performs database queries per-request.

```js
// Force dynamic if needed
export const dynamic = 'force-dynamic'
```

---

## 12. SEO & Metadata

### Root metadata (`app/layout.js`)

```js
export const metadata = {
  metadataBase: new URL('https://your-domain.com'),
  title: {
    template: '%s — AppName',
    default: 'AppName — Tagline',
  },
  description: '...',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    type: 'website',
    siteName: 'AppName',
    title: 'AppName — Tagline',
    description: '...',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@twitterhandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}
```

### Per-page metadata

```js
// Every page.js (static)
export const metadata = {
  title: 'Page Title',                // renders as "Page Title — AppName"
  description: 'Page description.',
}

// Blog / dynamic pages
export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: 'article', publishedTime: post.date },
  }
}
```

### Sitemap and robots

Maintain `public/sitemap.xml` and `public/robots.txt` manually, or use Next.js file conventions (`app/sitemap.js`, `app/robots.js`) for large dynamic sites.

```
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://your-domain.com/sitemap.xml
```

Exclude auth routes from indexing:
```js
// app/signin/page.js
export const metadata = { robots: { index: false } }
```

---

## 13. Analytics & Performance

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

## 14. Security Headers

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

## 15. Deployment — Vercel

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
- [ ] OAuth redirect URIs include the production domain
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

## 16. Development Workflow

### First-time setup

```bash
git clone <repo>
cd <repo>
npm install

# Copy env template (create .env.local from .env.example)
cp .env.example .env.local
# Fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, GOOGLE_CLIENT_ID, etc.

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

## 17. Adding a New App to the Suite

When starting a new SpanForge sub-app (e.g., `agentobs-app`, `llmdiff-app`):

### Shared across all apps

These are **identical** in every app — copy without modification:

```
lib/prisma.ts              ← Prisma singleton
styles/globals.css         ← Design tokens
styles/animations.css      ← Animation utilities
components/Nav.jsx + .css  ← Navigation (update links only)
components/Footer.jsx + .css ← Footer (update columns only)
components/AuthSessionProvider.jsx
next.config.js             ← Security headers block
auth.js                    ← Auth config structure (update providers as needed)
jsconfig.json              ← Path aliases
```

### Per-app customization

| File | What changes |
|---|---|
| `prisma/schema.prisma` | App-specific models below the Auth.js block |
| `app/layout.js` | App name, description, twitter handle, metadataBase URL |
| `components/Nav.jsx` | Link array |
| `components/Footer.jsx` | Column structure |
| `lib/[feature]-data.js` | App-specific static data |
| `.env.local` | Fresh `AUTH_SECRET`, same Neon DB or new Neon project, new OAuth app IDs |
| `public/robots.txt` | App domain |
| `public/sitemap.xml` | App routes |

### Shared Neon database vs separate

**Option A — One Neon project per app (recommended for isolation):**  
Create a new Neon project per app. Use the same Auth.js User model so users sign in with Google/GitHub and get separate User rows per app.

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
[ ] Copy prisma.ts, globals.css, animations.css, Nav, Footer, AuthSessionProvider
[ ] Copy auth.js, next.config.js, jsconfig.json
[ ] Initialise Prisma: npx prisma init
[ ] Paste Auth.js models into schema.prisma, add app-specific models
[ ] Set up Neon project, copy DATABASE_URL and DIRECT_URL to .env.local
[ ] Generate AUTH_SECRET: openssl rand -base64 32
[ ] Create Google OAuth app, add localhost + prod redirect URIs
[ ] Add "postinstall": "prisma generate" to package.json scripts
[ ] Run: npx prisma migrate dev --name init
[ ] Run: npm run dev and verify sign-in works
[ ] Deploy to Vercel, set all env vars, add build command with migrate deploy
[ ] Verify security headers at securityheaders.com
```
