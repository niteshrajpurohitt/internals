"use client";

import { motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { useFollows, type FollowTarget } from "@/lib/follow-context";

interface FollowButtonProps {
  target: FollowTarget;
  /** "label": "+ FOLLOW" / "✓ FOLLOWING" (page headers). "icon": square +/✓ next to a filter. */
  variant?: "label" | "icon";
  className?: string;
}

const BASE =
  "inline-flex h-7 shrink-0 cursor-pointer items-center justify-center border font-mono text-xs font-bold uppercase tracking-wider transition-colors duration-100";
const ON =
  "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-black";
const OFF =
  "border-neutral-950/20 bg-white text-neutral-950/70 hover:border-neutral-950/50 hover:text-neutral-950 dark:border-white/20 dark:bg-[#111111] dark:text-white/70 dark:hover:border-white/50 dark:hover:text-white";

export function FollowButton({ target, variant = "label", className = "" }: FollowButtonProps) {
  const { isFollowing, toggleFollow } = useFollows();
  const following = isFollowing(target);
  const Icon = following ? Check : Plus;
  const description = following
    ? `Following ${target.label}. Click to unfollow`
    : `Follow ${target.label}: its posts appear under the Following tab`;

  return (
    <motion.button
      type="button"
      initial={variant === "icon" ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.12 }}
      onClick={() => toggleFollow(target)}
      aria-pressed={following}
      aria-label={description}
      title={description}
      className={`${BASE} ${variant === "icon" ? "w-7" : "gap-1.5 px-2.5"} ${following ? ON : OFF} ${className}`}
    >
      <Icon className={variant === "icon" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      {variant === "label" && <span>{following ? "Following" : "Follow"}</span>}
    </motion.button>
  );
}
