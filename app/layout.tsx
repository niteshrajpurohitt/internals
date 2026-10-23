import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internals — Engineering Blogs, Without the Noise",
  description: "Skip checking dozens of company sites individually. Deep dives across domains from tier-1 engineering teams, all in one place.",
  keywords: [
    "internals",
    "engineering blogs",
    "systems design",
    "distributed systems",
    "production postmortems",
    "database internals",
    "low-level systems",
    "infrastructure",
    "OpenAI engineering",
    "Cloudflare blog",
  ],
  authors: [{ name: "Internals" }],
  openGraph: {
    title: "Internals — Engineering Blogs, Without the Noise",
    description:
      "Skip checking dozens of company sites individually. Deep dives across domains from tier-1 engineering teams, all in one place.",
    type: "website",
  },
};

import { SearchProvider } from "@/lib/search-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="relative flex min-h-screen flex-col overflow-x-hidden bg-black font-sans text-white antialiased">
        <SearchProvider>
          <Header />
          {/* Main Content Area */}
          <div className="relative z-10 flex flex-1 flex-col">{children}</div>
        </SearchProvider>
      </body>
    </html>
  );
}
