# Internals — Launch & Viral Distribution Playbook

This document outlines the strategic playbook to launch **Internals**, reach tens of thousands of developers organically, and convert initial traffic spikes into long-term daily active users.

---

## 1. The Growth Flywheel Overview

```
┌──────────────────────────────────────────────┐
│ Phase 1: The Initial Blast (Days 1–3)        │
│ • Hacker News "Show HN" Launch               │
│ • Open-Source Companion GitHub Repo          │
│ ➔ Target: 15,000–50,000+ Unique Developers   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Phase 2: Retention & Habit (Days 4–30)       │
│ • Chrome / Brave "New Tab" Extension         │
│ • Browser Bookmark / RSS Subscription        │
│ ➔ Turns 1-time visitors into 30x/day users   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Phase 3: B2B Team Spread (Month 2+)          │
│ • Slack / Discord `#engineering` Daily Drop  │
│ ➔ 1 employee installs it = 100+ team users   │
└──────────────────────────────────────────────┘
```

---

## 2. Phase 1: The Hacker News "Show HN" Launch

### 2.1 Why Hacker News Works for Internals
- Hacker News is read daily by engineers, architects, and engineering managers from Google, Meta, Stripe, Netflix, and top tech startups.
- When an engineering project reaches the top 3 of the HN front page, it typically delivers:
  - **15,000 – 50,000+ unique visitors** in the first 24–48 hours.
  - Secondary pickups by newsletters (*TLDR, Pointer, ByteByteGo*) and automated tech social bots.

### 2.2 Optimal Timing
- **Day:** Tuesday or Wednesday (peak HN traffic).
- **Time:** 6:30 AM – 7:30 AM PT (9:30 AM – 10:30 AM ET / 2:30 PM – 3:30 PM UTC).

### 2.3 Headline Formula
HN hates buzzwords, corporate marketing, and hype. It rewards honest engineering stories.

- **Option A (The Story Pitch):**
  > `Show HN: Internals – Engineering blogs without the noise from 38 tier-1 teams`
- **Option B (The Technical Problem Pitch):**
  > `Show HN: I built Internals – an engineering aggregator with universal anti-marketing filters`
- **Option C (The Signal Pitch):**
  > `Show HN: Internals – Systems architecture, deep dives, and postmortems in one place`

### 2.4 The First Comment Template
Post this immediately after submitting the link:
```markdown
Hey HN,

I built Internals because I noticed company engineering blogs (Netflix, Cloudflare, 
Shopify, Uber, etc.) were increasingly burying their deep technical posts under 
product changelogs, PR announcements, and AI marketing sludge.

Key architectural details:
• Universal Veto Filter: Regex and semantic vetoes strip marketing, price updates, 
  and HR fluff before ingestion.
• 7-Pillar Taxonomy: Title-weighted classification across Distributed Systems, 
  Databases, Compilers, Infra, and Web.
• Preserved Classics & Postmortems: Landmark historic breakdowns (Cloudbleed, 
  GitLab backup loss, Vitess scaling) are tagged and preserved.
• Zero Paywalls, Direct Canonical Links: All entries link straight to authors.
• Fair Company Interleaving: Prevents high-volume companies from flooding the feed.

Stack: Next.js 16 (App Router), Supabase (PostgreSQL), Tailwind CSS, Framer Motion.

Would love feedback on missing feeds or false-positive filters.
```

---

## 3. Phase 2: Open Source Companion GitHub Repo

### 3.1 The "Awesome-Engineering-Blogs" Strategy
- Create a public GitHub repository under your profile:
  `awesome-engineering-blogs` or `internals/awesome-engineering-blogs`.
- Include a Markdown table of all 38 indexed companies, their RSS feed endpoints, and sample landmark articles.
- Include a badge at the top:
  `[![Browse Live](https://img.shields.io/badge/Browse_Live-Internals-black?style=for-the-badge)](https://internals.dev)`

### 3.2 Why Developers Star & Share It
- Curated engineering lists frequently reach **10,000–35,000+ GitHub Stars**.
- Developers use stars as permanent bookmarks.
- Tech companies and developer advocates will submit Pull Requests to add their own company's engineering blog, generating organic word-of-mouth.

---

## 4. Phase 3: The Chrome "New Tab" Extension (Daily.dev Model)

### 4.1 The Retention Problem
- A Hacker News spike brings 20,000+ visitors, but 90% forget to return after 3 days.
- A website requires the user to remember a URL. An extension embeds directly into their daily workflow.

### 4.2 The Solution
- A minimalist Chrome / Brave extension (Manifest V3) with a single permission: `chrome_url_overrides.newtab`.
- Whenever an engineer opens a new tab (30–50 times per day), it displays the clean `Internals` stream.
- **Conversion on Site:** A subtle, non-intrusive pill button in the site header:
  `[ + Add to Chrome New Tab ]`

---

## 5. Phase 4: The Team Slack / Discord Integration

### 5.1 The B2B Multiplier
- Instead of acquiring individual users one by one, acquire entire engineering departments.
- A 1-click Slack integration: *"Add Daily Architecture Post to `#engineering`"*.
- **Impact:** 1 engineer installing the bot introduces `Internals` to 50–200 colleagues every morning.

---

## 6. Pre-Launch Readiness Checklist

- [ ] **Custom Domain & HTTPS:** Clean domain (e.g. `internals.dev` or `internals.sh`).
- [ ] **Zero 500 Errors:** Verify `/api/posts` handles high-concurrency read queries under load.
- [ ] **OpenGraph Preview Cards:** Verify links look sharp when shared on Twitter, Slack, and LinkedIn.
- [ ] **Mobile Responsiveness:** Ensure card layouts, filters, and modals render smoothly on mobile browsers.
- [ ] **GitHub Repo Ready:** Companion repository created and linked in the footer.
- [ ] **Chrome Extension Built:** Web Store listing submitted and approved before HN launch day.

---

*Last Updated: October 2026*
