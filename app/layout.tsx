import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "engfeed — Technical Engineering Blog Aggregator",
  description: "Curated architectural deep dives and systems design from tier-1 engineering teams.",
  keywords: [
    "engineering blogs",
    "systems design",
    "distributed systems",
    "infrastructure",
    "OpenAI engineering",
    "Vercel architecture",
    "Cloudflare blog",
  ],
  authors: [{ name: "engfeed" }],
  openGraph: {
    title: "engfeed — Technical Engineering Blog Aggregator",
    description:
      "Curated architectural deep dives and systems design from tier-1 engineering teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#09090b] font-sans text-zinc-100 antialiased">
        {/* Glowing radial background gradient at the hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden"
        >
          <div className="hero-radial-glow h-[500px] w-full max-w-5xl transform-gpu opacity-40 blur-[100px]" />
        </div>

        {/* Subtle dot/grid background texture */}
        <div
          aria-hidden="true"
          className="bg-grid-pattern pointer-events-none fixed inset-0 z-0 opacity-40"
        />

        {/* Main Content Area */}
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
