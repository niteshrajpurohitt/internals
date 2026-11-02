"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Bookmark } from "lucide-react";
import { PostWithCompany } from "@/lib/types";
import { useBookmarks } from "@/lib/bookmark-context";

interface PostCardProps {
  post: PostWithCompany;
}

function getRelativeTime(dateString: string): string {
  try {
    if (!dateString) return "Recent";
    const published = new Date(dateString);
    if (isNaN(published.getTime())) return "Recent";
    const now = new Date();
    const diffMs = now.getTime() - published.getTime();
    if (diffMs < 0) return "Just now";
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1d ago";
    if (diffDays < 30) return `${diffDays}d ago`;
    return published.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
}

const BRAND_DOMAINS: Record<string, string> = {
  netflix: "netflix.com",
  airbnb: "airbnb.com",
  canva: "canva.com",
  shopify: "shopify.com",
  slack: "slack.com",
  github: "github.com",
  meta: "meta.com",
  spotify: "spotify.com",
  chrome: "chrome.com",
  "37signals": "37signals.com",
  cloudflare: "cloudflare.com",
  flyio: "fly.io",
  discord: "discord.com",
  tailscale: "tailscale.com",
  datadog: "datadoghq.com",
  aws: "aws.amazon.com",
  supabase: "supabase.com",
  clickhouse: "clickhouse.com",
  tigerbeetle: "tigerbeetle.com",
  cockroachdb: "cockroachlabs.com",
  scylladb: "scylladb.com",
  planetscale: "planetscale.com",
  duckdb: "duckdb.org",
  stripe: "stripe.com",
  vercel: "vercel.com",
  figma: "figma.com",
  linear: "linear.app",
  uber: "uber.com",
  webdev: "web.dev",
  react: "react.dev",
  evilmartians: "evilmartians.com",
  openai: "openai.com",
  anthropic: "anthropic.com",
  google: "research.google",
  huggingface: "huggingface.co",
  crowdstrike: "crowdstrike.com",
  gitlab: "gitlab.com",
  fastly: "fastly.com",
  atlassian: "atlassian.com",
};

function getDomain(websiteUrl?: string, slug?: string): string {
  const cleanSlug = (slug || "").toLowerCase();
  if (cleanSlug && BRAND_DOMAINS[cleanSlug]) {
    return BRAND_DOMAINS[cleanSlug];
  }

  if (websiteUrl) {
    try {
      const url = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      if (hostname.includes("netflix")) return "netflix.com";
      if (hostname.includes("airbnb")) return "airbnb.com";
      if (hostname.includes("canva")) return "canva.com";
      if (hostname.includes("shopify")) return "shopify.com";
      if (hostname.includes("slack")) return "slack.com";
      if (hostname.includes("spotify")) return "spotify.com";
      return hostname;
    } catch {
      // ignore
    }
  }

  return "";
}

function CompanyLogo({
  websiteUrl,
  companyName,
  slug,
}: {
  websiteUrl?: string;
  companyName: string;
  slug?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const domain = getDomain(websiteUrl, slug);

  if (!domain || hasError) {
    return (
      <span className="font-mono text-[9px] font-bold text-neutral-950/70 dark:text-white/70">
        {companyName.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`/api/favicon?domain=${encodeURIComponent(domain)}`}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className="h-full w-full rounded-full object-cover"
    />
  );
}

export function PostCard({ post }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const isSaved = isBookmarked(post.id);
  const company = post.company || post.companies;
  const companyName = company?.name || "Engineering";
  const safeSourceUrl =
    post.source_url && /^https?:\/\//i.test(post.source_url)
      ? post.source_url
      : "#";

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cad-crosshair relative flex flex-col justify-between border border-neutral-950/20 bg-white p-4.5 transition-colors duration-150 hover:border-neutral-950/50 sm:p-5 dark:border-white/20 dark:bg-[#111111] dark:hover:border-white/50"
    >
      <a
        href={safeSourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-white"
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-950/20 pb-2.5 font-mono text-xs dark:border-white/20">
          <div className="flex flex-wrap items-center gap-2">
            {/* Circle Logo Box */}
            <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-950/20 bg-[#eeece6] dark:border-white/20 dark:bg-[#1a1a1a]">
              <CompanyLogo
                websiteUrl={company?.website_url}
                companyName={companyName}
                slug={company?.slug}
              />
            </div>

            {/* Company Name Outside the Box */}
            <span className="font-mono text-[11px] font-bold tracking-wider text-neutral-950 uppercase dark:text-white">
              {companyName}
            </span>

            <span className="text-neutral-950/50 dark:text-white/50">·</span>

            <span className="text-[10px] text-neutral-950/50 dark:text-white/50">
              {getRelativeTime(post.published_at)}
            </span>

            {post.read_time && (
              <>
                <span className="text-neutral-950/50 dark:text-white/50">·</span>
                <span className="text-[10px] text-neutral-950/50 dark:text-white/50">
                  {post.read_time}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 pr-1 pt-1">
            {/* Bookmark button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.86 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark(post.id);
              }}
              title={isSaved ? "Remove from saved" : "Save article"}
              aria-label={isSaved ? "Remove from saved" : "Save article"}
              className={`relative z-10 flex h-5 w-5 cursor-pointer items-center justify-center border transition-colors ${
                isSaved
                  ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-neutral-950/20 bg-white text-neutral-950/50 hover:border-neutral-950 hover:text-neutral-950 dark:border-white/20 dark:bg-[#080808] dark:text-white/50 dark:hover:border-white dark:hover:text-white"
              }`}
            >
              <Bookmark className={`h-2.5 w-2.5 ${isSaved ? "fill-current" : ""}`} />
            </motion.button>

            {/* Launch tile */}
            <div className="relative h-5 w-5">
              <div className="absolute inset-0 border border-neutral-950/20 bg-[#f4f3ef] dark:border-white/20 dark:bg-[#080808]" />
              <motion.span
                initial={false}
                animate={{
                  x: isHovered ? 4 : 0,
                  y: isHovered ? -4 : 0,
                }}
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                className={`absolute inset-0 flex items-center justify-center border shadow-xs transition-colors ${
                  isHovered
                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-neutral-950/20 bg-white text-neutral-950/50 dark:border-white/20 dark:bg-[#111111] dark:text-white/50"
                }`}
              >
                <ArrowUpRight className="h-3 w-3" />
              </motion.span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-neutral-950 transition-opacity group-hover:opacity-80 sm:text-lg dark:text-white">
          {post.title}
        </h2>

        {/* Summary */}
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-neutral-950/70 sm:line-clamp-3 sm:text-sm dark:text-white/70">
          {post.summary}
        </p>
      </a>
    </motion.article>
  );
}
