"use client";

import { useState } from "react";
import { ShieldCheck, Mail, ExternalLink, X } from "lucide-react";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

export function Footer() {
  const [isDmcaOpen, setIsDmcaOpen] = useState(false);

  return (
    <footer className="mt-6 w-full border-t border-neutral-950/15 bg-[#f4f3ef] pt-12 pb-16 font-mono text-xs text-neutral-950/60 dark:border-white/15 dark:bg-black dark:text-white/60">
      <Container size="default">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Col 1 */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-neutral-950 dark:text-white">
              <Logo className="h-4 w-4 text-neutral-950 dark:text-white" size={16} />
              <span className="tracking-wider uppercase">Internals Index</span>
            </div>
            <p className="max-w-lg font-sans text-xs leading-relaxed text-neutral-950/60 dark:text-white/60">
              Internals indexes public engineering blogs to direct discovery traffic to original authors. We do
              not mirror or paywall full article content; each entry links directly out to canonical publisher sources.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-bold uppercase text-neutral-950 dark:text-white">Legal &amp; Compliance</div>
            <ul className="space-y-1.5 text-neutral-950/50 dark:text-white/50">
              <li>
                <button
                  type="button"
                  onClick={() => setIsDmcaOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-1 underline transition-opacity hover:opacity-80"
                >
                  <span>[ Delist / DMCA Notice ]</span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/niteshrajpurohitt/internals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
                >
                  <span>Suggest an Engineering Feed</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-950/15 pt-6 text-[10px] text-neutral-950/50 sm:flex-row dark:border-white/15 dark:text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-950/50 dark:bg-white/50" />
            <span>|← ALL FEEDS OPERATIONAL • 38 REPOSITORIES LIVE →|</span>
          </div>
          <p>© {new Date().getFullYear()} Internals. Built for engineering teams.</p>
        </div>
      </Container>

      {/* DMCA Modal */}
      {isDmcaOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f3ef]/80 p-4 backdrop-blur-xs dark:bg-black/80"
          onClick={() => setIsDmcaOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cad-crosshair relative w-full max-w-md border border-neutral-950 bg-white p-6 text-neutral-950 shadow-2xl dark:border-white dark:bg-black dark:text-white"
          >
            <button
              type="button"
              onClick={() => setIsDmcaOpen(false)}
              className="absolute right-4 top-4 p-1 text-neutral-950/50 transition-opacity hover:opacity-80 dark:text-white/50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-3 flex items-center gap-2 font-bold text-neutral-950 dark:text-white">
              <ShieldCheck className="h-5 w-5" />
              <span className="uppercase tracking-wider">Delist &amp; Content Policy</span>
            </div>

            <p className="mb-4 font-sans text-xs leading-relaxed text-neutral-950/70 dark:text-white/70">
              Internals strictly operates as a directory and discovery platform. We link directly to
              canonical publisher URLs and do not store or scrape original full-text articles.
            </p>

            <p className="mb-6 font-sans text-xs leading-relaxed text-neutral-950/70 dark:text-white/70">
              If you represent an engineering blog publisher and wish to update metadata, modify
              indexing frequency, or delist your engineering feed, please reach out directly:
            </p>

            <div className="flex items-center justify-between border border-neutral-950/30 bg-[#f4f3ef] p-3 dark:border-white/30 dark:bg-neutral-950">
              <span className="font-mono text-xs text-neutral-950 dark:text-white">legal@internals.dev</span>
              <a
                href="mailto:legal@internals.dev?subject=Delist%20Request%20-%20Internals"
                className="inline-flex items-center gap-1 border border-neutral-950 bg-neutral-950 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-100"
              >
                <Mail className="h-3 w-3" />
                <span>Send Email</span>
              </a>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDmcaOpen(false)}
                className="cursor-pointer border border-neutral-950/40 bg-white px-4 py-1.5 text-xs text-neutral-950 transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white dark:border-white/40 dark:bg-black dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
