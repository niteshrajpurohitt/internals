"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";

export function AuthToast() {
  const { signedOutToast, dismissSignedOutToast } = useAuth();

  return (
    <AnimatePresence>
      {signedOutToast && (
        <motion.div
          role="status"
          aria-live="polite"
          onClick={dismissSignedOutToast}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex cursor-pointer items-center border border-neutral-950 bg-white px-4 py-2 font-mono text-xs text-neutral-950 shadow-2xl dark:border-white dark:bg-[#111111] dark:text-white"
        >
          <span>Signed out</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
