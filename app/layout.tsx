import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internals — Engineering Blogs, Without the Noise",
  description: "Stop checking dozens of company sites individually for technical blogs. Deep dives from top engineering teams, all in one place.",
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
      "Stop checking dozens of company sites individually for technical blogs. Deep dives from top engineering teams, all in one place.",
    type: "website",
  },
};

import { SearchProvider } from "@/lib/search-context";
import { AuthProvider } from "@/lib/auth-context";
import { LoginModal } from "@/components/login-modal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}>
      <body className="relative flex min-h-screen flex-col overflow-x-hidden bg-black font-sans text-white antialiased">
        <AuthProvider>
          <SearchProvider>
            <Header />
            {/* Main Content Area */}
            <div className="relative z-10 flex flex-1 flex-col">{children}</div>
            <LoginModal />
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
