"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/lib/toast-context";

export function ToastContainer() {
  const { toasts, dismissToast, isHovered, setIsHovered } = useToast();

  const visibleToasts = toasts.slice(0, 3);

  if (visibleToasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end pointer-events-none"
    >
      <div className="relative min-w-[140px] max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {visibleToasts.map((toast, index) => {
            // Emil Kowalski 3D card stacking math
            const targetY = isHovered ? -index * 44 : -index * 10;
            const targetScale = isHovered ? 1 : 1 - index * 0.05;
            const targetOpacity = isHovered ? 1 : 1 - index * 0.18;
            const zIndex = 50 - index;

            return (
              <motion.div
                key={toast.id}
                layout
                role={toast.type === "error" ? "alert" : "status"}
                aria-live="polite"
                initial={{ opacity: 0, y: 20, scale: 0.94 }}
                animate={{
                  opacity: targetOpacity,
                  y: targetY,
                  scale: targetScale,
                }}
                exit={{
                  opacity: 0,
                  y: 16,
                  scale: 0.92,
                  transition: { duration: 0.15, ease: "easeOut" },
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 28,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.35 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 25 || info.velocity.y > 200) {
                    dismissToast(toast.id);
                  }
                }}
                onClick={() => dismissToast(toast.id)}
                style={{
                  zIndex,
                  position: index === 0 ? "relative" : "absolute",
                  bottom: 0,
                  right: 0,
                  transformOrigin: "bottom center",
                }}
                className={`flex cursor-pointer select-none items-center justify-center text-center border bg-white px-4 py-2 font-mono text-xs shadow-2xl transition-colors dark:bg-[#111111] ${
                  toast.type === "error"
                    ? "border-red-500/40 text-neutral-950 dark:border-red-400/40 dark:text-white"
                    : "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
                }`}
              >
                <span className="w-full text-center">{toast.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

