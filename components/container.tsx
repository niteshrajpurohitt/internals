import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "narrow" | "default" | "wide";
}

export function Container({ children, className, size = "default", ...props }: ContainerProps) {
  const sizeMap = {
    narrow: "max-w-3xl",
    default: "max-w-4xl",
    wide: "max-w-6xl",
  };

  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6", sizeMap[size], className)} {...props}>
      {children}
    </div>
  );
}
