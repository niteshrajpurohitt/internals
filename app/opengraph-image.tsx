import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Internals — Engineering Blogs, Without the Noise";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [spaceGroteskBold, jetbrainsMonoMedium] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/SpaceGrotesk-Bold.woff")),
    readFile(join(process.cwd(), "assets/fonts/JetBrainsMono-Medium.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#080808",
          padding: "80px 88px",
          color: "#ffffff",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Masked CAD Engineering Grid (Major 60px + Minor 15px) */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <defs>
            {/* Minor grid lines */}
            <pattern
              id="grid-minor"
              width="15"
              height="15"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 15 0 L 0 0 0 15"
                fill="none"
                stroke="rgba(255, 255, 255, 0.035)"
                strokeWidth="1"
              />
            </pattern>

            {/* Major grid lines */}
            <pattern
              id="grid-major"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <rect width="60" height="60" fill="url(#grid-minor)" />
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(255, 255, 255, 0.09)"
                strokeWidth="1"
              />
            </pattern>

            {/* Smooth radial mask fading out behind the headline */}
            <radialGradient
              id="cad-grid-fade"
              cx="75%"
              cy="28%"
              r="75%"
              fx="75%"
              fy="28%"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <mask id="cad-mask">
              <rect
                width="1200"
                height="630"
                fill="url(#cad-grid-fade)"
              />
            </mask>
          </defs>

          <rect
            width="1200"
            height="630"
            fill="url(#grid-major)"
            mask="url(#cad-mask)"
          />
        </svg>

        {/* Top Header: Logo + Brand Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            zIndex: 1,
          }}
        >
          {/* Internals Geometric Architecture Glyph */}
          <svg
            width="34"
            height="34"
            viewBox="168 168 688 688"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M168.01 168.01H320.76V243.4H168.01Zm267.41 0H855.99V243.4H435.42Zm-267.41 84.2H320.76V419.53H168.01Zm267.41 0H855.99V419.53H703.24V320.67H588.58v98.86H435.42ZM168.01 428.34H320.76V595.66H168.01Zm267.41 0H588.58V595.66H435.42Zm267.82 0H855.99V595.66H703.24ZM168.01 604.47H320.76V771.79H168.01Zm267.41 0H588.58V771.79H435.42Zm267.82 0H855.99V771.79H703.24ZM168.01 780.6H320.76v75.39H168.01Zm267.41 0H588.58v75.39H435.42Zm267.82 0H855.99v75.39H703.24Z"
              fill="#ffffff"
              fillRule="evenodd"
            />
          </svg>
          <span
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            Internals
          </span>
        </div>

        {/* Core Hero Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 78,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Engineering Blogs,</span>
            <span style={{ color: "#737373" }}>Without the Noise.</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: spaceGroteskBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "JetBrains Mono",
          data: jetbrainsMonoMedium,
          weight: 500,
          style: "normal",
        },
      ],
    }
  );
}
