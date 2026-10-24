"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "./auth-context";
import { createBrowserClientInstance } from "./supabase-browser";
import { PostWithCompany } from "./types";

interface BookmarkContextType {
  bookmarkedPostIds: Set<string>;
  isBookmarked: (postId: string) => boolean;
  toggleBookmark: (postId: string) => Promise<void>;
  bookmarkCount: number;
  isLoadingBookmarks: boolean;
  fetchSavedPosts: () => Promise<PostWithCompany[]>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { user, openLoginModal } = useAuth();
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  const supabase = useMemo(() => createBrowserClientInstance(), []);

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
        }
      } catch (err) {
        console.warn("Failed to load user bookmarks:", err);
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

    try {
      if (wasBookmarked) {
        const { error } = await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_bookmarks")
          .insert({ user_id: user.id, post_id: postId });

        if (error) throw error;
      }
    } catch (err) {
      console.warn("Bookmark toggle error, reverting:", err);
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
        console.warn("Failed to fetch saved posts:", error?.message);
        return [];
      }

      return data as PostWithCompany[];
    } catch (err) {
      console.warn("Error fetching saved posts:", err);
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
