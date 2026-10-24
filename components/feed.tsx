"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, RefreshCw, Check, Bookmark } from "lucide-react";
import { PostWithCompany, Company, CategoryFilter } from "@/lib/types";
import { interleavePostsByCompany } from "@/lib/supabase";
import { useSearch } from "@/lib/search-context";
import { useAuth } from "@/lib/auth-context";
import { useBookmarks } from "@/lib/bookmark-context";
import { PostCard } from "./post-card";

interface FeedProps {
  initialPosts: PostWithCompany[];
  companies: Company[];
  totalCount?: number;
}

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Saved",
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
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, openLoginModal } = useAuth();
  const { bookmarkCount, fetchSavedPosts, bookmarkedPostIds } = useBookmarks();

  const [posts, setPosts] = useState<PostWithCompany[]>(initialPosts);
  const [hasMore, setHasMore] = useState(
    totalCount ? initialPosts.length < totalCount : true
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentTotalCount, setCurrentTotalCount] = useState<number | undefined>(totalCount);

  useEffect(() => {
    if (selectedCategory !== "Saved") {
      setPosts(initialPosts);
      setCurrentTotalCount(totalCount);
      if (totalCount) setHasMore(initialPosts.length < totalCount);
    }
  }, [initialPosts, totalCount, selectedCategory]);

  const buildQueryUrl = (offset: number, limit: number) => {
    const params = new URLSearchParams();
    params.set("offset", offset.toString());
    params.set("limit", limit.toString());
    if (selectedCompanyId !== "all") params.set("companyId", selectedCompanyId);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    return `/api/posts?${params.toString()}`;
  };

  useEffect(() => {
    if (selectedCategory === "Saved" && user) {
      setPosts((prev) => prev.filter((p) => bookmarkedPostIds.has(p.id)));
      setCurrentTotalCount(bookmarkedPostIds.size);
    }
  }, [bookmarkedPostIds, selectedCategory, user]);

  useEffect(() => {
    if (selectedCategory === "Saved") {
      if (!user) {
        setIsFiltering(false);
        setPosts([]);
        setCurrentTotalCount(0);
        setHasMore(false);
        return;
      }
      setIsFiltering(true);
      fetchSavedPosts().then((saved) => {
        let filtered = saved;
        if (selectedCompanyId !== "all") {
          filtered = filtered.filter(
            (p) => (p.company?.id || p.companies?.id) === selectedCompanyId
          );
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
          );
        }
        setPosts(filtered);
        setCurrentTotalCount(filtered.length);
        setHasMore(false);
        setIsFiltering(false);
      });
      return;
    }

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
        const url = buildQueryUrl(0, 20);
        const res = await fetch(url, { signal: abortController.signal });
        if (!res.ok) throw new Error("Failed to filter posts");
        const data = await res.json();
        setPosts(data.posts || []);
        setCurrentTotalCount(data.totalCount);
        setHasMore(data.hasMore);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Filter error:", err);
      } finally {
        if (!abortController.signal.aborted) setIsFiltering(false);
      }
    }, searchQuery ? 250 : 0);

    return () => { clearTimeout(timer); abortController.abort(); };
  }, [selectedCategory, selectedCompanyId, searchQuery, initialPosts, totalCount, user, fetchSavedPosts]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore || isFiltering) return;
    setIsLoadingMore(true);
    try {
      const url = buildQueryUrl(posts.length, 20);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch more posts");
      const data = await res.json();
      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = data.posts.filter((p: PostWithCompany) => !existingIds.has(p.id));
          const isGeneral = selectedCompanyId === "all" && !searchQuery.trim();
          const combined = [...prev, ...uniqueNew];
          return isGeneral ? interleavePostsByCompany(combined, 2) : combined;
        });
        setHasMore(data.hasMore);
        if (data.totalCount !== undefined) setCurrentTotalCount(data.totalCount);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

  return (
    <div className="w-full space-y-5">
      {/* Category Pills & Company Filter Row */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs sm:pb-0">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            const isSaved = category === "Saved";

            return (
              <button
                key={category}
                onClick={() => {
                  if (isSaved && !user) openLoginModal();
                  else setSelectedCategory(category);
                }}
                className={`inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1.5 border px-3 text-xs font-bold uppercase whitespace-nowrap transition-colors duration-100 ${
                  isActive
                    ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-neutral-950/20 bg-white text-neutral-950/70 hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-black dark:text-white/70 dark:hover:border-white/50 dark:hover:text-white"
                }`}
              >
                {isSaved && (
                  <Bookmark
                    className={`h-3 w-3 ${
                      isActive
                        ? "fill-current"
                        : bookmarkCount > 0
                        ? "fill-current"
                        : ""
                    }`}
                  />
                )}
                <span>
                  {category}
                  {isSaved && user && bookmarkCount > 0 ? ` (${bookmarkCount})` : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* Company Dropdown */}
        <div className="flex shrink-0 items-center gap-2 self-start font-mono text-xs sm:self-auto">
          <span className="uppercase text-neutral-950/50 dark:text-white/50">Source:</span>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="h-7 cursor-pointer border border-neutral-950/25 bg-white px-2 font-mono text-xs text-neutral-950 focus:border-neutral-950 focus:outline-none dark:border-white/25 dark:bg-black dark:text-white dark:focus:border-white"
          >
            <option value="all">All Companies</option>
            {companies
              .filter((c) => c.post_count === undefined || c.post_count >= 2)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Feed Status & Sync */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-950/15 px-1 pb-2 font-mono text-xs text-neutral-950/60 dark:border-white/15 dark:text-white/60">
        <div className="flex items-center gap-3">
          <span>
            |← SHOWING <span className="font-bold text-neutral-950 dark:text-white">{posts.length}</span>
            {currentTotalCount && currentTotalCount > posts.length ? (
              <span>
                {" "}OF <span className="font-bold text-neutral-950 dark:text-white">{currentTotalCount.toLocaleString()}</span>
              </span>
            ) : null}{" "}
            {posts.length === 1 ? "ARTICLE" : "ARTICLES"} →|
          </span>

          {isFiltering && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-950/70 dark:text-white/70">
              <RefreshCw className="h-2.5 w-2.5 animate-spin text-neutral-950 dark:text-white" />
              <span>Querying...</span>
            </span>
          )}

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex cursor-pointer items-center gap-1.5 border border-neutral-950/25 bg-white px-2 py-0.5 text-[10px] text-neutral-950/80 transition-all hover:border-neutral-950 hover:bg-neutral-950 hover:text-white disabled:opacity-50 dark:border-white/25 dark:bg-black dark:text-white/80 dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
            title="Scan company feeds for new technical posts"
          >
            <RefreshCw className={`h-2.5 w-2.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Feeds"}</span>
          </button>

          {syncFeedback && (
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-950 dark:text-white">
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
            className="flex cursor-pointer items-center gap-1 text-neutral-950/60 underline transition-colors hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Post List */}
      <div className={`flex flex-col space-y-3.5 transition-opacity duration-150 ${isFiltering ? "opacity-50" : "opacity-100"}`}>
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
              className="w-full border border-dashed border-neutral-950/25 bg-white px-6 py-16 text-center font-mono dark:border-white/25 dark:bg-black"
            >
              {selectedCategory === "Saved" ? (
                <>
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-neutral-950/25 bg-[#f4f3ef] text-neutral-950/50 dark:border-white/25 dark:bg-black dark:text-white/50">
                    <Bookmark className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-medium text-neutral-950 dark:text-white">No saved articles yet</h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-neutral-950/60 dark:text-white/60">
                    Click the bookmark icon on any engineering post to save it to your personal library.
                  </p>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="mt-4 cursor-pointer border border-neutral-950/40 bg-white px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white dark:border-white/40 dark:bg-black dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                  >
                    Browse Feed
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-neutral-950/25 bg-[#f4f3ef] text-neutral-950/50 dark:border-white/25 dark:bg-black dark:text-white/50">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-medium text-neutral-950 dark:text-white">No matching technical logs</h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-950/60 dark:text-white/60">
                    No articles matched &quot;{searchQuery || selectedCategory}&quot;. Try broadening
                    your keywords or resetting category filters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedCompanyId("all");
                      setSearchQuery("");
                    }}
                    className="mt-4 cursor-pointer border border-neutral-950/40 bg-white px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white dark:border-white/40 dark:bg-black dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                  >
                    Clear all filters
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Show More / End of Feed */}
      <div className="flex flex-col items-center justify-center pb-2 pt-8">
        {hasMore ? (
          <button
            type="button"
            onClick={loadMorePosts}
            disabled={isLoadingMore}
            className="inline-flex h-9 min-w-36 cursor-pointer items-center justify-center border border-neutral-950 bg-neutral-950 px-7 font-mono text-xs font-bold tracking-wider text-white transition-all hover:bg-neutral-800 active:scale-98 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {isLoadingMore ? (
              <div
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black"
                role="status"
                aria-label="Loading"
              />
            ) : (
              <span>SHOW MORE</span>
            )}
          </button>
        ) : posts.length > 0 ? (
          <div className="font-mono text-[11px] text-neutral-950/40 dark:text-white/40">
            End of feed ({posts.length} logs)
          </div>
        ) : null}
      </div>
    </div>
  );
}
