"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, RefreshCw, Check } from "lucide-react";
import { PostWithCompany, Company, CategoryFilter } from "@/lib/types";
import { PostCard } from "./post-card";

interface FeedProps {
  initialPosts: PostWithCompany[];
  companies: Company[];
  totalCount?: number;
}

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Classics",
  "Postmortems",
  "AI & Machine Learning",
  "Distributed Systems",
  "Databases & Storage",
  "Infrastructure & Cloud",
  "Low-Level & Compilers",
  "Web & Platforms",
];

export function Feed({ initialPosts, companies, totalCount }: FeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithCompany[]>(initialPosts);
  const [hasMore, setHasMore] = useState(
    totalCount ? initialPosts.length < totalCount : true
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [isFiltering, setIsFiltering] = useState(false);
  const [currentTotalCount, setCurrentTotalCount] = useState<number | undefined>(totalCount);

  // Sync initialPosts updates (e.g. after sync refresh)
  useEffect(() => {
    setPosts(initialPosts);
    setCurrentTotalCount(totalCount);
    if (totalCount) {
      setHasMore(initialPosts.length < totalCount);
    }
  }, [initialPosts, totalCount]);

  const buildQueryUrl = (offset: number, limit: number) => {
    const params = new URLSearchParams();
    params.set("offset", offset.toString());
    params.set("limit", limit.toString());
    if (selectedCompanyId !== "all") {
      params.set("companyId", selectedCompanyId);
    }
    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    return `/api/posts?${params.toString()}`;
  };

  // Reactive server-side filtering across the entire database
  useEffect(() => {
    const isDefault =
      selectedCategory === "All" && selectedCompanyId === "all" && !searchQuery.trim();

    if (isDefault) {
      if (posts !== initialPosts) {
        setPosts(initialPosts);
        setCurrentTotalCount(totalCount);
        setHasMore(totalCount ? initialPosts.length < totalCount : true);
      }
      setIsFiltering(false);
      return;
    }

    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      setIsFiltering(true);
      try {
        const url = buildQueryUrl(0, 30);
        const res = await fetch(url, { signal: abortController.signal });
        if (!res.ok) throw new Error("Failed to filter posts");
        const data = await res.json();
        setPosts(data.posts || []);
        setCurrentTotalCount(data.totalCount);
        setHasMore(data.hasMore);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Ignore aborted in-flight requests
        }
        console.error("Filter error:", err);
      } finally {
        if (!abortController.signal.aborted) {
          setIsFiltering(false);
        }
      }
    }, searchQuery ? 250 : 0);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [selectedCategory, selectedCompanyId, searchQuery, initialPosts, totalCount]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore || isFiltering) return;
    setIsLoadingMore(true);
    try {
      const url = buildQueryUrl(posts.length, 30);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch more posts");
      const data = await res.json();
      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = data.posts.filter((p: PostWithCompany) => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
        setHasMore(data.hasMore);
        setCurrentTotalCount(data.totalCount);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // IntersectionObserver for automated infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isFiltering) {
          loadMorePosts();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isFiltering, posts.length]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const added = data.stats?.new_posts_added ?? 0;
        setSyncFeedback(added > 0 ? `Synced +${added} new posts!` : "All feeds up to date");
        router.refresh();
      } else {
        setSyncFeedback(data.details || "Sync completed");
      }
    } catch {
      setSyncFeedback("Sync failed");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / slash)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Search Bar & Company Filter Controls */}
      <div className="space-y-3">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-zinc-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
                searchInputRef.current?.blur();
              }
            }}
            placeholder="Search systems, architectures, algorithms, or companies..."
            className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#121215]/90 pr-24 pl-11 text-sm text-zinc-100 backdrop-blur-sm transition-all duration-150 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 focus:outline-none"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <span className="hidden items-center gap-0.5 rounded border border-white/[0.08] bg-zinc-950/80 px-2 py-1 font-mono text-[10px] font-medium text-zinc-400 shadow-xs sm:inline-flex">
              <kbd>⌘</kbd>
              <kbd>K</kbd>
            </span>
          </div>
        </div>

        {/* Category Pills with Animated LayoutId Pill */}
        <div className="flex flex-col justify-between gap-3 pt-1 sm:flex-row sm:items-center">
          <div className="no-scrollbar flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 rounded-lg border border-white/[0.12] bg-zinc-800/90 shadow-xs"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                  <span className="relative z-10 font-medium">
                    {category === "Classics" ? "★ Classics" : category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Company Quick Filter Dropdown/Selector */}
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
              Source:
            </span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="h-7 cursor-pointer rounded-lg border border-white/[0.08] bg-zinc-900/90 px-2.5 font-sans text-xs text-zinc-300 focus:border-zinc-500 focus:outline-none"
            >
              <option value="all">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feed Status / Post Count & Sync Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.04] px-1 pb-2 font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <span>
            Showing <span className="font-semibold text-zinc-300">{posts.length}</span>
            {currentTotalCount && currentTotalCount > posts.length ? (
              <span>
                {" "}
                of <span className="font-semibold text-zinc-300">{currentTotalCount.toLocaleString()}</span>
              </span>
            ) : null}{" "}
            {posts.length === 1 ? "article" : "articles"}
          </span>

          {isFiltering && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
              <RefreshCw className="h-2.5 w-2.5 animate-spin text-zinc-400" />
              <span>Querying database...</span>
            </span>
          )}

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-white/[0.08] bg-zinc-900/60 px-2.5 py-0.5 text-[10px] text-zinc-400 transition-all hover:border-white/[0.16] hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
            title="Scan company feeds for new technical posts"
          >
            <RefreshCw
              className={`h-2.5 w-2.5 ${isSyncing ? "animate-spin text-emerald-400" : ""}`}
            />
            <span>{isSyncing ? "Scanning feeds..." : "Sync Feeds"}</span>
          </button>

          {syncFeedback && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <Check className="h-3 w-3" />
              <span>{syncFeedback}</span>
            </span>
          )}
        </div>

        {(selectedCategory !== "All" || selectedCompanyId !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedCompanyId("all");
              setSearchQuery("");
            }}
            className="flex cursor-pointer items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Dynamic Post Feed */}
      <div className={`space-y-3.5 transition-opacity duration-150 ${isFiltering ? "opacity-50" : "opacity-100"}`}>
        <AnimatePresence mode="popLayout">
          {posts.length > 0 ? (
            posts.map((post, idx) => (
              <PostCard
                key={post.id}
                post={post}
                index={idx}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-xl border border-dashed border-white/[0.08] bg-[#121215]/40 px-6 py-16 text-center"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-900/60 text-zinc-500">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-zinc-200">No matching technical logs</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500">
                No articles matched &quot;{searchQuery || selectedCategory}&quot;. Try broadening
                your keywords or resetting category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedCompanyId("all");
                  setSearchQuery("");
                }}
                className="mt-4 cursor-pointer rounded-lg border border-white/[0.1] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Infinite Scroll Sentinel & Loading Indicator */}
      <div ref={sentinelRef} className="flex flex-col items-center justify-center pt-8 pb-16">
        {isLoadingMore && (
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-200"
            role="status"
            aria-label="Loading"
          />
        )}
      </div>
    </div>
  );
}
