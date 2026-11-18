import { describe, expect, it } from "vitest";
import {
  CATEGORY_SLUGS,
  DEFAULT_FEED_FILTERS,
  TOPIC_CATEGORIES,
  categoryToSlug,
  parseFeedFilters,
  sameFilters,
  serverRenderableFilters,
  slugToCategory,
  writeFeedFiltersToParams,
} from "@/lib/feed-filters";
import { buildFollowOrFilter, getCategoryTagVariations } from "@/lib/supabase";

const companies = [
  { id: "11111111-1111-1111-1111-111111111111", slug: "stripe" },
  { id: "22222222-2222-2222-2222-222222222222", slug: "cloudflare" },
];

describe("category slugs", () => {
  it("round-trips every category", () => {
    for (const category of TOPIC_CATEGORIES) {
      expect(slugToCategory(categoryToSlug(category))).toBe(category);
    }
  });

  it("uses unique, URL-safe slugs", () => {
    const slugs = Object.values(CATEGORY_SLUGS);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("is case-insensitive and rejects unknown slugs", () => {
    expect(slugToCategory("POSTMORTEMS")).toBe("Postmortems");
    expect(slugToCategory("nope")).toBeNull();
    expect(slugToCategory(null)).toBeNull();
  });

  it("every category has tag variations that include its own name", () => {
    for (const category of TOPIC_CATEGORIES) {
      expect(getCategoryTagVariations(category)).toContain(category);
    }
  });
});

describe("parseFeedFilters", () => {
  it("reads category, company slug and duration", () => {
    expect(
      parseFeedFilters({ category: "postmortems", company: "Stripe", duration: "long" }, companies)
    ).toEqual({ category: "Postmortems", companyId: companies[0].id, duration: "long" });
  });

  it("falls back to defaults for unknown or missing values", () => {
    expect(parseFeedFilters({ category: "x", company: "acme", duration: "forever" }, companies)).toEqual(
      DEFAULT_FEED_FILTERS
    );
    expect(parseFeedFilters({}, companies)).toEqual(DEFAULT_FEED_FILTERS);
  });

  it("uses the first value when a param is repeated", () => {
    expect(parseFeedFilters({ category: ["classics", "postmortems"] }, companies).category).toBe("Classics");
  });
});

describe("writeFeedFiltersToParams", () => {
  it("writes shareable filters and keeps unrelated params like ?q=", () => {
    const params = new URLSearchParams("q=kafka");
    writeFeedFiltersToParams(
      params,
      { category: "Databases & Storage", companyId: companies[1].id, duration: "quick" },
      companies
    );
    expect(params.toString()).toBe("q=kafka&category=databases-storage&company=cloudflare&duration=quick");
  });

  it("removes filters that are reset", () => {
    const params = new URLSearchParams("category=classics&company=stripe&duration=long&q=x");
    writeFeedFiltersToParams(params, DEFAULT_FEED_FILTERS, companies);
    expect(params.toString()).toBe("q=x");
  });

  it("never puts personal views (Saved, Following) in the link", () => {
    for (const category of ["Saved", "Following"] as const) {
      const params = new URLSearchParams("category=classics");
      writeFeedFiltersToParams(params, { ...DEFAULT_FEED_FILTERS, category }, companies);
      expect(params.has("category")).toBe(false);
    }
  });

  it("round-trips through parseFeedFilters", () => {
    const filters = { category: "Classics" as const, companyId: companies[0].id, duration: "standard" };
    const params = writeFeedFiltersToParams(new URLSearchParams(), filters, companies);
    expect(parseFeedFilters(Object.fromEntries(params), companies)).toEqual(filters);
  });
});

describe("serverRenderableFilters / sameFilters", () => {
  it("renders personal views as All on the server", () => {
    expect(serverRenderableFilters({ ...DEFAULT_FEED_FILTERS, category: "Following" }).category).toBe("All");
    expect(serverRenderableFilters({ ...DEFAULT_FEED_FILTERS, category: "Classics" }).category).toBe(
      "Classics"
    );
  });

  it("compares all three fields", () => {
    expect(sameFilters(DEFAULT_FEED_FILTERS, { ...DEFAULT_FEED_FILTERS })).toBe(true);
    expect(sameFilters(DEFAULT_FEED_FILTERS, { ...DEFAULT_FEED_FILTERS, duration: "long" })).toBe(false);
  });
});

describe("buildFollowOrFilter", () => {
  it("returns null when nothing is followed", () => {
    expect(buildFollowOrFilter({ companyIds: [], categories: [] })).toBeNull();
  });

  it("matches followed companies by id", () => {
    expect(buildFollowOrFilter({ companyIds: [companies[0].id], categories: [] })).toBe(
      `company_id.in.(${companies[0].id})`
    );
  });

  it("drops ids that are not UUIDs (no filter injection)", () => {
    expect(
      buildFollowOrFilter({ companyIds: ["1),id.neq.(0", companies[1].id], categories: [] })
    ).toBe(`company_id.in.(${companies[1].id})`);
  });

  it("matches every tag variation of a followed category, quoted", () => {
    const filter = buildFollowOrFilter({ companyIds: [], categories: ["Low-Level & Compilers"] })!;
    for (const tag of getCategoryTagVariations("Low-Level & Compilers")) {
      expect(filter).toContain(`tags.cs.{"${tag}"}`);
    }
  });

  it("ignores unknown categories", () => {
    expect(buildFollowOrFilter({ companyIds: [], categories: ["Not A Category"] })).toBeNull();
  });
});
