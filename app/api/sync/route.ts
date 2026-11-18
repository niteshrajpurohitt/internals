import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { fetchAllRows, hasValidBearerSecret } from "@/lib/server-utils";
import { fetchAndParseFeed, detectCategories, isMarketingFluff, decodeHtmlEntities, cleanTitle } from "@/lib/rss";
import { LANDMARK_POSTMORTEMS, LANDMARK_CLASSICS } from "@/lib/classics";

export const maxDuration = 60; // Allow up to 60s for full feed sync
export const dynamic = "force-dynamic";

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

  if (syncSecret && !hasValidBearerSecret(req, syncSecret)) {
    return NextResponse.json(
      { error: "Unauthorized: send the sync secret as 'Authorization: Bearer <secret>'" },
      { status: 401 }
    );
  }

  // 2. Obtain Supabase Client
  const client = getServiceSupabase();
  if (!client) {
    return NextResponse.json({ error: "Supabase client is not configured" }, { status: 500 });
  }

  // Check if reclassification or database cleanup is requested
  const isMaintenance =
    req.nextUrl.searchParams.get("reclassify") === "true" ||
    req.nextUrl.searchParams.get("clean") === "true";

  // Destructive maintenance modes must not be triggerable by a GET (link, prefetch, crawler).
  if (isMaintenance && req.method !== "POST") {
    return NextResponse.json(
      { error: "Reclassify/clean deletes and rewrites posts, so it must be called with POST" },
      { status: 405, headers: { Allow: "POST" } }
    );
  }

  if (isMaintenance) {
    type PostRow = { id: string; title: string; summary: string; tags: string[]; source_url?: string };
    const landmarkUrls = new Set([...LANDMARK_POSTMORTEMS, ...LANDMARK_CLASSICS].map((l) => l.sourceUrl));

    // Paginate through the entire database to overcome the PostgREST 1000-row limit
    const postsResult = await fetchAllRows<PostRow>((from, to) =>
      client.from("posts").select("id, title, summary, tags, source_url").order("id").range(from, to)
    );
    if (postsResult.error) {
      return NextResponse.json(
        { error: "Failed to fetch posts for reclassification", details: postsResult.error },
        { status: 500 }
      );
    }
    const allPosts = postsResult.rows;

    // Never delete a post somebody has bookmarked: deleting it would silently
    // cascade-delete their bookmark. Such posts are kept (and re-tagged if possible).
    const bookmarkResult = await fetchAllRows<{ post_id: string }>((from, to) =>
      client.from("user_bookmarks").select("post_id").order("post_id").range(from, to)
    );
    if (bookmarkResult.error) {
      return NextResponse.json(
        {
          error: "Failed to load bookmarks; refusing to delete posts without knowing which are bookmarked",
          details: bookmarkResult.error,
        },
        { status: 500 }
      );
    }
    const bookmarkedIds = new Set(bookmarkResult.rows.map((b) => b.post_id));

    let deletedCount = 0;
    let updatedCount = 0;
    let keptBecauseBookmarked = 0;
    const failedOperations: string[] = [];

    // Process in batches of 50
    for (let i = 0; i < allPosts.length; i += 50) {
      const batch = allPosts.slice(i, i + 50);
      await Promise.all(
        batch.map(async (p) => {
          const cleanedTitle = cleanTitle(p.title);
          const decodedSummary = decodeHtmlEntities(p.summary || "");

          // 1. Ironclad Classics & Postmortems Immunity Shield: NEVER delete landmark articles
          const isImmune =
            Boolean(p.source_url && landmarkUrls.has(p.source_url)) ||
            (p.tags || []).some(
              (t) => t.toLowerCase().includes("classic") || t.toLowerCase().includes("postmortem")
            );

          if (isImmune) {
            const newTags = detectCategories(cleanedTitle, decodedSummary, p.tags || []);
            const currentSorted = (p.tags || []).slice().sort().join(",");
            const newSorted = newTags.slice().sort().join(",");
            const needsUpdate =
              currentSorted !== newSorted ||
              p.title !== cleanedTitle ||
              p.summary !== decodedSummary;

            if (needsUpdate) {
              const { error } = await client
                .from("posts")
                .update({
                  title: cleanedTitle,
                  summary: decodedSummary,
                  tags: newTags,
                })
                .eq("id", p.id);
              if (error) failedOperations.push(`update ${p.id}: ${error.message}`);
              else updatedCount++;
            }
            return;
          }

          // 2. Check against veto patterns and quality gates for general posts
          const newTags = detectCategories(cleanedTitle, decodedSummary, p.tags || []);
          const shouldDelete =
            isMarketingFluff(cleanedTitle, decodedSummary) ||
            isMarketingFluff(p.title, p.summary || "") ||
            !newTags ||
            newTags.length === 0;

          if (shouldDelete) {
            if (bookmarkedIds.has(p.id)) {
              keptBecauseBookmarked++;
              if (!newTags || newTags.length === 0) return;
            } else {
              const { error } = await client.from("posts").delete().eq("id", p.id);
              if (error) failedOperations.push(`delete ${p.id}: ${error.message}`);
              else deletedCount++;
              return;
            }
          }

          const currentSorted = (p.tags || []).slice().sort().join(",");
          const newSorted = newTags.slice().sort().join(",");
          const needsUpdate =
            currentSorted !== newSorted ||
            p.title !== cleanedTitle ||
            p.summary !== decodedSummary;

          if (needsUpdate) {
            const { error } = await client
              .from("posts")
              .update({
                title: cleanedTitle,
                summary: decodedSummary,
                tags: newTags,
              })
              .eq("id", p.id);
            if (error) failedOperations.push(`update ${p.id}: ${error.message}`);
            else updatedCount++;
          }
        })
      );
    }

    return NextResponse.json(
      {
        success: failedOperations.length === 0,
        message: `Database cleaned and reclassified across all ${allPosts.length} posts. Deleted ${deletedCount} non-engineering posts. Updated & re-tagged ${updatedCount} articles. Kept ${keptBecauseBookmarked} bookmarked posts that would otherwise have been deleted.`,
        deletedCount,
        updatedCount,
        keptBecauseBookmarked,
        failedCount: failedOperations.length,
        failedOperations: failedOperations.slice(0, 20),
        totalRemaining: allPosts.length - deletedCount,
        durationMs: Date.now() - startTime,
      },
      { status: failedOperations.length === 0 ? 200 : 500 }
    );
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
  //    Paginated: a single select is capped at 1000 rows by PostgREST, which made
  //    every post beyond the first 1000 look "new" on each run.
  const existingResult = await fetchAllRows<{ source_url: string }>((from, to) =>
    client.from("posts").select("source_url").order("source_url").range(from, to)
  );

  if (existingResult.error) {
    return NextResponse.json(
      { error: "Failed to fetch existing posts", details: existingResult.error },
      { status: 500 }
    );
  }

  const existingUrls = new Set<string>(existingResult.rows.map((p) => p.source_url));

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
