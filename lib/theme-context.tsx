"use client";

import React, { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export type Theme = "dark" | "light";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="internals-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { resolvedTheme, setTheme } = useNextTheme();
  // false during server render + hydration, true afterwards (no setState-in-effect needed)
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  // During SSR and before mount, default to "dark" to match server render
  const theme: Theme = (mounted && resolvedTheme ? (resolvedTheme as Theme) : "dark") || "dark";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return {
    theme,
    toggleTheme,
    setTheme,
    mounted,
  };
}
