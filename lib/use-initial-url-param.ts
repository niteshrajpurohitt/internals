"use client";

import { useSyncExternalStore } from "react";

// URL params as they were when the page first loaded in the browser.
// Captured once so later `history.replaceState` clean-ups don't change the value.
const initialParams = new Map<string, string | null>();

function readInitialParam(name: string): string | null {
  if (!initialParams.has(name)) {
    let value: string | null = null;
    try {
      value = new URLSearchParams(window.location.search).get(name);
    } catch {
      value = null;
    }
    initialParams.set(name, value);
  }
  return initialParams.get(name) ?? null;
}

const noopSubscribe = () => () => {};

/**
 * Returns a URL query param from the initial page load.
 *
 * During server render and hydration this returns `null` (the server cannot see
 * the browser URL), and React re-renders with the real value right after
 * hydration. Reading `window.location` inside a `useState` initializer instead
 * makes the server and client HTML differ and causes a hydration error.
 */
export function useInitialUrlParam(name: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => readInitialParam(name),
    () => null
  );
}
