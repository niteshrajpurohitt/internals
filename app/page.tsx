import { Suspense } from "react";
import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { getCachedCompanies, getCompanies, getPosts, getPostCount } from "@/lib/supabase";
import {
  DEFAULT_FEED_FILTERS,
  isTopicCategory,
  parseFeedFilters,
  serverRenderableFilters,
  type FeedFilters,
} from "@/lib/feed-filters";
import { createServerClientInstance } from "@/lib/supabase-server";
import { Feed } from "@/components/feed";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { Footer } from "@/components/footer";
import { Container } from "@/components/container";
import { Hero } from "@/components/hero";

// Note: this page reads the auth cookie (to hide the hero for signed-in users), so it
// is rendered per request; an ISR `revalidate` export would have no effect here.

// Fetches feed data separately so the page shell (header, hero) can be sent
// immediately while posts stream in behind the <Suspense> boundary below.
type HomeSearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const DURATION_TITLES: Record<string, string> = {
  quick: "Under 5 min",
  standard: "5–10 min",
  long: "10+ min",
};

// A shared filtered link (e.g. ?category=postmortems&company=stripe) gets a matching
// title, so it reads well in browser tabs and link previews.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  if (!params.category && !params.company && !params.duration) return {};

  const companies = await getCachedCompanies().catch(() => []);
  const filters = parseFeedFilters(params, companies);
  const company = companies.find((c) => c.id === filters.companyId);

  const parts = [
    company?.name,
    isTopicCategory(filters.category) ? filters.category : null,
    DURATION_TITLES[filters.duration],
  ].filter(Boolean);
  if (parts.length === 0) return {};

  const title = `${parts.join(" · ")} — Internals`;
  return {
    title,
    openGraph: { title },
    twitter: { title },
  };
}

async function FeedSection({ searchParams }: { searchParams: HomeSearchParams }) {
  const params = await searchParams;
  const hasFilterParams = Boolean(params.category || params.company || params.duration);

  const companiesPromise = getCompanies({ minPosts: 2 }).catch((err) => {
    console.warn("HomePage getCompanies warning:", err);
    return [];
  });

  // The company slug in the URL must be turned into an id before posts can be
  // queried, so only wait for companies first when a filter was actually given.
  const initialFilters: FeedFilters = hasFilterParams
    ? parseFeedFilters(params, await companiesPromise)
    : DEFAULT_FEED_FILTERS;
  const query = serverRenderableFilters(initialFilters);
  const queryOptions = {
    companyId: query.companyId,
    category: query.category,
    duration: query.duration,
  };

  const [companies, posts, totalCount] = await Promise.all([
    companiesPromise,
    getPosts({ offset: 0, limit: 20, ...queryOptions }).catch((err) => {
      console.warn("HomePage getPosts warning:", err);
      return [];
    }),
    getPostCount(queryOptions).catch((err) => {
      console.warn("HomePage getPostCount warning:", err);
      return 0;
    }),
  ]);

  return (
    <Feed
      initialPosts={posts}
      companies={companies}
      totalCount={totalCount}
      initialFilters={initialFilters}
    />
  );
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  // Resolved before the first byte is sent so the hero is never shown and then
  // hidden for logged-in users. getClaims() verifies the session JWT locally
  // when the project uses asymmetric signing keys (no Auth server round-trip).
  let isLoggedIn = false;
  try {
    const supabase = await createServerClientInstance();
    const { data } = await supabase.auth.getClaims();
    isLoggedIn = !!data?.claims;
  } catch (err) {
    // Let Next.js handle its own internal errors (e.g. dynamic-rendering signals)
    unstable_rethrow(err);
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
            <FeedSection searchParams={searchParams} />
          </Suspense>
        </section>
      </Container>

      {/* Sleek Footer with Fair Use Guardrails */}
      <Footer />
    </main>
  );
}
