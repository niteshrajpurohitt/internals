"use client";

import Link from "next/link";
import { Container } from "./container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/15 bg-black/90 backdrop-blur-md">
      <Container size="default" className="flex h-13 items-center justify-between">
        {/* Brand */}
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
        </div>
      </Container>
    </header>
  );
}
