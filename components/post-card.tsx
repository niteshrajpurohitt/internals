"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Clock, Hash, Bookmark, AlertTriangle } from "lucide-react";
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
  const companyName = post.company?.name || post.companies?.name || "Engineering";
  const companySlug = (post.company?.slug || post.companies?.slug || "general").toLowerCase();
  const accentDotClass = COMPANY_ACCENTS[companySlug] || "bg-zinc-400";
  const canonicalSection = resolveCanonicalSection(post.tags);
  const isClassic = post.tags.some((t) => t.toLowerCase() === "classics");
  const isPostmortem = post.tags.some(
    (t) => t.toLowerCase() === "postmortems" || t.toLowerCase() === "postmortem"
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className="group relative"
    >
      <a
        href={post.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-white/[0.08] bg-[#121215]/80 p-5 transition-all duration-200 hover:border-zinc-700/90 hover:bg-[#16161a] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 sm:p-6"
      >
        {/* Header Row: Company Pill & Relative Time */}
        <div className="mb-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-zinc-950/60 px-2.5 py-1 text-zinc-300">
              <span className={`h-1.5 w-1.5 rounded-full ${accentDotClass}`} />
              <span className="font-medium text-zinc-200">{companyName}</span>
              <span className="font-mono text-zinc-600">•</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectCategory?.(canonicalSection);
                }}
                className="cursor-pointer text-[11px] text-zinc-400 transition-colors hover:text-white"
                title={`Filter by ${canonicalSection}`}
              >
                {canonicalSection}
              </button>
            </div>

            {isPostmortem && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectCategory?.("Postmortems");
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300 transition-all hover:border-rose-400 hover:bg-rose-500/20"
                title="Filter by Postmortems"
              >
                <AlertTriangle className="h-2.5 w-2.5 text-rose-400" />
                <span>Postmortem</span>
              </button>
            )}

            {isClassic && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectCategory?.("Classics");
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 transition-all hover:border-amber-400 hover:bg-amber-500/20"
                title="Filter by Classics"
              >
                <Bookmark className="h-2.5 w-2.5 fill-amber-300/30 text-amber-300" />
                <span>Classic</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
            <span>{getRelativeTime(post.published_at)}</span>
          </div>
        </div>

        {/* Title & Outward Link Icon */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base leading-snug font-medium tracking-tight text-zinc-100 transition-colors duration-150 group-hover:text-white sm:text-lg">
            {post.title}
          </h2>
          <div className="shrink-0 pt-0.5">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-all duration-150 group-hover:bg-white/[0.06] group-hover:text-zinc-200">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>

        {/* 1-2 sentence crisp technical takeaway */}
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed font-normal text-zinc-400">
          {post.summary}
        </p>

        {/* Footer: Tags & Read Time */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.04] pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.map((tag) => {
              const isTagClassic = tag.toLowerCase() === "classics";
              const targetSection = isTagClassic ? "Classics" : resolveCanonicalSection([tag]);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectCategory?.(targetSection);
                  }}
                  className={`inline-flex cursor-pointer items-center gap-0.5 rounded border px-2 py-0.5 font-mono text-[11px] transition-all ${
                    isTagClassic
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300 font-medium hover:border-amber-400 hover:bg-amber-500/20"
                      : "border-white/[0.06] bg-zinc-950/50 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                  title={`Filter by ${targetSection}`}
                >
                  <Hash className={`h-2.5 w-2.5 ${isTagClassic ? "text-amber-400" : "text-zinc-600"}`} />
                  {isTagClassic ? "★ Classics" : tag}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-zinc-500">
            <Clock className="h-3 w-3 text-zinc-600" />
            <span>{post.read_time}</span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}
