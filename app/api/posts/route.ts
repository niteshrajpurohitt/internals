import { NextRequest, NextResponse } from "next/server";
import { getPosts, getPostCount } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

  const queryOptions = { offset, limit, companyId, category, searchQuery, duration };

  try {
    const [posts, totalCount] = await Promise.all([
      getPosts(queryOptions),
      getPostCount(queryOptions),
    ]);

    const hasMore =
      totalCount > 0 ? offset + posts.length < totalCount : posts.length === limit;

    return NextResponse.json({
      posts,
      totalCount,
      hasMore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to fetch paginated posts", details: message },
      { status: 500 }
    );
  }
}
