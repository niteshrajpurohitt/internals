import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Internals Mark (Concept 2: Interlocking IN)
 * A custom geometric brutalist monogram built from scratch.
 * The "I" and "N" interlock to create an internal negative-space vault.
 */
export function Logo({ className = "h-5 w-5", size = 20 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* The 'I' Monolith */}
      <rect x="3" y="3" width="4" height="18" fill="currentColor" />

      {/* The 'N' Structure with Internal Vault/Chamber */}
      <path
        d="M10 21V3H21V21H17V7H14V21H10Z"
        fill="currentColor"
      />
    </svg>
  );
}
