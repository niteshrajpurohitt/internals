"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { PostWithCompany, CategoryFilter } from "@/lib/types";

interface PostCardProps {
  post: PostWithCompany;
  index: number;
  onSelectCategory?: (category: CategoryFilter) => void;
}

export const CANONICAL_SECTIONS: CategoryFilter[] = [
  "AI & Machine Learning",
  "Distributed Systems",
  "Databases & Storage",
  "Infrastructure & Cloud",
  "Low-Level & Compilers",
  "Web & Platforms",
];

export function resolveCanonicalSection(tags: string[] = []): CategoryFilter {
  // 1. Direct match with canonical pillars
  for (const tag of tags) {
    const matched = CANONICAL_SECTIONS.find(
      (s) => s.toLowerCase() === tag.toLowerCase()
    );
    if (matched) return matched;
  }

  // 2. Sub-tag heuristics mapping to canonical pillars
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (
      ["gpu", "llm", "ai / systems", "machine learning", "deep learning", "inference", "triton", "cuda", "transformer"].some((k) =>
        lower.includes(k)
      )
    ) {
      return "AI & Machine Learning";
    }
    if (
      ["distributed", "consensus", "raft", "kafka", "paxos", "microservice", "event stream"].some((k) =>
        lower.includes(k)
      )
    ) {
      return "Distributed Systems";
    }
    if (
      ["database", "storage", "clickhouse", "postgresql", "scylladb", "cassandra", "cockroachdb", "duckdb", "sqlite", "redis"].some((k) =>
        lower.includes(k)
      )
    ) {
      return "Databases & Storage";
    }
    if (
      ["infra", "cloud", "kubernetes", "networking", "linux kernel", "edge", "anycast", "docker"].some((k) =>
        lower.includes(k)
      )
    ) {
      return "Infrastructure & Cloud";
    }
    if (
      ["rust", "zig", "c++", "compiler", "systems programming", "ebpf", "wasm", "assembly", "golang"].some((k) =>
        lower.includes(k)
      )
    ) {
      return "Low-Level & Compilers";
    }
    if (
      ["web", "frontend", "platform", "crdt", "react", "vite", "turbopack", "browser"].some((k) =>
        lower.includes(k)
      )
    ) {
      return "Web & Platforms";
    }
  }

  // If marked as postmortem and no other pillar
  if (tags.some((t) => t.toLowerCase() === "postmortems" || t.toLowerCase() === "postmortem")) {
    return "Postmortems";
  }

  // If marked as classic and no other pillar
  if (tags.some((t) => t.toLowerCase() === "classics")) {
    return "Classics";
  }

  return "Web & Platforms";
}

function getRelativeTime(dateString: string): string {
  try {
    const published = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - published.getTime();
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

// Subtle brand accent dots
const COMPANY_ACCENTS: Record<string, string> = {
  openai: "bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
  vercel: "bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.5)]",
  anthropic: "bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.4)]",
  cloudflare: "bg-orange-400/80 shadow-[0_0_8px_rgba(251,146,60,0.4)]",
  discord: "bg-indigo-400/80 shadow-[0_0_8px_rgba(129,140,248,0.4)]",
  stripe: "bg-violet-400/80 shadow-[0_0_8px_rgba(167,139,250,0.4)]",
  figma: "bg-pink-400/80 shadow-[0_0_8px_rgba(244,114,182,0.4)]",
  netflix: "bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  tigerbeetle: "bg-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.4)]",
  cockroachdb: "bg-teal-400/80 shadow-[0_0_8px_rgba(45,212,191,0.4)]",
  flyio: "bg-purple-400/80 shadow-[0_0_8px_rgba(192,132,252,0.4)]",
  datadog: "bg-purple-500/80 shadow-[0_0_8px_rgba(168,85,247,0.4)]",
  meta: "bg-blue-400/80 shadow-[0_0_8px_rgba(96,165,250,0.4)]",
  google: "bg-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,0.4)]",
  tailscale: "bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.4)]",
  clickhouse: "bg-amber-300/80 shadow-[0_0_8px_rgba(252,211,77,0.4)]",
  supabase: "bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  aws: "bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
  crowdstrike: "bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  gitlab: "bg-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.4)]",
  linear: "bg-indigo-300/80 shadow-[0_0_8px_rgba(165,180,252,0.4)]",
  slack: "bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
  airbnb: "bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
  canva: "bg-teal-400/80 shadow-[0_0_8px_rgba(45,212,191,0.4)]",
  github: "bg-zinc-200 shadow-[0_0_8px_rgba(228,228,231,0.4)]",
  shopify: "bg-lime-400/80 shadow-[0_0_8px_rgba(163,230,53,0.4)]",
  duckdb: "bg-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.4)]",
  huggingface: "bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.4)]",
  scylladb: "bg-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,0.4)]",
  planetscale: "bg-orange-400/80 shadow-[0_0_8px_rgba(251,146,60,0.4)]",
  mistral: "bg-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.4)]",
  uber: "bg-zinc-300 shadow-[0_0_8px_rgba(212,212,216,0.4)]",
  chrome: "bg-blue-400/80 shadow-[0_0_8px_rgba(96,165,250,0.4)]",
  webdev: "bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
  react: "bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.4)]",
  evilmartians: "bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
};

export function PostCard({ post, index, onSelectCategory }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const companyName = post.company?.name || post.companies?.name || "Engineering";
  const canonicalSection = resolveCanonicalSection(post.tags);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cad-crosshair relative flex flex-col justify-between border border-white/20 bg-neutral-950 p-4.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-colors duration-150 hover:border-white/50 sm:p-5"
    >
      <a
        href={post.source_url}
        target="_blank"
        rel="noopener noreferrer"
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
      >
        {/* Header Dimension Row: Company, Time, Read Time, Launch Icon */}
        <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2.5 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-white/60 bg-black px-2 py-0.5 text-[11px] font-bold tracking-wider text-white uppercase">
              {companyName}
            </span>

            <span className="text-white/40">·</span>

            <span className="text-[10px] text-white/60">
              {getRelativeTime(post.published_at)}
            </span>

            {post.read_time && (
              <>
                <span className="text-white/40">·</span>
                <span className="text-[10px] text-white/50">
                  {post.read_time}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 pr-1.5 pt-1.5">
            <div className="relative h-5 w-5">
              {/* Underlying outline footprint that stays in place */}
              <div className="absolute inset-0 border border-white/40 bg-black" />

              {/* Foreground interactive tile that shifts up and right on hover */}
              <motion.span
                initial={false}
                animate={{
                  x: isHovered ? 4 : 0,
                  y: isHovered ? -4 : 0,
                  backgroundColor: isHovered ? "#ffffff" : "#000000",
                  color: isHovered ? "#000000" : "rgba(255, 255, 255, 0.7)",
                  borderColor: isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                }}
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center border shadow-xs"
              >
                <ArrowUpRight className="h-3 w-3" />
              </motion.span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-white/90 sm:text-lg">
          {post.title}
        </h2>

        {/* Summary */}
        <p className="mt-2.5 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-relaxed text-white/75">
          {post.summary}
        </p>
      </a>
    </motion.article>
  );
}
