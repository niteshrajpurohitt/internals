"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

export type ToastType = "info" | "error" | "success";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  dismissToast: (id: string) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const timersRef = useRef<Map<string, { timeoutId: NodeJS.Timeout; remaining: number; start: number }>>(
    new Map()
  );

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer.timeoutId);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3500) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        id,
        message,
        type,
        duration,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5));

      const timeoutId = setTimeout(() => {
        dismissToast(id);
      }, duration);

      timersRef.current.set(id, {
        timeoutId,
        remaining: duration,
        start: Date.now(),
      });

      return id;
    },
    [dismissToast]
  );

  // Pause timers on hover, resume on leave (Emil Kowalski principle)
  useEffect(() => {
    if (isHovered) {
      timersRef.current.forEach((val) => {
        clearTimeout(val.timeoutId);
        const elapsed = Date.now() - val.start;
        val.remaining = Math.max(val.remaining - elapsed, 1000);
      });
    } else {
      timersRef.current.forEach((val, id) => {
        val.start = Date.now();
        val.timeoutId = setTimeout(() => {
          dismissToast(id);
        }, val.remaining);
      });
    }
  }, [isHovered, dismissToast]);

  // Clean up all timers on unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((val) => clearTimeout(val.timeoutId));
      currentTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        isHovered,
        setIsHovered,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

