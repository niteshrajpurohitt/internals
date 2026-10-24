import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "h-5 w-5", size = 20 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M168.01 168.01H320.76V243.4H168.01Zm267.41 0H855.99V243.4H435.42Zm-267.41 84.2H320.76V419.53H168.01Zm267.41 0H855.99V419.53H703.24V320.67H588.58v98.86H435.42ZM168.01 428.34H320.76V595.66H168.01Zm267.41 0H588.58V595.66H435.42Zm267.82 0H855.99V595.66H703.24ZM168.01 604.47H320.76V771.79H168.01Zm267.41 0H588.58V771.79H435.42Zm267.82 0H855.99V771.79H703.24ZM168.01 780.6H320.76v75.39H168.01Zm267.41 0H588.58v75.39H435.42Zm267.82 0H855.99v75.39H703.24Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
