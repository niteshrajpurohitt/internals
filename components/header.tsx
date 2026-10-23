"use client";

import Link from "next/link";
import { Container } from "./container";
import { Radio } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/15 bg-black/90 backdrop-blur-md">
      {/* Top Coordinate Ruler Axis */}
      <div className="hidden border-b border-white/[0.07] py-0.5 text-center font-mono text-[9px] tracking-[0.25em] text-white/30 sm:block">
        [ 01 &nbsp;·&nbsp; 02 &nbsp;·&nbsp; 03 &nbsp;·&nbsp; 04 &nbsp;·&nbsp; 05 &nbsp;·&nbsp; 06 &nbsp;·&nbsp; 07 ]
      </div>

      <Container size="wide" className="flex h-13 items-center justify-between">
        {/* Brand & Live Dimension Status */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-85"
          >
            <span className="flex h-6 w-6 items-center justify-center border border-white bg-black font-mono text-xs font-bold text-white shadow-xs">
              ef
            </span>
            <span className="font-mono text-sm font-bold tracking-tight">engfeed</span>
          </Link>

          <div className="hidden items-center gap-1.5 border border-white/20 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-white/70 sm:inline-flex">
            <Radio className="h-2.5 w-2.5 animate-pulse text-white" />
            <span>|← 38 FEEDS INDEXED →|</span>
          </div>
        </div>

        {/* Right Actions: GitHub Companion Repo */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/niteshrajpurohitt/techfeed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-white/20 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-white/80 transition-colors hover:border-white hover:bg-white hover:text-black"
            title="View companion repository on GitHub"
          >
            <svg
              className="h-3.5 w-3.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>[ GITHUB ]</span>
          </a>
        </div>
      </Container>
    </header>
  );
}
