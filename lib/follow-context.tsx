"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./auth-context";
import { useToast } from "./toast-context";
import { createBrowserClientInstance } from "./supabase-browser";
import type { TopicCategory } from "./feed-filters";
import { isTopicCategory } from "./feed-filters";

export type FollowTarget =
  | { kind: "company"; companyId: string; label: string }
  | { kind: "category"; category: TopicCategory; label: string };

interface FollowContextType {
  followedCompanyIds: Set<string>;
  followedCategories: Set<TopicCategory>;
  followCount: number;
  isLoadingFollows: boolean;
  isFollowing: (target: FollowTarget) => boolean;
  toggleFollow: (target: FollowTarget) => Promise<void>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

function targetKey(target: FollowTarget): string {
  return target.kind === "company" ? `company:${target.companyId}` : `category:${target.category}`;
}

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const { user, openLoginModal } = useAuth();
  const { showToast } = useToast();
  const supabase = useMemo(() => createBrowserClientInstance(), []);

  const [followedCompanyIds, setFollowedCompanyIds] = useState<Set<string>>(new Set());
  const [followedCategories, setFollowedCategories] = useState<Set<TopicCategory>>(new Set());
  const [isLoadingFollows, setIsLoadingFollows] = useState(false);
  const inFlightRef = useRef<Set<string>>(new Set());

  // Reload whenever the user signs in or out
  useEffect(() => {
    let mounted = true;

    async function loadFollows() {
      if (!user) {
        if (mounted) {
          setFollowedCompanyIds(new Set());
          setFollowedCategories(new Set());
          setIsLoadingFollows(false);
        }
        return;
      }

      setIsLoadingFollows(true);
      try {
        const { data, error } = await supabase
          .from("user_follows")
          .select("company_id, category")
          .eq("user_id", user.id);

        if (error) {
          console.warn("[Follows] Error loading follows:", error.message);
        } else if (data && mounted) {
          const rows = data as Array<{ company_id: string | null; category: string | null }>;
          setFollowedCompanyIds(new Set(rows.flatMap((r) => (r.company_id ? [r.company_id] : []))));
          setFollowedCategories(
            new Set(rows.flatMap((r) => (r.category && isTopicCategory(r.category) ? [r.category] : [])))
          );
        }
      } catch (err) {
        console.warn("[Follows] Connection error:", err);
      } finally {
        if (mounted) setIsLoadingFollows(false);
      }
    }

    loadFollows();
    return () => {
      mounted = false;
    };
  }, [user, supabase]);

  const isFollowing = useCallback(
    (target: FollowTarget) =>
      target.kind === "company"
        ? followedCompanyIds.has(target.companyId)
        : followedCategories.has(target.category),
    [followedCompanyIds, followedCategories]
  );

  const applyLocal = useCallback((target: FollowTarget, follow: boolean) => {
    if (target.kind === "company") {
      setFollowedCompanyIds((prev) => {
        const next = new Set(prev);
        if (follow) next.add(target.companyId);
        else next.delete(target.companyId);
        return next;
      });
    } else {
      setFollowedCategories((prev) => {
        const next = new Set(prev);
        if (follow) next.add(target.category);
        else next.delete(target.category);
        return next;
      });
    }
  }, []);

  const toggleFollow = async (target: FollowTarget) => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      showToast("You are offline. Cannot update follows.", "error");
      return;
    }

    const key = targetKey(target);
    if (inFlightRef.current.has(key)) return;
    inFlightRef.current.add(key);

    const wasFollowing = isFollowing(target);
    applyLocal(target, !wasFollowing);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      let error: { message: string } | null = null;

      if (wasFollowing) {
        const base = supabase.from("user_follows").delete().eq("user_id", user.id);
        const res =
          target.kind === "company"
            ? await base.eq("company_id", target.companyId).abortSignal(controller.signal)
            : await base.eq("category", target.category).abortSignal(controller.signal);
        error = res.error;
      } else {
        const row =
          target.kind === "company"
            ? { user_id: user.id, company_id: target.companyId }
            : { user_id: user.id, category: target.category };
        const res = await supabase
          .from("user_follows")
          .upsert(row, {
            onConflict: target.kind === "company" ? "user_id,company_id" : "user_id,category",
            ignoreDuplicates: true,
          })
          .abortSignal(controller.signal);
        error = res.error;
      }

      if (error) throw new Error(error.message);
      showToast(wasFollowing ? `Unfollowed ${target.label}` : `Following ${target.label}`, "success");
    } catch (err: unknown) {
      console.warn("[Follows] Toggle failed, reverting:", err instanceof Error ? err.message : err);
      showToast("Could not update follow. Please verify connection.", "error");
      applyLocal(target, wasFollowing);
    } finally {
      clearTimeout(timeoutId);
      inFlightRef.current.delete(key);
    }
  };

  return (
    <FollowContext.Provider
      value={{
        followedCompanyIds,
        followedCategories,
        followCount: followedCompanyIds.size + followedCategories.size,
        isLoadingFollows,
        isFollowing,
        toggleFollow,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollows() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error("useFollows must be used within a FollowProvider");
  }
  return context;
}
