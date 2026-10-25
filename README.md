# Internals

> **Engineering Blogs, Without the Noise.**  
> Stop checking dozens of company sites individually. Find technical blogs from top engineering teams, all in one place. Links straight to the source.

🌐 **Live Deployment:** [internals.niteshrajpurohit.in](https://internals.niteshrajpurohit.in)

---

## Overview

Most company blogs are buried beneath marketing announcements, product releases, webinar invites, and executive PR. Finding deep, production-tested systems engineering articles requires digging through dozens of individual sites.

**Internals** aggregates and filters technical writing directly from world-class engineering teams (Cloudflare, OpenAI, Stripe, Uber, Netflix, Figma, Datadog, and 40+ more). 

Every post links directly to the original publisher — zero paywalls, zero full-text scraping, zero algorithms.

---

## Features

- **Strict Signal Filtering**: Automated veto engine that strips out product release notes, sales marketing, funding PR, and HR posts to ensure only deep technical articles make the feed.
- **Categorized Feeds**: Fast client-side filtering across core disciplines:
  - *Classics*
  - *Postmortems & Incident Reviews*
  - *Distributed Systems & Consensus*
  - *Databases & Storage Engines*
  - *Infrastructure & Cloud*
  - *Low-Level Systems & Compilers*
  - *AI & Machine Learning*
- **Cross-Device Bookmarking**: Save articles to your private reading list with GitHub or Google authentication.
- **CAD Architectural Design**: Minimalist technical aesthetic built with custom CAD dimension lines, corner markers, Space Grotesk, and JetBrains Mono.
- **Automated Sync Engine**: Background ingestion pipeline running via GitHub Actions on a 1-hour cron schedule.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19, Server Components)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, `@supabase/ssr`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
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
```

### 4. Database Setup

Run the SQL migration in `supabase/schema.sql` inside your Supabase SQL editor to create the `companies`, `posts`, and `bookmarks` tables with Row Level Security.

### 5. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Project Structure

```text
internals/
├── app/
│   ├── layout.tsx             # Root layout, metadata, font definitions
│   ├── page.tsx               # Homepage feed (ISR revalidated)
│   ├── opengraph-image.tsx    # Dynamic 1200x630 OpenGraph generator
│   └── api/
│       └── sync/              # Ingest & RSS sync route handler
├── components/
│   ├── feed.tsx               # Interactive search, category & duration filters
│   ├── post-card.tsx          # Technical article card with bookmark toggle
│   ├── header.tsx             # Sticky navbar, search trigger, auth modal
│   └── footer.tsx             # Fair use notice, privacy & delist modals
├── lib/
│   ├── rss.ts                 # Feed parser, company sources & veto regexes
│   ├── supabase.ts            # Public read queries (posts, companies)
│   ├── supabase-browser.ts    # Client-side singleton auth client
│   └── supabase-server.ts     # Cookie-based SSR server client
└── supabase/
    └── schema.sql             # Database schema, indexes & RLS policies
```

---

## Content & Fair Use Policy

Internals operates strictly as an index and discovery directory. We link directly out to original publisher URLs and do not mirror, cache, or paywall full-text articles. 

If you represent an engineering blog and wish to update metadata, modify indexing frequency, or delist your feed, please [open a GitHub Delist Request](https://github.com/niteshrajpurohitt/internals/issues/new?title=Delist+Request:+[Company+Name]).
