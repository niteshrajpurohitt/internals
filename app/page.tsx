import { getCompanies, getPosts, getPostCount } from "@/lib/supabase";
import { createServerClientInstance } from "@/lib/supabase-server";
import { Feed } from "@/components/feed";
import { Footer } from "@/components/footer";
import { Container } from "@/components/container";
import { Hero } from "@/components/hero";

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function HomePage() {
  const [companies, posts, totalCount, supabase] = await Promise.all([
    getCompanies({ minPosts: 2 }).catch((err) => {
      console.warn("HomePage getCompanies warning:", err);
      return [];
    }),
    getPosts({ offset: 0, limit: 20 }).catch((err) => {
      console.warn("HomePage getPosts warning:", err);
      return [];
    }),
    getPostCount().catch((err) => {
      console.warn("HomePage getPostCount warning:", err);
      return 0;
    }),
    createServerClientInstance().catch(() => null),
  ]);

  let isLoggedIn = false;
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isLoggedIn = !!user;
    } catch {
      isLoggedIn = false;
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Container
        size="default"
        className={isLoggedIn ? "pt-6 pb-4 sm:pt-8" : "pt-8 pb-4 sm:pt-10"}
      >
        {/* Hero Section: shown to logged-out visitors, hidden for logged-in readers */}
        <Hero initialIsLoggedIn={isLoggedIn} />

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

