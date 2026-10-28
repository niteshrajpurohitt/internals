import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { SearchProvider } from "@/lib/search-context";
import { AuthProvider } from "@/lib/auth-context";
import { BookmarkProvider } from "@/lib/bookmark-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LoginModal } from "@/components/login-modal";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://internals.niteshrajpurohit.in"),
  title: "Internals — Engineering Blogs, Without the Noise",
  description: "Stop checking dozens of company sites individually. Find technical blogs from top engineering teams, all in one place.",
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
      "Stop checking dozens of company sites individually. Find technical blogs from top engineering teams, all in one place.",
    url: "https://internals.niteshrajpurohit.in",
    siteName: "Internals",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Internals — Engineering Blogs, Without the Noise",
    description:
      "Stop checking dozens of company sites individually. Find technical blogs from top engineering teams, all in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Anti-FOUC: apply stored theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('internals-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f4f3ef] font-sans text-neutral-950 antialiased dark:bg-[#080808] dark:text-white">
        {/* Masked CAD Drafting Grid Layer */}
        <div className="cad-grid-layer pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
        <ThemeProvider>
          <AuthProvider>
            <BookmarkProvider>
              <SearchProvider>
                <Header />
                <div className="relative z-10 flex flex-1 flex-col">{children}</div>
                <LoginModal />
              </SearchProvider>
            </BookmarkProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
