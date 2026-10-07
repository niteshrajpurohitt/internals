import { getCompanies, getPosts, getPostCount } from "@/lib/supabase";
import { Feed } from "@/components/feed";
import { Footer } from "@/components/footer";
import { Container } from "@/components/container";
import { Layers, Cpu, Radio } from "lucide-react";

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function HomePage() {
  const [companies, posts, totalCount] = await Promise.all([
    getCompanies(),
    getPosts({ offset: 0, limit: 40 }),
    getPostCount(),
  ]);

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Container className="pt-16 pb-12 sm:pt-24">
        {/* Hero Section: Linear-Style Minimal Header */}
        <header className="mb-12 space-y-4 sm:mb-16">
          {/* High-Contrast Hero Title */}
          <h1 className="text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Engineering Feed
          </h1>

          {/* Crisp Subtitle */}
          <p className="max-w-2xl text-sm leading-relaxed font-normal text-zinc-400 sm:text-base">
            Curated architectural deep dives, production postmortems, and timeless classics from
            tier-1 engineering teams. Distributed systems, AI compute, storage engines, compilers,
            and modern web platforms.
          </p>

          {/* Quick Technical Specs Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.04] pt-2 font-mono text-xs text-zinc-500 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              <span>{companies.length} Tier-1 Orgs</span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-zinc-400" />
              <span>{totalCount.toLocaleString()} Curated Logs</span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-zinc-400">Zero Paywall / Canonical Direct</span>
            </div>
          </div>
        </header>

        {/* Interactive Client Feed (Search, Filter, Cards) */}
        <section aria-label="Engineering Posts Feed">
          <Feed initialPosts={posts} companies={companies} totalCount={totalCount} />
        </section>
      </Container>

      {/* Sleek Footer with Fair Use Guardrails */}
      <Footer />
    </main>
  );
}
