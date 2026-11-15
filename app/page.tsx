import { Suspense } from "react";
import { getCompanies, getPosts, getPostCount } from "@/lib/supabase";
import { createServerClientInstance } from "@/lib/supabase-server";
import { Feed } from "@/components/feed";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { Footer } from "@/components/footer";
import { Container } from "@/components/container";
import { Hero } from "@/components/hero";

export const revalidate = 60; // ISR revalidate every 60 seconds

// Fetches feed data separately so the page shell (header, hero) can be sent
// immediately while posts stream in behind the <Suspense> boundary below.
async function FeedSection() {
  const [companies, posts, totalCount] = await Promise.all([
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
  ]);

  return <Feed initialPosts={posts} companies={companies} totalCount={totalCount} />;
}

export default async function HomePage() {
  // Resolved before the first byte is sent so the hero is never shown and then
  // hidden for logged-in users. getClaims() verifies the session JWT locally
  // when the project uses asymmetric signing keys (no Auth server round-trip).
  let isLoggedIn = false;
  try {
    const supabase = await createServerClientInstance();
    const { data } = await supabase.auth.getClaims();
    isLoggedIn = !!data?.claims;
  } catch {
    isLoggedIn = false;
  }

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Container
        size="default"
        className={isLoggedIn ? "pt-6 pb-4 sm:pt-8" : "pt-8 pb-4 sm:pt-10"}
      >
        {/* Hero Section: shown to logged-out visitors, hidden for logged-in readers */}
        <Hero initialIsLoggedIn={isLoggedIn} />

        {/* Interactive Client Feed (Search, Filter, Cards) — streamed in */}
        <section aria-label="Engineering Posts Feed">
          <Suspense fallback={<FeedSkeleton />}>
            <FeedSection />
          </Suspense>
        </section>
      </Container>

      {/* Sleek Footer with Fair Use Guardrails */}
      <Footer />
    </main>
  );
}
