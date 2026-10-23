# Internals — Product & Engineering Roadmap (v2)

This document tracks planned features, architectural requirements, and design specifications for **Internals v2**.

---

## 1. User Accounts & Personalization (Supabase Auth)

### 1.1 GitHub 1-Click OAuth
- **Auth Provider:** Supabase Auth with GitHub OAuth (standard for developer tools).
- **User Profile Table:** `profiles` table in Supabase linking `auth.users.id` with bookmarks and preferences.

### 1.2 Bookmarks ("Saved" Tab)
- **Functionality:** 
  - Bookmark button on each post card (`Bookmark` icon).
  - Syncs across devices in a `user_bookmarks` Supabase table.
  - Dedicated **"★ Saved"** pill filter in the feed header displaying saved count (e.g. `Saved (4)`).
  - Instant offline fallback via `localStorage` when unauthenticated.

### 1.3 "My Stack" (Follow / Unfollow Companies & Topics)
- **Functionality:**
  - "Follow" toggle on company chips and in company profiles.
  - **"My Stack"** feed mode that filters the general stream to only followed companies and domains.
  - Notification toggle for new landmark posts or postmortems from followed companies.

### 1.4 Community Upvotes (`▲` Signal Ranking)
- **Functionality:**
  - Reddit / Hacker News-style upvote button on post cards.
  - Rate-limited and deduped per user in `post_upvotes` table.
  - New sorting option: **"Top Signal"** (sorted by upvotes over 7d / 30d / All Time) alongside default Chronological feed.

### 1.5 "Mark as Read" & Reading History
- **Functionality:**
  - Optional toggle in header: *"Hide read articles"* for an "inbox zero" reading experience.

---

## 2. Community Submissions ("Submit a Blog / Post")

### 2.1 In-App Submission Modal
- **Trigger:** Accessible via the footer *"Suggest an Engineering Feed"* or top navigation button.
- **Fields:**
  - Company / Team Name (e.g. "Linear", "Figma", "Stripe")
  - Engineering Blog URL (e.g. `https://linear.app/blog/engineering`)
  - RSS / Atom Feed URL (optional, auto-discovered if omitted)
  - Landmark Article URL (optional, for submitting a specific famous postmortem or classic)

### 2.2 Automated RSS & Quality Gate Validation
- **Automated Validation Route:** `/api/submit`
  - Validates feed URL reaches an active XML/Atom endpoint.
  - Evaluates recent articles against `UNIVERSAL_VETO_PATTERNS` to confirm engineering content signal.
  - Enqueues into a `pending_submissions` table for admin review or auto-approval.

---

## 3. Developer Ergonomics & Distribution

### 3.1 Terminal CLI (`npx internals-cli` or `npx internals`)
- Command-line tool to view the top 5 architectural deep dives directly in any terminal:
  ```bash
  npx internals
  npx internals --category distributed
  npx internals --top
  ```
- Uses ink/chalk to render clickable links and ANSI color-coded company tags.

### 3.2 Dynamic OpenGraph Social Previews (`/opengraph-image`)
- Next.js dynamic OG generator creating 1200x630 dark-mode preview cards for Twitter, LinkedIn, and Slack sharing.

### 3.3 Aggregator RSS Feed (`/feed.xml`)
- Public curated RSS endpoint allowing developers to subscribe to `Internals` inside Feedly, NetNewsWire, or Readwise Reader.

---

*Last Updated: October 2026*
