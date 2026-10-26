"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]:", error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <body className="flex min-h-screen items-center justify-center bg-[#080808] p-4 font-mono text-white antialiased">
        <div className="w-full max-w-md border border-white/20 bg-[#111111] p-6 text-center shadow-xl">
          <div className="mb-4 text-xs font-bold tracking-widest text-red-400">
            [CRITICAL_CORE_EXCEPTION]
          </div>
          <h1 className="text-lg font-bold">Fatal System Failure</h1>
          <p className="mt-2 text-xs text-white/60">
            A fatal exception occurred in the root application layout.
          </p>
          {error.digest && (
            <div className="my-3 border border-white/10 bg-black/50 p-2 text-[10px] text-white/40">
              Digest: {error.digest}
            </div>
          )}
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="border border-white bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-neutral-200"
            >
              Reboot Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
