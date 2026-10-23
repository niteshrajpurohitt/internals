"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { createBrowserClientInstance } from "./supabase-browser";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const supabase = useMemo(() => createBrowserClientInstance(), []);

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
      } catch {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  const signInWithGoogle = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoginModalOpen,
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
