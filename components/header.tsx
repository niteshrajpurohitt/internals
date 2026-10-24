"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Search, X, User as UserIcon, LogOut, Bookmark, Sun, Moon } from "lucide-react";
import { useSearch } from "@/lib/search-context";
import { useAuth } from "@/lib/auth-context";
import { useBookmarks } from "@/lib/bookmark-context";
import { useTheme } from "@/lib/theme-context";
import { Container } from "./container";

export function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, openLoginModal, signOut } = useAuth();
  const { bookmarkCount } = useBookmarks();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-950/15 bg-[#f4f3ef]/90 backdrop-blur-md dark:border-white/15 dark:bg-black/90">
      <Container size="default" className="flex h-13 items-center justify-between gap-4">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-950 transition-opacity hover:opacity-80 dark:text-white"
        >
          <span className="flex h-6 w-6 items-center justify-center border border-neutral-950 bg-[#f4f3ef] font-mono text-xs font-bold text-neutral-950 dark:border-white dark:bg-black dark:text-white">
            IN
          </span>
          <span className="font-mono text-sm font-bold tracking-tight">Internals</span>
        </Link>

        {/* Right: Search, Theme, Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* Search */}
          <div className="group relative flex h-7 w-28 items-center border border-neutral-950/20 bg-white font-mono text-[11px] transition-colors focus-within:border-neutral-950/50 sm:w-36 dark:border-white/20 dark:bg-black dark:focus-within:border-white/55">
            <Search className="pointer-events-none ml-2 h-3 w-3 shrink-0 text-neutral-950/40 transition-colors group-focus-within:text-neutral-950/70 dark:text-white/40 dark:group-focus-within:text-white/80" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchQuery("");
                  inputRef.current?.blur();
                }
              }}
              placeholder="SEARCH..."
              className="h-full w-full bg-transparent px-1.5 text-[11px] text-neutral-950 placeholder:text-neutral-950/35 focus:outline-none dark:text-white dark:placeholder:text-white/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mr-1.5 cursor-pointer p-0.5 text-neutral-950/40 transition-colors hover:text-neutral-950 dark:text-white/40 dark:hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="flex h-7 w-7 cursor-pointer items-center justify-center border border-neutral-950/20 bg-white text-neutral-950/60 transition-all hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-black dark:text-white/60 dark:hover:border-white/50 dark:hover:text-white"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Auth */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex h-7 cursor-pointer items-center gap-1.5 border border-neutral-950/20 bg-white px-2 font-mono text-[11px] text-neutral-950 transition-colors hover:border-neutral-950/50 dark:border-white/20 dark:bg-black dark:text-white dark:hover:border-white/50"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-4 w-4 rounded-full border border-neutral-950/20 object-cover dark:border-white/20"
                  />
                ) : (
                  <UserIcon className="h-3 w-3 text-neutral-950/60 dark:text-white/60" />
                )}
                <span className="max-w-[80px] truncate sm:max-w-[120px]">{displayName}</span>
              </button>

              {isUserMenuOpen && (
                <div className="cad-crosshair absolute right-0 top-full z-50 mt-2 w-52 border border-neutral-950/25 bg-white p-2.5 shadow-2xl font-mono text-xs dark:border-white/25 dark:bg-neutral-950">
                  <div className="border-b border-neutral-950/10 px-2 py-1.5 dark:border-white/10">
                    <p className="truncate font-semibold text-neutral-950 dark:text-white">{displayName}</p>
                    <p className="truncate text-[10px] text-neutral-950/50 dark:text-white/50">{user.email}</p>
                  </div>

                  <div className="border-b border-neutral-950/10 py-1 dark:border-white/10">
                    <div className="flex items-center justify-between px-2 py-1 text-neutral-950/70 dark:text-white/70">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Bookmark className="h-3 w-3" />
                        Saved Articles
                      </span>
                      <span className="border border-neutral-950/20 bg-[#f4f3ef] px-1.5 py-0.5 text-[10px] font-bold text-neutral-950 dark:border-white/20 dark:bg-black dark:text-white">
                        {bookmarkCount}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setIsUserMenuOpen(false); signOut(); }}
                    className="mt-1 flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left text-neutral-950/70 transition-colors hover:bg-neutral-950/5 hover:text-neutral-950 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex h-7 cursor-pointer items-center gap-1.5 border border-neutral-950/25 bg-white px-2.5 font-mono text-[11px] text-neutral-950 shadow-xs transition-all hover:border-neutral-950 hover:bg-neutral-100 dark:border-white/25 dark:bg-black dark:text-white dark:hover:border-white dark:hover:bg-neutral-900"
            >
              <UserIcon className="h-3 w-3 text-neutral-950/70 dark:text-white/70" />
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </Container>
    </header>
  );
}
