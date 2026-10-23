import { NextRequest, NextResponse } from "next/server";
import { getPosts, getPostCount } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const companyId = searchParams.get("companyId") || undefined;
  const category = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("q") || undefined;

  const queryOptions = { offset, limit, companyId, category, searchQuery };

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
