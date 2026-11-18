import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { PostWithCompany } from "@/lib/types";
import { Container } from "./container";
import { Footer } from "./footer";
import { PostCard } from "./post-card";

interface ListingPageProps {
  eyebrow: string;
  title: string;
  description: string;
  posts: PostWithCompany[];
  totalCount: number;
  /** Link into the filterable home feed for this listing (e.g. "/?company=stripe"). */
  browseHref: string;
  /** Rendered next to the title (the follow button). */
  action?: React.ReactNode;
  externalUrl?: string;
  /** Links to sibling listings, for navigation and crawlability. */
  related?: { label: string; href: string }[];
  relatedTitle?: string;
}

export function ListingPage({
  eyebrow,
  title,
  description,
  posts,
  totalCount,
  browseHref,
  action,
  externalUrl,
  related = [],
  relatedTitle = "Browse",
}: ListingPageProps) {
  const hasMore = totalCount > posts.length;

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Container size="default" className="pt-8 pb-4 sm:pt-10">
        <section className="mb-8 border-b border-neutral-950/15 pb-6 dark:border-white/15">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-950/50 dark:text-white/50">
            {eyebrow}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
              {title}
            </h1>
            {action}
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-950/70 dark:text-white/70">
            {description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] text-neutral-950/60 dark:text-white/60">
            <span>
              {totalCount} {totalCount === 1 ? "article" : "articles"}
            </span>
            {externalUrl && (
              <>
                <span className="text-neutral-950/20 dark:text-white/20">·</span>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline transition-colors hover:text-neutral-950 dark:hover:text-white"
                >
                  Original blog
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </>
            )}
          </div>
        </section>

        <section aria-label={`${title} articles`} className="flex flex-col space-y-3.5">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="py-12 text-center font-mono text-xs uppercase text-neutral-950/60 dark:text-white/60">
              No articles indexed yet.
            </p>
          )}
        </section>

        <div className="flex justify-center pt-8">
          <Link
            href={browseHref}
            className="inline-flex h-9 items-center justify-center gap-2 border border-neutral-950 bg-neutral-950 px-6 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {hasMore ? `Browse all ${totalCount} in the feed` : "Filter in the feed"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {related.length > 0 && (
          <nav aria-label={relatedTitle} className="mt-12 border-t border-neutral-950/15 pt-6 dark:border-white/15">
            <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-950/50 dark:text-white/50">
              {relatedTitle}
            </p>
            <ul className="flex flex-wrap gap-1.5 font-mono text-xs">
              {related.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-7 items-center border border-neutral-950/20 bg-white px-3 font-bold uppercase text-neutral-950/70 transition-colors hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-[#111111] dark:text-white/70 dark:hover:border-white/50 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>

      <Footer />
    </main>
  );
}
