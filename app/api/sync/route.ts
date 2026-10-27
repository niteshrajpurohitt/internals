import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase";
import { fetchAndParseFeed, detectCategories, isMarketingFluff, decodeHtmlEntities, cleanTitle } from "@/lib/rss";
import { LANDMARK_POSTMORTEMS, LANDMARK_CLASSICS } from "@/lib/classics";

export const maxDuration = 60; // Allow up to 60s for full feed sync
export const dynamic = "force-dynamic";

function isTimingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const startTime = Date.now();

  // 1. Mandatory Secret Guard (fail-closed in production)
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

  // 2. Obtain Supabase Client
  const client = getServiceSupabase();
  if (!client) {
    return NextResponse.json({ error: "Supabase client is not configured" }, { status: 500 });
  }

  // Check if reclassification or database cleanup is requested
  if (req.nextUrl.searchParams.get("reclassify") === "true" || req.nextUrl.searchParams.get("clean") === "true") {
    let allPosts: Array<{ id: string; title: string; summary: string; tags: string[] }> = [];
    let page = 0;
    const pageSize = 1000;

    // Paginate through the entire database to overcome PostgREST 1000-row limit
    while (true) {
      const { data: chunk, error: fetchErr } = await client
        .from("posts")
        .select("id, title, summary, tags")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (fetchErr) {
        return NextResponse.json(
          { error: "Failed to fetch posts for reclassification", details: fetchErr.message },
          { status: 500 }
        );
      }

      if (!chunk || chunk.length === 0) break;
      allPosts = allPosts.concat(chunk);
      if (chunk.length < pageSize) break;
      page++;
    }

    let deletedCount = 0;
    let updatedCount = 0;

    // Process in batches of 50
    for (let i = 0; i < allPosts.length; i += 50) {
      const batch = allPosts.slice(i, i + 50);
      await Promise.all(
        batch.map(async (p) => {
          const cleanedTitle = cleanTitle(p.title);
          const decodedSummary = decodeHtmlEntities(p.summary || "");

          // Check against veto patterns and quality gates
          if (
            isMarketingFluff(cleanedTitle, decodedSummary) ||
            isMarketingFluff(p.title, p.summary || "")
          ) {
            await client.from("posts").delete().eq("id", p.id);
            deletedCount++;
            return;
          }

          const newTags = detectCategories(cleanedTitle, decodedSummary, p.tags || []);
          if (!newTags || newTags.length === 0) {
            await client.from("posts").delete().eq("id", p.id);
            deletedCount++;
            return;
          }

          const currentSorted = (p.tags || []).slice().sort().join(",");
          const newSorted = newTags.slice().sort().join(",");
          const needsUpdate =
            currentSorted !== newSorted ||
            p.title !== cleanedTitle ||
            p.summary !== decodedSummary;

          if (needsUpdate) {
            await client
              .from("posts")
              .update({
                title: cleanedTitle,
                summary: decodedSummary,
                tags: newTags,
              })
              .eq("id", p.id);
            updatedCount++;
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: `Database cleaned and reclassified across all ${allPosts.length} posts. Deleted ${deletedCount} non-engineering posts. Updated & re-tagged ${updatedCount} articles.`,
      deletedCount,
      updatedCount,
      totalRemaining: allPosts.length - deletedCount,
      durationMs: Date.now() - startTime,
    });
  }

  // Auto-heal company feed URLs with verified live endpoints
  await Promise.all([
    client
      .from("companies")
      .update({ feed_url: "https://www.cockroachlabs.com/rss.xml" })
      .eq("slug", "cockroachdb"),
    client
      .from("companies")
      .update({ feed_url: "https://developer.chrome.com/static/blog/feed.xml" })
      .eq("slug", "chrome"),
    client
      .from("companies")
      .update({ feed_url: "https://canvatechblog.com/feed" })
      .eq("slug", "canva"),
    client
      .from("companies")
      .update({ feed_url: "https://evilmartians.com/chronicles.atom" })
      .eq("slug", "evilmartians"),
    client
      .from("companies")
      .update({ feed_url: "custom:clickhouse" })
      .eq("slug", "clickhouse")
      .ilike("feed_url", "%github.com%"),
    client
      .from("companies")
      .update({ feed_url: "https://tigerbeetle.com/blog/atom.xml" })
      .eq("slug", "tigerbeetle"),
    client
      .from("companies")
      .update({ feed_url: "https://www.fastly.com/blog_rss.xml" })
      .eq("slug", "fastly"),
  ]);

  // Ensure all tier-1 web & platform and landmark companies exist in the database
  const additionalCompanies = [
    {
      name: "Chrome Developers",
      slug: "chrome",
      website_url: "https://developer.chrome.com/blog",
      feed_url: "https://developer.chrome.com/static/blog/feed.xml",
    },
    {
      name: "web.dev",
      slug: "webdev",
      website_url: "https://web.dev/",
      feed_url: "https://web.dev/feed.xml",
    },
    {
      name: "React Blog",
      slug: "react",
      website_url: "https://react.dev/blog",
      feed_url: "https://react.dev/rss.xml",
    },
    {
      name: "Evil Martians",
      slug: "evilmartians",
      website_url: "https://evilmartians.com/chronicles",
      feed_url: "https://evilmartians.com/chronicles.atom",
    },
    {
      name: "Canva Engineering",
      slug: "canva",
      website_url: "https://canvatechblog.com/",
      feed_url: "https://canvatechblog.com/feed",
    },
    {
      name: "CockroachDB",
      slug: "cockroachdb",
      website_url: "https://www.cockroachlabs.com/blog/",
      feed_url: "https://www.cockroachlabs.com/rss.xml",
    },
    {
      name: "Fastly",
      slug: "fastly",
      website_url: "https://www.fastly.com/blog",
      feed_url: "https://www.fastly.com/blog_rss.xml",
    },
    {
      name: "CrowdStrike",
      slug: "crowdstrike",
      website_url: "https://www.crowdstrike.com/blog/",
      feed_url: null,
    },
    {
      name: "GitLab",
      slug: "gitlab",
      website_url: "https://about.gitlab.com/blog/",
      feed_url: null,
    },
  ];

  await client
    .from("companies")
    .upsert(additionalCompanies, { onConflict: "slug", ignoreDuplicates: true });


  // Check if we have write permission (either service_role key or public insert)
  const isServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 3. Fetch all companies from database
  const { data: allCompanies, error: compError } = await client
    .from("companies")
    .select("id, name, slug, feed_url");

  if (compError || !allCompanies || allCompanies.length === 0) {
    return NextResponse.json(
      { error: "Failed to fetch companies from database", details: compError?.message },
      { status: 500 }
    );
  }

  const companiesWithFeeds = allCompanies.filter((c) => Boolean(c.feed_url));
  const companySlugToId = new Map(allCompanies.map((c) => [c.slug, c.id]));

  // 4. Fetch all existing source URLs to prevent duplicate insertions
  const { data: existingPosts, error: postFetchError } = await client
    .from("posts")
    .select("source_url");

  if (postFetchError) {
    return NextResponse.json(
      { error: "Failed to fetch existing posts", details: postFetchError.message },
      { status: 500 }
    );
  }

  const existingUrls = new Set<string>((existingPosts || []).map((p) => p.source_url));

  const stats = {
    companies_scanned: companiesWithFeeds.length,
    new_posts_added: 0,
    duplicates_skipped: 0,
    failed_feeds: [] as string[],
    added_titles: [] as string[],
  };

  const newRecordsToInsert: Array<{
    company_id: string;
    title: string;
    slug: string;
    source_url: string;
    summary: string;
    tags: string[];
    read_time: string;
    published_at: string;
  }> = [];

  // 4b. Seed Landmark Postmortems & Classics into database if not yet present
  const allLandmarks = [...LANDMARK_POSTMORTEMS, ...LANDMARK_CLASSICS];
  for (const landmark of allLandmarks) {
    if (existingUrls.has(landmark.sourceUrl)) {
      continue;
    }
    const compId = companySlugToId.get(landmark.companySlug);
    if (!compId) continue;

    existingUrls.add(landmark.sourceUrl);
    newRecordsToInsert.push({
      company_id: compId,
      title: landmark.title,
      slug: landmark.slug,
      source_url: landmark.sourceUrl,
      summary: landmark.summary,
      tags: landmark.tags,
      read_time: landmark.readTime,
      published_at: landmark.publishedAt,
    });
    stats.added_titles.push(`${landmark.companyName}: ${landmark.title}`);
    stats.new_posts_added++;
  }

  // 5. Scan feeds concurrently in batches of 5 to avoid overwhelming network
  const batchSize = 5;
  for (let i = 0; i < companiesWithFeeds.length; i += batchSize) {
    const batch = companiesWithFeeds.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (company) => {
        if (!company.feed_url) return;

        try {
          const items = await fetchAndParseFeed(company.feed_url, existingUrls);

          for (const item of items) {
            if (existingUrls.has(item.source_url)) {
              stats.duplicates_skipped++;
              continue;
            }

            // Mark as tracked to prevent duplicates within the same batch
            existingUrls.add(item.source_url);

            newRecordsToInsert.push({
              company_id: company.id,
              title: item.title,
              slug: item.slug,
              source_url: item.source_url,
              summary: item.summary,
              tags: item.tags,
              read_time: item.read_time,
              published_at: item.published_at,
            });

            stats.added_titles.push(`${company.name}: ${item.title}`);
            stats.new_posts_added++;
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[Sync] Error scanning ${company.name}:`, msg);
          stats.failed_feeds.push(company.name);
        }
      })
    );
  }

  // 6. Bulk Insert New Records if any were found
  if (newRecordsToInsert.length > 0) {
    const insertChunkSize = 50;
    for (let i = 0; i < newRecordsToInsert.length; i += insertChunkSize) {
      const chunk = newRecordsToInsert.slice(i, i + insertChunkSize);
      const { error: insertError } = await client
        .from("posts")
        .upsert(chunk, { onConflict: "source_url", ignoreDuplicates: true });

      if (insertError) {
        return NextResponse.json(
          {
            error: "Failed to insert new posts into database",
            details: insertError.message,
            hint: !isServiceRole
              ? "Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local so the server has insert permission under RLS."
              : undefined,
            stats,
          },
          { status: 500 }
        );
      }
    }
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    stats,
    duration: `${(durationMs / 1000).toFixed(2)}s`,
  });
}
