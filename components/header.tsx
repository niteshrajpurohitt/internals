"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useSearch } from "@/lib/search-context";
import { Container } from "./container";

export function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/15 bg-black/90 backdrop-blur-md">
      <Container size="default" className="flex h-13 items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
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

        {/* Blueprint CAD Search Bar */}
        <div className="relative flex h-7 w-32 items-center border border-white/25 bg-black font-mono text-[11px] transition-colors focus-within:border-white">
          <Search className="pointer-events-none ml-2 h-3 w-3 shrink-0 text-white/50" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
                inputRef.current?.blur();
              }
            }}
            placeholder="SEARCH"
            className="h-full w-full bg-transparent px-1.5 text-[11px] text-white placeholder:text-white/40 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mr-1.5 cursor-pointer p-0.5 text-white/50 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </Container>
    </header>
  );
}
