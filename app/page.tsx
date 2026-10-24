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
        <header className="cad-crosshair mb-8 border border-dashed border-neutral-950/25 bg-white p-5 sm:p-6 dark:border-white/25 dark:bg-neutral-950">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl lg:text-4xl dark:text-white">
            Engineering Blogs, Without the Noise
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-neutral-950/70 sm:text-sm dark:text-white/70">
            Stop checking dozens of company sites individually. Find technical blogs from top engineering teams, all in one place. Links straight to the source.
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
