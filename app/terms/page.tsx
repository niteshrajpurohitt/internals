import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service — Internals",
  description: "Terms of Service and acceptable use policy for Internals.",
};

export default function TermsPage() {
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
            Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Internals (internals.niteshrajpurohit.in), you agree to be bound by
                these Terms of Service. If you do not agree with any part of these terms, you may not use the
                service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                2. Service Description &amp; Fair Use
              </h2>
              <p>
                Internals is an index and discovery directory for public technical engineering blogs. We
                aggregate public RSS feeds and metadata, and route readers directly to original author
                publications. We do not mirror, store, copy, or paywall original full-text articles. All
                intellectual property, trademarks, and copyright remain with the respective authors and
                publishers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                3. User Accounts &amp; Authentication
              </h2>
              <p>
                You may access most features without an account. If you sign in via GitHub or Google OAuth to
                save bookmarks, you are responsible for maintaining the security of your third-party account
                credentials.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                4. Feed Delisting &amp; Content Removal
              </h2>
              <p>
                If you are an author, engineering team representative, or copyright holder and wish to have
                your feed modified, removed, or delisted from our index, you may submit a request via our
                GitHub repository issues or contact us directly. Requests are honored promptly.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
                5. Disclaimer of Warranties
              </h2>
              <p>
                Internals is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without
                warranties of any kind. We do not guarantee uninterrupted availability, error-free
                operation, or the accuracy of third-party content linked from our service.
              </p>
            </section>
          </div>
        </div>
      </Container>
      <Footer />
    </main>
  );
}
