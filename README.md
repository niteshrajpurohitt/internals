# Internals

> **Engineering Blogs, Without the Noise.**  
> Stop checking dozens of company sites individually. Find technical blogs from top engineering teams, all in one place. Links straight to the source.

🌐 **Live Deployment:** [internals.niteshrajpurohit.in](https://internals.niteshrajpurohit.in)

---

## Overview

Most company blogs are buried beneath marketing announcements, product releases, webinar invites, and executive PR. Finding deep, production-tested systems engineering articles requires digging through dozens of individual sites.

**Internals** aggregates and filters technical writing directly from world-class engineering teams (Cloudflare, OpenAI, Stripe, Uber, Netflix, Figma, Datadog, and 40+ more).

Every post links directly to the original publisher — zero paywalls, zero full-text scraping.

---

## Features

- **Strict Signal Filtering**: Automated veto engine that strips out product release notes, sales marketing, funding PR, and HR posts to ensure only deep technical articles make the feed.
- **Categorized Feeds**: Fast client-side and server-side filtering across core disciplines:
  - _Classics_
  - _Postmortems_
  - _AI & Machine Learning_
  - _Distributed Systems_
  - _Databases & Storage_
  - _Infrastructure & Cloud_
  - _Low-Level & Compilers_
  - _Web & Platforms_
- **PostgreSQL Full-Text Search (FTS)**: Native `tsvector` weighted search (titles `A`, tags `B`, summary `C`) backed by a GIN index, with multi-word company matching and regex word-boundary fallback.
- **Duration & Company Filtering**: Narrow articles by estimated reading time (_< 5 min_, _5 - 10 min_, _10+ min_) or isolate posts by engineering publication via the company selector.
- **Publisher Favicon Proxy & Edge Caching**: Dedicated `/api/favicon` route serving 64px publisher icons with a 30-day edge CDN cache TTL to reduce latency and protect client privacy.
- **Smart Feed Interleaving**: Company-aware round-robin feed distribution that ensures high-volume publications do not dominate the main feed.
- **Cross-Device Bookmarking**: Save articles to your private reading list with GitHub or Google authentication, featuring physics-based stacked toasts and an animated rolling saved counter.
- **CAD Architectural Design**: Minimalist technical aesthetic built with custom CAD dimension lines, corner markers, Space Grotesk, and JetBrains Mono.
- **Automated Sync Engine**: Background ingestion pipeline running via GitHub Actions on a 6-hour cron schedule with secure bearer token authorization.
- **High-Concurrency Edge Caching**: Native Vercel Edge caching with `stale-while-revalidate` on feed APIs to protect PostgreSQL database connections during viral traffic spikes.
- **Privacy-Friendly Analytics**: Built-in Vercel Analytics tracking pageviews and referrers with zero tracking cookies.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19, Server Components)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, `@supabase/ssr`)
- **Feed Ingestion**: [rss-parser](https://github.com/rbren/rss-parser) + custom scraping handlers
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)
- **Security**: Content Security Policy (CSP), `X-Frame-Options: DENY`, strict referrer policies
- **Typography**: Space Grotesk & JetBrains Mono

---

## Getting Started

### Prerequisites

- Node.js `v20+` or `v22+`
- A free [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/niteshrajpurohitt/internals.git
cd internals
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SYNC_SECRET=your-secure-random-secret-for-cron-sync
```

> **Note on `SYNC_SECRET`**: Protects the `/api/sync` endpoint from unauthorized triggers. Must match the `SYNC_SECRET` repository secret configured in your GitHub Actions workflow.

### 4. Database Setup

Run the SQL migration in `supabase/schema.sql` inside your Supabase SQL editor to create the `companies`, `posts` (with full-text search `tsvector` column and GIN index), `user_bookmarks`, and `profiles` tables with Row Level Security.

### 5. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Content & Fair Use Policy

Internals operates strictly as an index and discovery directory. We link directly out to original publisher URLs and do not mirror, cache, or paywall full-text articles.

If you represent an engineering blog and wish to update metadata, modify indexing frequency, or delist your feed, please [open a GitHub Delist Request](https://github.com/niteshrajpurohitt/internals/issues/new?title=Delist+Request:+[Company+Name]).
