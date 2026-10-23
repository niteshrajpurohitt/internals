import { getCompanies, getPosts, getPostCount } from "@/lib/supabase";
import { Feed } from "@/components/feed";
import { Footer } from "@/components/footer";
import { Container } from "@/components/container";

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function HomePage() {
  const [companies, posts, totalCount] = await Promise.all([
    getCompanies({ minPosts: 2 }),
    getPosts({ offset: 0, limit: 20 }),
    getPostCount(),
  ]);

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Container size="default" className="pt-8 pb-4 sm:pt-10">
        {/* Hero Section */}
        <header className="cad-crosshair mb-8 border border-dashed border-white/25 bg-neutral-950 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Engineering Blogs, Without the Noise
          </h1>

          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-white/70">
            Stop checking dozens of company sites individually for technical blogs. Deep dives from top engineering teams, all in one place. Links straight to the source.
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
