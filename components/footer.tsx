"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/container";
import TechText from "@/components/tech-text";

export function Footer() {
  const [activeModal, setActiveModal] = useState<"privacy" | "delist" | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  return (
    <footer className="relative mt-16 w-full overflow-hidden border-t border-neutral-950/15 bg-[#f4f3ef] font-mono text-xs text-neutral-950/70 dark:border-white/15 dark:bg-[#080808] dark:text-white/70">
      <Container size="default" className="pt-8 pb-5">
        {/* Single row: tagline left, links+copyright right */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          {/* Left: tagline only */}
          <p className="max-w-xs font-sans text-[11px] leading-relaxed text-neutral-950/50 dark:text-white/50">
            Technical blogs from top engineering teams.
            <br />
            Direct links straight to the source.
          </p>

          {/* Right: links + copyright stacked */}
          <div className="flex flex-col items-start gap-2.5 md:items-end">
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <a
                href="https://github.com/niteshrajpurohitt/internals"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-neutral-950 dark:hover:text-white"
              >
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <span className="text-neutral-950/20 dark:text-white/20">·</span>
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="cursor-pointer transition-colors hover:text-neutral-950 dark:hover:text-white"
              >
                Privacy
              </button>
              <span className="text-neutral-950/20 dark:text-white/20">·</span>
              <button
                type="button"
                onClick={() => setActiveModal("delist")}
                className="cursor-pointer transition-colors hover:text-neutral-950 dark:hover:text-white"
              >
                Delist
              </button>
            </div>
            <span className="text-[10px] text-neutral-950/35 dark:text-white/35">
              © {new Date().getFullYear()} Internals. All rights reserved.
            </span>
          </div>
        </div>
      </Container>

      {/* Full-bleed interactive wordmark */}
      <div className="opacity-[0.15]" style={{ height: "clamp(3rem, 14vw, 12rem)" }}>
        <TechText
          text="Internals"
          fontWeight={700}
          fontSize={220}
          letterSpacing={-0.05}
          reveal="letter"
          dashLength={4}
          dashGap={2}
          strokeWidth={2}
          specks={6}
          selection={true}
          labels={false}
          draggable={false}
          clickKick={true}
          intro="none"
          sweep={false}
          speed={0.6}
          guides={false}
        />
      </div>

      {/* Privacy Policy Modal */}
      {activeModal === "privacy" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f3ef]/80 p-4 backdrop-blur-xs animate-in fade-in duration-150 dark:bg-[#080808]/85"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cad-crosshair relative w-full max-w-md border border-neutral-950/25 bg-white px-5 pb-6 pt-3 shadow-2xl sm:px-6 dark:border-white/25 dark:bg-[#111111]"
          >
            {/* Top Header: Simple Text Close matching Login Modal */}
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="cursor-pointer font-mono text-xs leading-none text-neutral-950/60 transition-colors hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Framed Content Box */}
            <div className="flex w-full flex-col border border-dashed border-neutral-950/20 bg-[#f4f3ef]/60 p-4 sm:p-5 dark:border-white/20 dark:bg-[#080808]/70">
              <div className="space-y-3 font-sans text-xs leading-relaxed text-neutral-950/80 dark:text-white/80">
                <p>
                  <strong className="text-neutral-950 dark:text-white">Zero Tracking:</strong> We do not use third-party analytics trackers, advertising pixels, or selling of personal data. Browsing the feed is completely anonymous.
                </p>
                <p>
                  <strong className="text-neutral-950 dark:text-white">Authentication &amp; Bookmarks:</strong> When you sign in via GitHub or Google, we store only your email address and authentication ID to securely save and sync your bookmarked articles across devices.
                </p>
                <p>
                  <strong className="text-neutral-950 dark:text-white">External Links:</strong> Clicking an article takes you directly to the original publisher’s domain, which operates under their respective privacy policies.
                </p>
                <p>
                  <strong className="text-neutral-950 dark:text-white">Data Deletion:</strong> You can sign out at any time. To request complete deletion of your account and saved bookmarks, open an issue or reach out directly.
                </p>
              </div>
            </div>

            {/* Bottom Heading matching Login Modal */}
            <div className="mt-3.5 text-left">
              <h2 className="text-xl font-bold tracking-tight text-neutral-950 leading-none dark:text-white">
                Privacy Policy
              </h2>
            </div>
            <p className="mt-2 text-left font-mono text-[11px] text-neutral-950/60 dark:text-white/60">
              Zero tracking. Zero ads. Your bookmarks stay private.
            </p>
          </div>
        </div>
      )}

      {/* Delist / Content Removal Policy Modal */}
      {activeModal === "delist" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f3ef]/80 p-4 backdrop-blur-xs animate-in fade-in duration-150 dark:bg-[#080808]/85"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cad-crosshair relative w-full max-w-md border border-neutral-950/25 bg-white px-5 pb-5 pt-2.5 shadow-2xl sm:px-6 sm:pb-6 sm:pt-3 dark:border-white/25 dark:bg-[#111111]"
          >
            {/* Top Header: Simple Text Close matching Login Modal */}
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="cursor-pointer font-mono text-xs leading-none text-neutral-950/60 transition-colors hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Framed Content Box */}
            <div className="flex w-full flex-col border border-dashed border-neutral-950/20 bg-[#f4f3ef]/60 p-4 sm:p-5 dark:border-white/20 dark:bg-[#080808]/70">
              <div className="space-y-3 font-sans text-xs leading-relaxed text-neutral-950/80 dark:text-white/80">
                <p>
                  <strong className="text-neutral-950 dark:text-white">Discovery Index:</strong> Internals functions strictly as a discovery directory. We index public RSS feeds and route all discovery traffic directly to the original author’s publication site.
                </p>
                <p>
                  <strong className="text-neutral-950 dark:text-white">No Full-Text Mirrors:</strong> We do not mirror or paywall full article content. If you represent an engineering blog publisher and would like your feed modified or removed from our index, please let us know below.
                </p>
              </div>
            </div>

            {/* Heading matching Login Modal */}
            <div className="mt-3.5 text-left">
              <h2 className="text-xl font-bold tracking-tight text-neutral-950 leading-none dark:text-white">
                Delist &amp; Feed Policy
              </h2>
            </div>

            <div className="mt-3 flex flex-col gap-2 font-mono text-xs">
              <a
                href="https://github.com/niteshrajpurohitt/internals/issues/new?title=Delist+Request:+[Company+Name]&body=**Company+/+Blog+Name:**%0A%0A**Feed+URL:**%0A%0A**Reason+/+Notes:**%0A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 border border-neutral-950/25 bg-neutral-950 font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-white/25 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
              >
                <span>Open GitHub Delist Request</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <p className="text-center font-mono text-[11px] text-neutral-950/60 dark:text-white/60">
                Requests are typically processed within 48 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
