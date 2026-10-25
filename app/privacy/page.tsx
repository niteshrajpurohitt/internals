import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Internals",
  description: "Privacy Policy and data practices for Internals.",
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Container size="default" className="pt-10 pb-16 sm:pt-14 sm:pb-20">
        {/* Navigation link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-950/60 transition-colors hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
          >
            <span>← Back to feed</span>
          </Link>
        </div>

        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 font-mono text-xs text-neutral-950/60 dark:text-white/60">
            Last updated: October 2026
          </p>
        </header>

        {/* Content Box */}
        <div className="cad-crosshair relative max-w-3xl border border-neutral-950/25 bg-white p-6 sm:p-8 dark:border-white/25 dark:bg-[#111111]">
          <div className="space-y-6 font-sans text-sm leading-relaxed text-neutral-950/80 dark:text-white/80">
            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                1. Overview &amp; Zero Tracking
              </h2>
              <p>
                Internals is an engineering blog discovery platform built with privacy by default. We do
                not use third-party advertising trackers, marketing pixels, or telemetry brokers. You can
                browse, search, and filter technical articles completely anonymously without creating an
                account.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                2. Information We Collect
              </h2>
              <p>
                We only collect personal information if you explicitly choose to sign in to sync your saved
                bookmarks:
              </p>
              <ul className="list-inside list-disc space-y-1.5 pl-2 font-sans text-xs sm:text-sm text-neutral-950/70 dark:text-white/70">
                <li>
                  <strong>Account Identification:</strong> When signing in through GitHub or Google OAuth,
                  we receive your email address and authentication ID provided by the respective OAuth
                  provider via Supabase Auth.
                </li>
                <li>
                  <strong>Reading Bookmarks:</strong> We store the post IDs of articles you choose to bookmark
                  so they sync across your browsers and devices.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                3. How We Use Information
              </h2>
              <p>
                Any data collected is used solely to authenticate your account and persist your private
                bookmarks list. We never sell, rent, or share personal data with advertisers or third
                parties. We do not send marketing newsletters or unsolicited emails.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                4. Third-Party Links &amp; Publishers
              </h2>
              <p>
                Internals operates strictly as a directory. When you click an article link, you navigate
                directly to the original publisher’s website (e.g., cloudflare.com, openai.com). Once you
                leave Internals, the privacy practices of that third-party publisher govern your visit.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                5. Data Retention &amp; Deletion
              </h2>
              <p>
                You can sign out at any time. If you wish to delete your account and all associated
                bookmarks permanently from our database, please reach out or open a request on our GitHub
                repository.
              </p>
            </section>
          </div>
        </div>
      </Container>
      <Footer />
    </main>
  );
}
