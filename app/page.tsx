import { getCompanies, getPosts, getPostCount } from "@/lib/supabase";
import { Feed } from "@/components/feed";
import { Footer } from "@/components/footer";
import { Container } from "@/components/container";

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function HomePage() {
  const [companies, posts, totalCount] = await Promise.all([
    getCompanies(),
    getPosts({ offset: 0, limit: 40 }),
    getPostCount(),
  ]);

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Container size="wide" className="pt-8 pb-12 sm:pt-10">
        {/* CAD Blueprint Hero Section */}
        <header className="cad-crosshair mb-8 border border-white/20 bg-black p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2 font-mono text-[11px] text-white/50">
            <div className="flex items-center gap-2">
              <span className="border border-white/50 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">[ 01 ]</span>
              <span className="tracking-wider">CURATED SYSTEMS ARCHITECTURE</span>
            </div>
            <span>|← 38 FEEDS ACTIVE →|</span>
          </div>

          <h1 className="mt-3.5 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Curated Systems Architecture
          </h1>

          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-white/70">
            Architectural deep dives, production postmortems, and distributed systems classics from
            38 tier-1 engineering teams. Zero marketing fluff, direct outward canonical links.
          </p>
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
