"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, RefreshCw, Bookmark, ChevronDown, X } from "lucide-react";
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
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
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
    if (selectedDuration !== "all") params.set("duration", selectedDuration);
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
        if (selectedDuration !== "all") {
          filtered = filtered.filter((p) => {
            const match = p.read_time?.match(/(\d+)/);
            const mins = match ? parseInt(match[1], 10) : 0;
            if (selectedDuration === "quick") return mins < 5;
            if (selectedDuration === "standard") return mins >= 5 && mins <= 10;
            if (selectedDuration === "long") return mins > 10;
            return true;
          });
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
      selectedCategory === "All" &&
      selectedCompanyId === "all" &&
      selectedDuration === "all" &&
      !searchQuery.trim();

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
  }, [selectedCategory, selectedCompanyId, selectedDuration, searchQuery, initialPosts, totalCount, user, fetchSavedPosts]);

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

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const durationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setCompanyDropdownOpen(false);
      }
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target as Node)) {
        setDurationDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCompanyDropdownOpen(false);
        setDurationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const DURATION_OPTIONS = useMemo(
    () => [
      { value: "all", label: "ALL" },
      { value: "quick", label: "< 5 MIN" },
      { value: "standard", label: "5 – 10 MIN" },
      { value: "long", label: "10+ MIN" },
    ],
    []
  );

  const currentCompanyLabel = useMemo(() => {
    if (selectedCompanyId === "all") return "ALL";
    const found = companies.find((c) => c.id === selectedCompanyId);
    return found ? found.name.toUpperCase() : "ALL";
  }, [selectedCompanyId, companies]);

  const currentDurationLabel = useMemo(() => {
    const found = DURATION_OPTIONS.find((d) => d.value === selectedDuration);
    return found ? found.label : "ALL";
  }, [selectedDuration, DURATION_OPTIONS]);

  const eligibleCompanies = useMemo(() => {
    return companies.filter((c) => c.post_count === undefined || c.post_count >= 2);
  }, [companies]);

  return (
    <div className="w-full space-y-5">
      {/* Category Pills (Row 1: Full-width horizontal scroll) */}
      <div className="no-scrollbar flex w-full items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
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

      {/* Sub-Filters: Company & Duration */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Company Dropdown */}
          <div className="flex items-center gap-1.5" ref={companyDropdownRef}>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950/60 dark:text-white/60">
              Company:
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCompanyDropdownOpen((prev) => !prev);
                  setDurationDropdownOpen(false);
                }}
                className="inline-flex h-7 cursor-pointer items-center justify-between gap-1.5 border border-neutral-950/20 bg-white px-2.5 font-mono text-xs font-bold uppercase tracking-wider text-neutral-950/80 transition-colors duration-100 hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-black dark:text-white/80 dark:hover:border-white/50 dark:hover:text-white"
              >
                <span>{currentCompanyLabel}</span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 text-neutral-950/60 transition-transform duration-150 dark:text-white/60 ${
                    companyDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {companyDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-64 min-w-[200px] overflow-y-auto border border-neutral-950/25 bg-white py-1 shadow-lg font-mono text-xs uppercase dark:border-white/25 dark:bg-black">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCompanyId("all");
                      setCompanyDropdownOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left font-bold transition-colors ${
                      selectedCompanyId === "all"
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-black"
                        : "text-neutral-950/80 hover:bg-neutral-950/5 dark:text-white/80 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>ALL</span>
                    {selectedCompanyId === "all" && <span className="text-[10px]">●</span>}
                  </button>
                  {eligibleCompanies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCompanyId(c.id);
                        setCompanyDropdownOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left font-bold transition-colors ${
                        selectedCompanyId === c.id
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-black"
                          : "text-neutral-950/80 hover:bg-neutral-950/5 dark:text-white/80 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate pr-2">{c.name.toUpperCase()}</span>
                      {selectedCompanyId === c.id && <span className="shrink-0 text-[10px]">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Duration Dropdown */}
          <div className="flex items-center gap-1.5" ref={durationDropdownRef}>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-950/60 dark:text-white/60">
              Duration:
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDurationDropdownOpen((prev) => !prev);
                  setCompanyDropdownOpen(false);
                }}
                className="inline-flex h-7 cursor-pointer items-center justify-between gap-1.5 border border-neutral-950/20 bg-white px-2.5 font-mono text-xs font-bold uppercase tracking-wider text-neutral-950/80 transition-colors duration-100 hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-black dark:text-white/80 dark:hover:border-white/50 dark:hover:text-white"
              >
                <span>{currentDurationLabel}</span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 text-neutral-950/60 transition-transform duration-150 dark:text-white/60 ${
                    durationDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {durationDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[130px] border border-neutral-950/25 bg-white py-1 shadow-lg font-mono text-xs uppercase dark:border-white/25 dark:bg-black">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(opt.value);
                        setDurationDropdownOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-left font-bold transition-colors ${
                        selectedDuration === opt.value
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-black"
                          : "text-neutral-950/80 hover:bg-neutral-950/5 dark:text-white/80 dark:hover:bg-white/5"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedDuration === opt.value && <span className="text-[10px]">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isFiltering && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-950/70 dark:text-white/70">
              <RefreshCw className="h-2.5 w-2.5 animate-spin text-neutral-950 dark:text-white" />
              <span>Querying...</span>
            </span>
          )}
        </div>

        {(selectedCategory !== "All" || selectedCompanyId !== "all" || selectedDuration !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedCompanyId("all");
              setSelectedDuration("all");
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
                      setSelectedDuration("all");
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
