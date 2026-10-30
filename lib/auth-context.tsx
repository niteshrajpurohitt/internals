"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createBrowserClientInstance } from "./supabase-browser";
import { useToast } from "./toast-context";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return Boolean(new URLSearchParams(window.location.search).get("auth_error"));
      } catch {
        return false;
      }
    }
    return false;
  });
  const [authError, setAuthError] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        if (new URLSearchParams(window.location.search).get("auth_error")) {
          return "Authentication was interrupted or failed. Please try again.";
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const { showToast } = useToast();

  const supabase = useMemo(() => createBrowserClientInstance(), []);

  // Clean up ?auth_error param from address bar after initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth_error")) {
        params.delete("auth_error");
        const cleanUrl =
          window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("[Auth] Session fetch warning:", err);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGithub = async () => {
    setAuthError(null);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    // Provide instant responsive UI feedback
    setUser(null);
    showToast("Signed out");

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[Auth] Sign out warning:", err);
    }
  };

  const openLoginModal = () => {
    setAuthError(null);
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => {
    setAuthError(null);
    setIsLoginModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoginModalOpen,
        authError,
        setAuthError,
        openLoginModal,
        closeLoginModal,
        signInWithGithub,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
