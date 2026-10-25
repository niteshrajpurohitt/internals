"use client";

import { useAuth } from "@/lib/auth-context";
import DecryptedText from "@/components/decrypted-text";

interface HeroProps {
  initialIsLoggedIn?: boolean;
}

export function Hero({ initialIsLoggedIn }: HeroProps) {
  const { user, isLoading } = useAuth();

  // If user is logged in (either confirmed by server on mount, or by client auth state), hide hero
  const isLoggedIn = user !== null || (initialIsLoggedIn && isLoading);

  if (isLoggedIn) {
    return null;
  }

  return (
    <header className="flex min-h-[46vh] flex-col justify-center pb-10 pt-4 sm:min-h-[48vh] sm:pb-14 sm:pt-6">
      <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl dark:text-white leading-[1.04]">
        Engineering Blogs,{" "}
        <DecryptedText
          text="Without the Noise"
          animateOn="hover"
          animateOnLoad={true}
          sequential={true}
          revealDirection="start"
          speed={45}
          useOriginalCharsOnly={false}
          characters="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+"
          className="text-neutral-950 dark:text-white"
          encryptedClassName="text-neutral-950/40 dark:text-white/40"
          parentClassName="cursor-pointer"
        />
      </h1>
      <p className="mt-5 max-w-2xl font-mono text-xs leading-relaxed text-neutral-950/70 sm:text-sm sm:leading-relaxed dark:text-white/70">
        Stop checking dozens of company sites individually. Find technical blogs from top engineering teams, all in one place. Links straight to the source.
      </p>
    </header>
  );
}
