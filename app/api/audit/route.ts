import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isTimingSafeMatch } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const syncSecret = process.env.SYNC_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  if (!syncSecret && !isDev) {
    return NextResponse.json(
      { error: "Server configuration error: SYNC_SECRET is not configured on the server" },
      { status: 500 }
    );
  }

  if (syncSecret) {
    const authHeader = req.headers.get("authorization");
    const searchParams = req.nextUrl.searchParams;
    const providedSecret =
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null) ||
      searchParams.get("secret")?.trim();

    if (!providedSecret || !isTimingSafeMatch(providedSecret, syncSecret)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing sync secret" },
        { status: 401 }
      );
    }
  }

  const client = getServiceSupabase();
  if (!client) {
    return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
  }

  // 1. Fetch total count and posts sample
  const { count: totalPosts, error: countErr } = await client
    .from("posts")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  // 2. Fetch all posts metadata (id, company_id, title, summary, tags, read_time, published_at)
  // Fetch up to 1000 posts for deep analysis

  const { data: posts, error: postsErr } = await client
    .from("posts")
    .select(`
      id,
      title,
      summary,
      tags,
      published_at,
      companies (
        name,
        slug
      )
    `)
    .order("published_at", { ascending: false })
    .limit(1000);

  if (postsErr || !posts) {
    return NextResponse.json({ error: postsErr?.message }, { status: 500 });
  }

  // 3. Analyze patterns across the posts
  const analysis = {
    totalInDb: totalPosts,
    sampleSizeAnalyzed: posts.length,
    emptyOrNoContent: [] as Array<Record<string, unknown>>,
    releaseTagPosts: [] as Array<Record<string, unknown>>,
    boilerplateSummaries: [] as Array<Record<string, unknown>>,
    marketingOrPrPatterns: [] as Array<Record<string, unknown>>,
    policyOrLaborPatterns: [] as Array<Record<string, unknown>>,
    taggedOnlyArchitectureEngineering: [] as Array<Record<string, unknown>>,
    tagDistribution: {} as Record<string, number>,
    companyDistribution: {} as Record<string, number>,
  };

  

  for (const p of posts) {
    const compName = (p.companies as { name?: string } | null)?.name || "Unknown";
    analysis.companyDistribution[compName] = (analysis.companyDistribution[compName] || 0) + 1;

    for (const tag of p.tags || []) {
      analysis.tagDistribution[tag] = (analysis.tagDistribution[tag] || 0) + 1;
    }

    const titleLower = p.title.toLowerCase();
    const summaryLower = (p.summary || "").toLowerCase();

    // Check empty or no content
    if (!p.summary || p.summary === "No content." || p.summary.length < 30) {
      if (analysis.emptyOrNoContent.length < 15) {
        analysis.emptyOrNoContent.push({ company: compName, title: p.title, summary: p.summary });
      }
    }

    // Check release tags
    if (/^v?[0-9]+\.[0-9]+/i.test(p.title) || /^release\s+v/i.test(p.title)) {
      if (analysis.releaseTagPosts.length < 15) {
        analysis.releaseTagPosts.push({ company: compName, title: p.title, tags: p.tags });
      }
    }

    // Check boilerplate summary
    if (
      summaryLower.includes("is an ai safety and research company") ||
      summaryLower.includes("overview of the latest") ||
      summaryLower.includes("stay tuned")
    ) {
      if (analysis.boilerplateSummaries.length < 15) {
        analysis.boilerplateSummaries.push({ company: compName, title: p.title, summary: p.summary });
      }
    }

    // Check PR/marketin
    if (
      titleLower.includes("partner") ||
      titleLower.includes("webinar") ||
      titleLower.includes("customer story") ||
      titleLower.includes("case study") ||
      titleLower.includes("series a") ||
      titleLower.includes("funding") ||
      titleLower.includes("advertising")
    ) {
      if (analysis.marketingOrPrPatterns.length < 15) {
        analysis.marketingOrPrPatterns.push({ company: compName, title: p.title, tags: p.tags });
      }
    }

    // Check policy/labor
    if (
      titleLower.includes("job") ||
      titleLower.includes("labor") ||
      titleLower.includes("policy") ||
      titleLower.includes("societal") ||
      titleLower.includes("economic") ||
      titleLower.includes("what do you want")
    ) {
      if (analysis.policyOrLaborPatterns.length < 15) {
        analysis.policyOrLaborPatterns.push({ company: compName, title: p.title, tags: p.tags });
      }
    }


  
    // Check fallback tag
    const isOnlyArchEng =
      p.tags?.length === 2 &&
      p.tags.includes("Architecture") &&
      p.tags.includes("Engineering");
    if (isOnlyArchEng) {
      if (analysis.taggedOnlyArchitectureEngineering.length < 15) {
        analysis.taggedOnlyArchitectureEngineering.push({
          company: compName,
          title: p.title,
          summary: p.summary?.slice(0, 80),
        });
      }
    }
  }

  return NextResponse.json(analysis);
}