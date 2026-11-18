import { NextRequest, NextResponse } from "next/server";
import { getPosts, getPostCount, type FollowFilter } from "@/lib/supabase";
import { slugToCategory } from "@/lib/feed-filters";

export const dynamic = "force-dynamic";

function splitList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawOffset = parseInt(searchParams.get("offset") || "0", 10);
  const rawLimit = parseInt(searchParams.get("limit") || "20", 10);

  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;

  const companyId = searchParams.get("companyId") || undefined;
  const category = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("q") || undefined;
  const duration = searchParams.get("duration") || undefined;

  // "Following" feed: ?followCompanies=<id>,<id>&followCategories=<slug>,<slug>
  // The ids come from the client (not the session) so the response stays cacheable
  // and contains nothing personal. Unknown values are dropped.
  const isFollowingFeed = searchParams.get("following") === "1";
  const follows: FollowFilter | undefined = isFollowingFeed
    ? {
        companyIds: splitList(searchParams.get("followCompanies")).slice(0, 100),
        categories: splitList(searchParams.get("followCategories"))
          .map((slug) => slugToCategory(slug))
          .filter((c): c is NonNullable<typeof c> => c !== null),
      }
    : undefined;

  const queryOptions = {
    offset,
    limit,
    companyId,
    category: isFollowingFeed ? undefined : category,
    searchQuery,
    duration,
    follows,
  };

  try {
    const [posts, totalCount] = await Promise.all([
      getPosts(queryOptions),
      getPostCount(queryOptions),
    ]);

    const hasMore =
      totalCount > 0 ? offset + posts.length < totalCount : posts.length === limit;

    return NextResponse.json(
      {
        posts,
        totalCount,
        hasMore,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: unknown) {
    // Log the real database error server-side; never send it to the browser.
    console.error("[api/posts] query failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
