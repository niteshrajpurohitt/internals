// Static placeholder shown while the feed streams in. Mirrors the Feed layout
// (category pills, sub-filters, stacked cards) to avoid layout shift.
const PILL_WIDTHS = ["w-12", "w-16", "w-20", "w-28", "w-40", "w-36", "w-40"];

export function FeedSkeleton() {
  return (
    <div className="w-full space-y-5" aria-busy="true" aria-label="Loading posts">
      <div className="flex w-full items-center gap-1.5 overflow-hidden pb-1">
        {PILL_WIDTHS.map((w, i) => (
          <div
            key={i}
            className={`h-7 shrink-0 animate-pulse border border-neutral-950/10 bg-neutral-950/5 dark:border-white/10 dark:bg-white/5 ${w}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-7 w-36 animate-pulse bg-neutral-950/5 dark:bg-white/5" />
        <div className="h-7 w-36 animate-pulse bg-neutral-950/5 dark:bg-white/5" />
      </div>

      <div className="flex flex-col space-y-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex h-36 animate-pulse flex-col gap-3 border border-neutral-950/10 bg-white p-4.5 sm:p-5 dark:border-white/10 dark:bg-[#111111]"
          >
            <div className="h-4 w-32 bg-neutral-950/5 dark:bg-white/5" />
            <div className="h-5 w-3/4 bg-neutral-950/5 dark:bg-white/5" />
            <div className="h-4 w-1/2 bg-neutral-950/5 dark:bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
