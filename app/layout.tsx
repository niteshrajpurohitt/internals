import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { SearchProvider } from "@/lib/search-context";
import { AuthProvider } from "@/lib/auth-context";
import { BookmarkProvider } from "@/lib/bookmark-context";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/lib/toast-context";
import { LoginModal } from "@/components/login-modal";
import { ToastContainer } from "@/components/toast-container";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("internals-theme")?.value;
  const theme = themeCookie === "light" ? "light" : "dark";
  const bg = theme === "light" ? "#f4f3ef" : "#080808";

  return (
    <html
      lang="en"
      data-theme={theme}
      suppressHydrationWarning
      style={{ backgroundColor: bg, colorScheme: theme }}
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Anti-FOUC: fallback in case cookie is stale or localStorage was updated out of band */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('internals-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);document.documentElement.style.backgroundColor=t==='light'?'#f4f3ef':'#080808';document.documentElement.style.colorScheme=t;}}catch(e){}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body{background-color:${bg} !important;color-scheme:${theme};}html[data-theme="light"],html[data-theme="light"] body{background-color:#f4f3ef !important;color-scheme:light;}html[data-theme="dark"],html[data-theme="dark"] body{background-color:#080808 !important;color-scheme:dark;}`,
          }}
        />
      </head>
      <body
        style={{ backgroundColor: bg }}
        className="relative flex min-h-screen flex-col overflow-x-hidden font-sans text-neutral-950 antialiased dark:text-white"
      >
        {/* Masked CAD Drafting Grid Layer */}
        <div className="cad-grid-layer pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
        <ThemeProvider initialTheme={theme}>
          <ToastProvider>
            <AuthProvider>
              <BookmarkProvider>
                <SearchProvider>
                  <Header />
                  <div className="relative z-10 flex flex-1 flex-col">{children}</div>
                  <LoginModal />
                  <ToastContainer />
                </SearchProvider>
              </BookmarkProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
