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

  const sources = [
    { num: "01", name: "CLOUDFLARE" },
    { num: "02", name: "OPENAI" },
    { num: "03", name: "STRIPE" },
    { num: "04", name: "UBER" },
    { num: "05", name: "NETFLIX" },
    { num: "06", name: "FIGMA" },
    { num: "07", name: "DATADOG" },
  ];

  const tags = ["CLASSICS", "DISTRIBUTED SYSTEMS", "POSTMORTEMS", "DATABASES"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#070707",
          padding: 48,
          color: "#ffffff",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Subtle CAD Inset Border */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            pointerEvents: "none",
          }}
        />

        {/* CAD Corner Marker Dots */}
        <div
          style={{
            position: "absolute",
            top: 21.5,
            left: 21.5,
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 21.5,
            right: 21.5,
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 21.5,
            left: 21.5,
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 21.5,
            right: 21.5,
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
          }}
        />

        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingBottom: 24,
            borderBottom: "1px solid rgba(255, 255, 255, 0.09)",
            boxSizing: "border-box",
          }}
        >
          {/* Logo + Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg
              width="28"
              height="28"
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
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "#ffffff",
              }}
            >
              INTERNALS
            </span>
          </div>

          {/* Header Metadata */}
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 12,
              color: "#666666",
              letterSpacing: "0.1em",
              display: "flex",
            }}
          >
            LINKS STRAIGHT TO THE SOURCE
          </div>
        </div>

        {/* Main Split Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            width: "100%",
            gap: 56,
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          {/* Left Column: Headline & Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1.25,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Space Grotesk",
                fontSize: 58,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Engineering Blogs,</span>
              <span style={{ color: "#a3a3a3" }}>Without the Noise.</span>
            </div>

            <p
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#888888",
                marginTop: 22,
                marginBottom: 28,
                maxWidth: 530,
              }}
            >
              Stop checking dozens of company sites individually. Find technical
              blogs from top engineering teams, all in one place.
            </p>

            {/* Topic Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    fontFamily: "JetBrains Mono",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "#d4d4d4",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    padding: "6px 12px",
                    display: "flex",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Sources Index */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 0.95,
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "28px 32px",
              boxSizing: "border-box",
            }}
          >
            {/* Box Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 14,
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  color: "#737373",
                  display: "flex",
                }}
              >
                INDEXED SOURCES
              </span>
            </div>

            {/* List of Teams */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {sources.map((src) => (
                <div
                  key={src.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: "JetBrains Mono",
                    fontSize: 14,
                    padding: "2px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#525252", fontSize: 12 }}>{src.num}</span>
                    <span
                      style={{
                        color: "#f5f5f5",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {src.name}
                    </span>
                  </div>
                  <span style={{ color: "#404040", fontSize: 12 }}>→</span>
                </div>
              ))}
            </div>
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
