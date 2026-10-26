"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/logo";

export function LoginModal() {
  const {
    isLoginModalOpen,
    closeLoginModal,
    signInWithGithub,
    signInWithGoogle,
    authError,
    setAuthError,
  } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<"github" | "google" | null>(null);

  // Reset loading state when modal opens or closes
  useEffect(() => {
    setLoadingProvider(null);
  }, [isLoginModalOpen]);

  // Handle browser Back/Forward navigation cache (bfcache)
  useEffect(() => {
    const handlePageShow = () => {
      setLoadingProvider(null);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // Safety timeout: auto-reset loading state if navigation doesn't occur or user returns
  useEffect(() => {
    if (!loadingProvider) return;
    const timer = setTimeout(() => {
      setLoadingProvider(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [loadingProvider]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLoginModalOpen) {
        setLoadingProvider(null);
        closeLoginModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setLoadingProvider(null);
    setAuthError(null);
    closeLoginModal();
  };

  const handleGithub = async () => {
    try {
      setLoadingProvider("github");
      setAuthError(null);
      await signInWithGithub();
    } catch (err: unknown) {
      setLoadingProvider(null);
      const msg = err instanceof Error ? err.message : "Failed to connect to GitHub";
      setAuthError(`OAuth failure: ${msg}`);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoadingProvider("google");
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      setLoadingProvider(null);
      const msg = err instanceof Error ? err.message : "Failed to connect to Google";
      setAuthError(`OAuth failure: ${msg}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f3ef]/80 p-4 backdrop-blur-sm animate-in fade-in duration-150 dark:bg-[#080808]/85"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cad-crosshair relative w-full max-w-sm border border-neutral-950/25 bg-white px-5 pb-5 pt-2.5 sm:px-6 sm:pb-6 sm:pt-3 shadow-2xl dark:border-white/25 dark:bg-[#111111]"
      >
        {/* Top Header: Close Button */}
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer font-mono text-xs leading-none text-neutral-950/60 transition-colors hover:text-neutral-950 dark:text-white/60 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        {/* Top: Large Framed Logo Box */}
        <div className="relative flex h-44 sm:h-52 w-full items-center justify-center overflow-hidden border border-dashed border-neutral-950/20 bg-[#f4f3ef]/60 p-3 sm:p-4 dark:border-white/20 dark:bg-[#080808]/70">
          {/* Subtle Masked CAD Grid Background */}
          <div
            className="cad-grid-modal pointer-events-none absolute inset-0 z-0"
            aria-hidden="true"
          />
          <Logo className="relative z-10 h-full w-auto max-h-full max-w-full text-neutral-950 dark:text-white" />
        </div>

        {/* Heading: sign in */}
        <div className="mt-3.5 text-left">
          <h2 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white leading-none">
            Sign in
          </h2>
        </div>

        {/* Error Notification Banner */}
        {authError && (
          <div className="mt-3 border border-red-500/40 bg-red-500/10 p-2.5 font-mono text-[11px] leading-tight text-red-600 dark:border-red-400/40 dark:text-red-400">
            <span className="font-bold">[AUTH_ERROR] </span>
            {authError}
          </div>
        )}

        {/* Middle: Buttons */}
        <div className="mt-3 flex flex-col gap-2.5 font-mono text-xs">
          {/* GitHub */}
          <button
            onClick={handleGithub}
            disabled={loadingProvider !== null}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 border border-neutral-950/25 bg-neutral-950 font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 disabled:opacity-50 dark:border-white/25 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>{loadingProvider === "github" ? "Connecting..." : "Continue with GitHub"}</span>
          </button>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loadingProvider !== null}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 border border-neutral-950/20 bg-white font-medium text-neutral-950 transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-white/20 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loadingProvider === "google" ? "Connecting..." : "Continue with Google"}</span>
          </button>
        </div>

        {/* Bottom: Other text */}
        <p className="mt-4 text-center font-mono text-[11px] leading-relaxed text-neutral-950/60 dark:text-white/60">
          Save bookmarks across devices. No spam. Zero paywalls.
        </p>
      </div>
    </div>
  );
}
