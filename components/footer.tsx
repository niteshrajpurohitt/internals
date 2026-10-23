"use client";

import { useState } from "react";
import { ShieldCheck, Mail, ExternalLink, X, Terminal } from "lucide-react";
import { Container } from "@/components/container";

export function Footer() {
  const [isDmcaOpen, setIsDmcaOpen] = useState(false);

  return (
    <footer className="mt-6 w-full border-t border-white/15 bg-black pt-12 pb-16 font-mono text-xs text-white/60">
      <Container size="default">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Col 1: Mission & Legal Guardrail */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="flex h-5 w-5 items-center justify-center border border-white bg-black text-[10px]">
                IN
              </span>
              <span className="tracking-wider uppercase">Internals Index</span>
            </div>
            <p className="max-w-lg leading-relaxed text-white/60 font-sans text-xs">
              Internals indexes public engineering blogs to direct discovery traffic to original authors. We do
              not mirror or paywall full article content; each entry links directly out to canonical publisher sources.
            </p>
          </div>

          {/* Col 2: Compliance & Delist */}
          <div className="space-y-2">
            <div className="font-bold text-white uppercase">Legal & Compliance</div>
            <ul className="space-y-1.5 text-white/50">
              <li>
                <button
                  type="button"
                  onClick={() => setIsDmcaOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-white underline"
                >
                  <span>[ Delist / DMCA Notice ]</span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/niteshrajpurohitt/internals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-white"
                >
                  <span>Suggest an Engineering Feed</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-[10px] text-white/50 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>|← ALL FEEDS OPERATIONAL • 38 REPOSITORIES LIVE →|</span>
          </div>

          <p>© {new Date().getFullYear()} Internals. Built for engineering teams.</p>
        </div>
      </Container>

      {/* DMCA / Delist Modal */}
      {isDmcaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="cad-crosshair relative w-full max-w-md border border-white bg-black p-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsDmcaOpen(false)}
              className="absolute top-4 right-4 p-1 text-white/50 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-3 flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="uppercase tracking-wider">Delist & Content Policy</span>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-white/70 font-sans">
              Internals strictly operates as a directory and discovery platform. We link directly to
              canonical publisher URLs and do not store or scrape original full-text articles.
            </p>

            <p className="mb-6 text-xs leading-relaxed text-white/70 font-sans">
              If you represent an engineering blog publisher and wish to update metadata, modify
              indexing frequency, or delist your engineering feed, please reach out directly:
            </p>

            <div className="flex items-center justify-between border border-white/30 bg-black p-3">
              <span className="font-mono text-xs text-white">legal@internals.dev</span>
              <a
                href="mailto:legal@internals.dev?subject=Delist%20Request%20-%20Internals"
                className="inline-flex items-center gap-1 border border-white bg-white px-2.5 py-1 text-xs text-black font-bold transition-colors hover:bg-black hover:text-white"
              >
                <Mail className="h-3 w-3" />
                <span>Send Email</span>
              </a>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDmcaOpen(false)}
                className="cursor-pointer border border-white/40 bg-black px-4 py-1.5 text-xs text-white transition-colors hover:border-white hover:bg-white hover:text-black"
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
