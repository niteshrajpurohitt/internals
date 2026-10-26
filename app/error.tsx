"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Runtime Error Boundary caught]:", error);
  }, [error]);

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center py-16">
      <Container size="default" className="flex flex-col items-center text-center">
        <div className="cad-crosshair relative max-w-lg border border-neutral-950/25 bg-white p-6 sm:p-8 dark:border-white/25 dark:bg-[#111111]">
          {/* Header indicator */}
          <div className="mb-4 flex items-center justify-center gap-2 border-b border-neutral-950/15 pb-3 font-mono text-xs dark:border-white/15">
            <Logo className="h-4 w-4 text-neutral-950 dark:text-white" />
            <span className="font-bold tracking-wider text-red-600 dark:text-red-400">
              SYS_FAULT: RUNTIME_EXCEPTION
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl dark:text-white">
            Something unexpected interrupted the feed
          </h1>

          <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-950/70 dark:text-white/70">
            A client or network exception prevented this page from rendering properly. You can attempt an
            in-place recovery or return to the main feed.
          </p>

          {error.digest && (
            <div className="mt-4 border border-dashed border-neutral-950/20 bg-[#f4f3ef]/80 p-2 font-mono text-[11px] text-neutral-950/60 dark:border-white/20 dark:bg-[#080808]/80 dark:text-white/60">
              Error Digest: {error.digest}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-9 cursor-pointer items-center justify-center border border-neutral-950 bg-neutral-950 px-5 font-bold uppercase tracking-wider text-white transition-all hover:bg-neutral-800 active:scale-98 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Retry Connection
            </button>

            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center border border-neutral-950/25 bg-white px-5 font-bold uppercase tracking-wider text-neutral-950 transition-colors hover:border-neutral-950 dark:border-white/25 dark:bg-[#111111] dark:text-white dark:hover:border-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
