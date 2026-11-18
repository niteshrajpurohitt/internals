"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuth } from "./auth-context";
import { useToast } from "./toast-context";
import { createBrowserClientInstance } from "./supabase-browser";
import { PostWithCompany } from "./types";

interface BookmarkContextType {
  bookmarkedPostIds: Set<string>;
  isBookmarked: (postId: string) => boolean;
  toggleBookmark: (postId: string) => Promise<void>;
  bookmarkCount: number;
  isLoadingBookmarks: boolean;
  bookmarkError: string | null;
  fetchSavedPosts: () => Promise<PostWithCompany[]>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { user, openLoginModal } = useAuth();
  const { showToast } = useToast();
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  const supabase = useMemo(() => createBrowserClientInstance(), []);
  const inFlightRef = useRef<Set<string>>(new Set());

  // Sync bookmarks whenever user logs in or out
  useEffect(() => {
    let mounted = true;

    async function loadBookmarks() {
      if (!user) {
        if (mounted) {
          setBookmarkedPostIds(new Set());
          setIsLoadingBookmarks(false);
        }
        return;
      }

      setIsLoadingBookmarks(true);
      try {
        const { data, error } = await supabase
          .from("user_bookmarks")
          .select("post_id")
          .eq("user_id", user.id);

        if (!error && data && mounted) {
          setBookmarkedPostIds(new Set(data.map((b: { post_id: string }) => b.post_id)));
        } else if (error) {
          console.warn("[Bookmarks] Error loading user bookmarks:", error.message);
        }
      } catch (err) {
        console.warn("[Bookmarks] Connection error:", err);
      } finally {
        if (mounted) setIsLoadingBookmarks(false);
      }
    }

    loadBookmarks();

    return () => {
      mounted = false;
    };
  }, [user, supabase]);

  const isBookmarked = useCallback(
    (postId: string) => bookmarkedPostIds.has(postId),
    [bookmarkedPostIds]
  );

  const toggleBookmark = async (postId: string) => {
    if (!user) {
      openLoginModal();
      return;
    }

    // Immediate offline check: prevent false optimistic state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setBookmarkError("You are offline. Cannot save bookmarks.");
      showToast("You are offline. Cannot save bookmarks.", "error");
      setTimeout(() => setBookmarkError(null), 4000);
      return;
    }

    // Ignore repeat clicks while a request for this post is still running.
    // Without this, a fast double-click sent two inserts and left the UI wrong.
    if (inFlightRef.current.has(postId)) return;
    inFlightRef.current.add(postId);

    const wasBookmarked = bookmarkedPostIds.has(postId);

    // Optimistic state update
    setBookmarkedPostIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });

    // A real timeout: aborting cancels the HTTP request, so it can never succeed
    // on the server after we have already reverted the UI.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      // Both operations are idempotent: saving twice or removing twice is a no-op, not an error.
      const { error } = wasBookmarked
        ? await supabase
            .from("user_bookmarks")
            .delete()
            .eq("user_id", user.id)
            .eq("post_id", postId)
            .abortSignal(controller.signal)
        : await supabase
            .from("user_bookmarks")
            .upsert(
              { user_id: user.id, post_id: postId },
              { onConflict: "user_id,post_id", ignoreDuplicates: true }
            )
            .abortSignal(controller.signal);

      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      console.warn("[Bookmarks] Toggle failed, reverting state:", msg);
      setBookmarkError("Could not update bookmark. Please verify connection.");
      showToast("Could not update bookmark. Please verify connection.", "error");
      setTimeout(() => setBookmarkError(null), 4000);

      // Revert optimistic update
      setBookmarkedPostIds((prev) => {
        const reverted = new Set(prev);
        if (wasBookmarked) {
          reverted.add(postId);
        } else {
          reverted.delete(postId);
        }
        return reverted;
      });
    } finally {
      clearTimeout(timeoutId);
      inFlightRef.current.delete(postId);
    }
  };

  const fetchSavedPosts = useCallback(async (): Promise<PostWithCompany[]> => {
    if (!user || bookmarkedPostIds.size === 0) {
      return [];
    }

    try {
      const postIds = Array.from(bookmarkedPostIds);
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          companies (
            id,
            name,
            slug,
            website_url
          )
        `)
        .in("id", postIds)
        .order("published_at", { ascending: false });

      if (error || !data) {
        console.warn("[Bookmarks] Failed to fetch saved posts:", error?.message);
        return [];
      }

      // Same shape as getPosts(): expose the joined row as `company` too
      return (data as PostWithCompany[]).map((post) => ({
        ...post,
        company: post.companies || null,
      }));
    } catch (err) {
      console.warn("[Bookmarks] Error fetching saved posts:", err);
      return [];
    }
  }, [user, bookmarkedPostIds, supabase]);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedPostIds,
        isBookmarked,
        toggleBookmark,
        bookmarkCount: bookmarkedPostIds.size,
        isLoadingBookmarks,
        bookmarkError,
        fetchSavedPosts,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
