"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, User as UserIcon, LogOut, Sun, Moon } from "lucide-react";
import { useSearch } from "@/lib/search-context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Container } from "./container";
import { Logo } from "./logo";

export function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, openLoginModal, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-950/15 bg-[#f4f3ef]/80 backdrop-blur-md dark:border-white/15 dark:bg-[#080808]/90">
      <Container size="default" className="flex h-13 items-center justify-between gap-4">

        {/* Brand */}
        <Link
          href="/"
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-950 dark:text-white"
        >
          <Logo className="h-4 w-4 text-neutral-950 dark:text-white" />
          <span className="font-mono text-sm font-bold tracking-tight">Internals</span>
        </Link>

        {/* Right: Search, Theme, Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              inputRef.current?.blur();
              if (pathname !== "/") {
                const trimmed = searchQuery.trim();
                router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
              }
            }}
            action=""
            className="group relative flex h-7 w-28 items-center border border-neutral-950/20 bg-white font-mono text-[11px] transition-colors focus-within:border-neutral-950/50 sm:w-36 dark:border-white/20 dark:bg-[#111111] dark:focus-within:border-white/55"
          >
            <Search className="pointer-events-none ml-2 h-3 w-3 shrink-0 text-neutral-950/40 transition-colors group-focus-within:text-neutral-950/70 dark:text-white/40 dark:group-focus-within:text-white/80" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputRef.current?.blur();
                  if (pathname !== "/") {
                    const trimmed = searchQuery.trim();
                    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
                  }
                }
                if (e.key === "Escape") {
                  setSearchQuery("");
                  inputRef.current?.blur();
                }
              }}
              placeholder="SEARCH..."
              className="h-full w-full bg-transparent px-1.5 text-[11px] text-neutral-950 placeholder:text-neutral-950/35 focus:outline-none dark:text-white dark:placeholder:text-white/40 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
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
          </form>

          {/* Theme Toggle */}
          <motion.button
            type="button"
            onClick={toggleTheme}
            whileTap={{ scale: 0.90 }}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="relative flex h-7 w-7 overflow-hidden cursor-pointer items-center justify-center border border-neutral-950/20 bg-white text-neutral-950 hover:border-neutral-950/50 dark:border-white/20 dark:bg-black dark:text-white dark:hover:border-white/50"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={theme}
                initial={{ rotate: -90, scale: 0.25, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.25, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 480,
                  damping: 24,
                  mass: 0.6,
                }}
                className="absolute flex items-center justify-center text-neutral-950 dark:text-white"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 stroke-[2.2]" />
                ) : (
                  <Moon className="h-3.5 w-3.5 stroke-[2.2]" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Auth: Direct Sign In / Sign Out */}
          {user ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={signOut}
              title={`Signed in as ${user.email || "developer"} — click to sign out`}
              aria-label="Sign out"
              className="flex h-7 cursor-pointer items-center justify-center gap-1.5 border border-neutral-950/25 bg-white px-2 sm:px-2.5 font-mono text-[11px] whitespace-nowrap text-neutral-950 transition-all hover:border-neutral-950 hover:bg-neutral-100 dark:border-white/25 dark:bg-[#111111] dark:text-white dark:hover:border-white dark:hover:bg-neutral-900"
            >
              <LogOut className="h-3.5 w-3.5 text-neutral-950/70 dark:text-white/70" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </motion.button>
          ) : (
            <motion.button
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={openLoginModal}
              title="Sign in"
              aria-label="Sign in"
              className="relative flex h-7 cursor-pointer items-center justify-center gap-1.5 border border-neutral-950 bg-neutral-950 px-2 sm:px-2.5 font-mono text-[11px] font-semibold whitespace-nowrap text-white transition-colors dark:border-white dark:bg-white dark:text-neutral-950"
            >
              {/* Concentric Double-Border Clearance Ring (Animated with Motion) */}
              <motion.span
                variants={{
                  rest: { opacity: 0, scale: 0.94 },
                  hover: { opacity: 1, scale: 1 },
                  tap: { scale: 0.97, opacity: 0.8 },
                }}
                transition={{ type: "spring", stiffness: 480, damping: 26 }}
                className="pointer-events-none absolute -inset-[3px] border border-neutral-950 dark:border-white"
                aria-hidden="true"
              />

              <UserIcon className="relative z-10 h-3.5 w-3.5 text-white dark:text-neutral-950" />
              <span className="relative z-10 hidden sm:inline">SIGN IN</span>
            </motion.button>
          )}
        </div>
      </Container>

      {/* Subtle dissolve strip so scrolling content softly transitions under the header */}
      <div
        className="pointer-events-none absolute top-full left-0 right-0 h-3.5 bg-gradient-to-b from-[#f4f3ef]/70 to-transparent dark:from-[#080808]/85"
        aria-hidden="true"
      />
    </header>
  );
}
