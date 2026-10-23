"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Search, X, User as UserIcon, LogOut, Bookmark } from "lucide-react";
import { useSearch } from "@/lib/search-context";
import { useAuth } from "@/lib/auth-context";
import { useBookmarks } from "@/lib/bookmark-context";
import { Container } from "./container";

export function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, isLoading, openLoginModal, signOut } = useAuth();
  const { bookmarkCount } = useBookmarks();
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

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
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
    <header className="sticky top-0 z-40 w-full border-b border-white/15 bg-black/90 backdrop-blur-md">
      <Container size="default" className="flex h-13 items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-85"
          >
            <span className="flex h-6 w-6 items-center justify-center border border-white bg-black font-mono text-xs font-bold text-white shadow-xs">
              IN
            </span>
            <span className="font-mono text-sm font-bold tracking-tight">Internals</span>
          </Link>
        </div>

        {/* Right Section: Search & Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Blueprint CAD Search Bar */}
          <div className="group relative flex h-7 w-28 sm:w-36 items-center border border-white/20 bg-black font-mono text-[11px] transition-colors focus-within:border-white/55">
            <Search className="pointer-events-none ml-2 h-3 w-3 shrink-0 text-white/50 transition-colors group-focus-within:text-white/80" />
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
              className="h-full w-full bg-transparent px-1.5 text-[11px] text-white placeholder:text-white/40 transition-colors focus:placeholder:text-white/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mr-1.5 cursor-pointer p-0.5 text-white/50 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Auth Button */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex h-7 items-center gap-1.5 border border-white/20 bg-black px-2 font-mono text-[11px] text-white transition-colors hover:border-white/50 cursor-pointer"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-4 w-4 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <UserIcon className="h-3 w-3 text-white/60" />
                )}
                <span className="max-w-[80px] truncate sm:max-w-[120px]">{displayName}</span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="cad-crosshair absolute right-0 mt-1.5 w-48 border border-white/25 bg-neutral-950 p-2 shadow-2xl font-mono text-xs z-50">
                  <div className="border-b border-white/10 px-2 py-1.5 text-left">
                    <p className="truncate font-semibold text-white">{displayName}</p>
                    <p className="truncate text-[10px] text-white/50">{user.email}</p>
                  </div>

                  <div className="border-b border-white/10 py-1">
                    <div className="flex items-center justify-between px-2 py-1 text-white/70">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Bookmark className="h-3 w-3" />
                        Saved Articles
                      </span>
                      <span className="border border-white/20 bg-black px-1.5 py-0.2 text-[10px] font-bold text-white">
                        {bookmarkCount}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      signOut();
                    }}
                    className="mt-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
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
              className="flex h-7 items-center gap-1.5 border border-white/25 bg-black px-2.5 font-mono text-[11px] text-white transition-all hover:border-white hover:bg-neutral-900 cursor-pointer shadow-xs"
            >
              <UserIcon className="h-3 w-3 text-white/70" />
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </Container>
    </header>
  );
}
