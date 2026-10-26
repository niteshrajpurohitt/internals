import Link from "next/link";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-[75vh] flex-col items-center justify-center py-16">
      <Container size="default" className="flex flex-col items-center text-center">
        <div className="cad-crosshair relative max-w-md border border-neutral-950/25 bg-white p-6 sm:p-8 dark:border-white/25 dark:bg-[#111111]">
          {/* Header indicator */}
          <div className="mb-4 flex items-center justify-center gap-2 border-b border-neutral-950/15 pb-3 font-mono text-xs dark:border-white/15">
            <Logo className="h-4 w-4 text-neutral-950 dark:text-white" />
            <span className="font-bold tracking-wider text-neutral-950/60 dark:text-white/60">
              404 — Page Not Found
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
            Page Not Located
          </h1>

          <p className="mt-3 font-mono text-xs leading-relaxed text-neutral-950/70 dark:text-white/70">
            The requested engineering directory, article, or resource does not exist or has been relocated.
          </p>

          <div className="mt-6 flex justify-center font-mono text-xs">
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center border border-neutral-950 bg-neutral-950 px-6 font-bold uppercase tracking-wider text-white transition-all hover:bg-neutral-800 active:scale-98 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Back to Feed
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
