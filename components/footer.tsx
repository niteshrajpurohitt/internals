"use client";

import { useState } from "react";
import { ShieldCheck, Mail, ExternalLink, X, Terminal } from "lucide-react";
import { Container } from "@/components/container";

export function Footer() {
  const [isDmcaOpen, setIsDmcaOpen] = useState(false);

  return (
    <footer className="mt-24 w-full border-t border-white/[0.06] bg-zinc-950/80 pt-12 pb-16 text-xs text-zinc-400">
      <Container>
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Col 1: Mission & Legal Guardrail */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 font-medium text-zinc-200">
              <Terminal className="h-4 w-4 text-zinc-400" />
              <span>engfeed Index</span>
            </div>
            <p className="max-w-lg leading-relaxed text-zinc-400">
              engfeed indexes public engineering blogs to direct traffic to original authors. We do
              not mirror or paywall full article content; each entry links directly out to canonical
              engineering sources.
            </p>
          </div>

          {/* Col 2: Compliance & Delist */}
          <div className="space-y-2">
            <div className="font-medium text-zinc-300">Legal & Compliance</div>
            <ul className="space-y-1.5 text-zinc-500">
              <li>
                <button
                  onClick={() => setIsDmcaOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-zinc-300"
                >
                  <span>Delist / DMCA Notice</span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-zinc-300"
                >
                  <span>Suggest an Engineering Feed</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-6 font-mono text-[11px] text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500/80" />
            <span>All systems operational • Live aggregation engine</span>
          </div>

          <p>© {new Date().getFullYear()} engfeed. Built for engineering teams.</p>
        </div>
      </Container>

      {/* DMCA / Delist Modal */}
      {isDmcaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-white/[0.1] bg-[#121215] p-6 text-zinc-300 shadow-2xl">
            <button
              onClick={() => setIsDmcaOpen(false)}
              className="absolute top-4 right-4 rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-3 flex items-center gap-2 font-medium text-zinc-100">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Delist & Content Policy</span>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-zinc-400">
              engfeed strictly operates as a directory and discovery platform. We link directly to
              canonical publisher URLs and do not store or scrape original full-text articles.
            </p>

            <p className="mb-6 text-xs leading-relaxed text-zinc-400">
              If you represent an engineering blog publisher and wish to update metadata, modify
              indexing frequency, or delist your engineering feed, please reach out directly:
            </p>

            <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950 p-3">
              <span className="font-mono text-xs text-zinc-300">legal@engfeed.dev</span>
              <a
                href="mailto:legal@engfeed.dev?subject=Delist%20Request%20-%20engfeed"
                className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200 transition-colors hover:bg-zinc-700"
              >
                <Mail className="h-3 w-3" />
                <span>Send Email</span>
              </a>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsDmcaOpen(false)}
                className="cursor-pointer rounded-lg border border-white/[0.08] bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-300 transition-colors hover:text-white"
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
