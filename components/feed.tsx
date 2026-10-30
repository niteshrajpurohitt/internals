"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PostWithCompany, Company, CategoryFilter } from "@/lib/types";
import { interleavePostsByCompany } from "@/lib/feed-utils";
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
  const [filterError, setFilterError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const isFirstSearch = useRef(true);

  const [prevInitialPosts, setPrevInitialPosts] = useState(initialPosts);
  if (initialPosts !== prevInitialPosts) {
    setPrevInitialPosts(initialPosts);
    setPosts(initialPosts);
    if (totalCount) setHasMore(initialPosts.length < totalCount);
  }

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

  const displayedPosts = useMemo(() => {
    if (selectedCategory === "Saved") {
      if (!user) return [];
      return posts.filter((p) => bookmarkedPostIds.has(p.id));
    }
    return posts;
  }, [selectedCategory, user, posts, bookmarkedPostIds]);

  useEffect(() => {
    if (selectedCategory === "Saved") {
      if (!user) return;
      let active = true;
      queueMicrotask(() => {
        if (active) setIsFiltering(true);
      });
      fetchSavedPosts().then((saved) => {
        if (!active) return;
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
          const q = searchQuery.toLowerCase().trim();
          filtered = filtered.filter((p) => {
            const titleMatch = p.title.toLowerCase().includes(q);
            const summaryMatch = p.summary.toLowerCase().includes(q);
            const companyMatch =
              (p.company?.name || p.companies?.name || "").toLowerCase().includes(q) ||
              (p.company?.slug || p.companies?.slug || "").toLowerCase().includes(q);
            const tagsMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
            return titleMatch || summaryMatch || companyMatch || tagsMatch;
          });
        }
        setPosts(filtered);
        setHasMore(false);
        setIsFiltering(false);
      });
      return () => {
        active = false;
      };
    }

    const isDefault =
      selectedCategory === "All" &&
      selectedCompanyId === "all" &&
      selectedDuration === "all" &&
      !searchQuery.trim();

    if (isDefault) {
      if (posts !== initialPosts) {
        queueMicrotask(() => {
          setPosts(initialPosts);
          setHasMore(totalCount ? initialPosts.length < totalCount : true);
          setIsFiltering(false);
        });
      } else {
        queueMicrotask(() => {
          setIsFiltering(false);
        });
      }
      return;
    }

    const abortController = new AbortController();
    queueMicrotask(() => {
      if (!abortController.signal.aborted) {
        setIsFiltering(true);
        setFilterError(null);
      }
    });

    const debounceDelay = isFirstSearch.current ? 0 : (searchQuery ? 250 : 0);
    isFirstSearch.current = false;

    const timer = setTimeout(async () => {
      try {
        const url = buildQueryUrl(0, 20);
        const res = await fetch(url, { signal: abortController.signal });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP error ${res.status}`);
        }
        const data = await res.json();
        setPosts(data.posts || []);
        setHasMore(data.hasMore);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setPosts([]);
        setFilterError(err instanceof Error ? err.message : "Failed to load articles");
      } finally {
        if (!abortController.signal.aborted) setIsFiltering(false);
      }
    }, debounceDelay);

    return () => { clearTimeout(timer); abortController.abort(); };
  }, [selectedCategory, selectedCompanyId, selectedDuration, searchQuery, retryTrigger, initialPosts, totalCount, user, fetchSavedPosts]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore || isFiltering) return;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const url = buildQueryUrl(posts.length, 20);
      const res = await fetch(url);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP error ${res.status}`);
      }
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
      } else {
        setHasMore(false);
      }
    } catch (err: unknown) {
      setLoadMoreError(err instanceof Error ? err.message : "Failed to load more posts");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const durationDropdownRef = useRef<HTMLDivElement>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedCompanyId("all");
    setSelectedDuration("all");
    setSearchQuery("");
    setFilterError(null);
    setLoadMoreError(null);
    if (categoryBarRef.current) {
      categoryBarRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

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

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = categoryBarRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollMaskStyle = useMemo(() => {
    if (canScrollLeft && canScrollRight) {
      return {
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 28px, black calc(100% - 32px), transparent 100%)",
        maskImage: "linear-gradient(to right, transparent 0%, black 28px, black calc(100% - 32px), transparent 100%)",
      };
    }
    if (canScrollRight) {
      return {
        WebkitMaskImage: "linear-gradient(to right, black calc(100% - 32px), transparent 100%)",
        maskImage: "linear-gradient(to right, black calc(100% - 32px), transparent 100%)",
      };
    }
    if (canScrollLeft) {
      return {
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 28px, black 100%)",
        maskImage: "linear-gradient(to right, transparent 0%, black 28px, black 100%)",
      };
    }
    return undefined;
  }, [canScrollLeft, canScrollRight]);

  return (
    <div className="w-full space-y-5">
      {/* Category Pills (Row 1: Full-width horizontal scroll with soft edge dissolve) */}
      <div
        ref={categoryBarRef}
        style={scrollMaskStyle}
        className="no-scrollbar flex w-full items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs"
      >
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          const isSaved = category === "Saved";

          return (
            <button
              key={category}
              onClick={() => {
                if (isSaved && !user) {
                  openLoginModal();
                } else {
                  setSelectedCategory(category);
                  if (category === "All" && categoryBarRef.current) {
                    categoryBarRef.current.scrollTo({ left: 0, behavior: "smooth" });
                  }
                }
              }}
              className={`inline-flex h-7 shrink-0 cursor-pointer items-center justify-center border px-3 text-xs font-bold uppercase whitespace-nowrap transition-opacity duration-100 active:scale-98 ${
                isActive
                  ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-neutral-950/20 bg-white text-neutral-950/70 hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-[#111111] dark:text-white/70 dark:hover:border-white/50 dark:hover:text-white"
              }`}
            >
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
                className="inline-flex h-7 cursor-pointer items-center justify-between gap-1.5 border border-neutral-950/20 bg-white px-2.5 font-mono text-xs font-bold uppercase tracking-wider text-neutral-950/80 transition-opacity duration-100 hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-[#111111] dark:text-white/80 dark:hover:border-white/50 dark:hover:text-white"
              >
                <span>{currentCompanyLabel}</span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 text-neutral-950/60 transition-transform duration-150 dark:text-white/60 ${
                    companyDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {companyDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-64 min-w-[200px] overflow-y-auto border border-neutral-950/25 bg-white py-1 shadow-lg font-mono text-xs uppercase dark:border-white/25 dark:bg-[#111111]">
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
                className="inline-flex h-7 cursor-pointer items-center justify-between gap-1.5 border border-neutral-950/20 bg-white px-2.5 font-mono text-xs font-bold uppercase tracking-wider text-neutral-950/80 transition-opacity duration-100 hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-[#111111] dark:text-white/80 dark:hover:border-white/50 dark:hover:text-white"
              >
                <span>{currentDurationLabel}</span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 text-neutral-950/60 transition-transform duration-150 dark:text-white/60 ${
                    durationDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {durationDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[130px] border border-neutral-950/25 bg-white py-1 shadow-lg font-mono text-xs uppercase dark:border-white/25 dark:bg-[#111111]">
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


        </div>

        {(selectedCategory !== "All" || selectedCompanyId !== "all" || selectedDuration !== "all" || searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="flex cursor-pointer items-center gap-1 text-neutral-950/60 underline transition-colors hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Post List */}
      <div className="relative">
        {/* Subtle CAD Scanline Indicator */}
        <div
          className={`absolute -top-2 left-0 right-0 h-[1.5px] overflow-hidden bg-neutral-950/10 transition-opacity duration-150 dark:bg-white/10 ${
            isFiltering ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="cad-scanline-active h-full w-1/4 bg-neutral-950 dark:bg-white" />
        </div>

        <div
          className={`flex flex-col space-y-3.5 transition-opacity duration-150 ${
            isFiltering ? "opacity-40 pointer-events-none" : "opacity-100"
          }`}
        >
          {displayedPosts.length > 0 ? (
            displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              />
            ))
          ) : filterError ? (
            <div className="flex w-full flex-col items-center justify-center py-12 text-center">
              <div className="border border-red-500/30 bg-red-500/10 p-6 font-mono text-xs dark:border-red-400/30">
                <div className="mb-2 font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Something went wrong
                </div>
                <p className="mb-4 text-neutral-950/70 dark:text-white/70">
                  Cannot load posts right now. Please check your connection.
                </p>
                <button
                  type="button"
                  onClick={() => setRetryTrigger((prev) => prev + 1)}
                  className="inline-flex h-8 cursor-pointer items-center justify-center border border-neutral-950 bg-neutral-950 px-5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-neutral-800 active:scale-98 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="flex w-full justify-center py-12">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex h-9 cursor-pointer items-center justify-center border border-neutral-950 bg-neutral-950 px-6 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-neutral-800 active:scale-98 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                {selectedCategory === "Saved"
                  ? "NO SAVED ARTICLES YET"
                  : "NO ARTICLES MATCH CURRENT FILTERS"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Show More — only displayed when articles are loaded and not in an error state */}
      {hasMore && displayedPosts.length > 0 && !filterError && (
        <div className="flex flex-col items-center justify-center pb-2 pt-8">
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

          {loadMoreError && (
            <div className="mt-3 flex items-center gap-2 font-mono text-xs text-red-600 dark:text-red-400">
              <span>{loadMoreError}</span>
              <button
                type="button"
                onClick={loadMorePosts}
                className="font-bold underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
