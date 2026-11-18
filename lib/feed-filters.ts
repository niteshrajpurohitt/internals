// Shared, dependency-free helpers for turning feed filters into URLs and back.
// Used by the feed (to keep the address bar in sync), the home page (to render a
// shared link server-side), the /category and /company pages, and the sitemap.

import type { CategoryFilter, Company } from "./types";

/** Categories that are real tag filters (have a public page and a URL slug). */
export type TopicCategory = Exclude<CategoryFilter, "All" | "Saved" | "Following">;

export const CATEGORY_SLUGS: Record<TopicCategory, string> = {
  Classics: "classics",
  Postmortems: "postmortems",
  "AI & Machine Learning": "ai-machine-learning",
  "Distributed Systems": "distributed-systems",
  "Databases & Storage": "databases-storage",
  "Infrastructure & Cloud": "infrastructure-cloud",
  "Low-Level & Compilers": "low-level-compilers",
  "Web & Platforms": "web-platforms",
};

export const TOPIC_CATEGORIES = Object.keys(CATEGORY_SLUGS) as TopicCategory[];

export const CATEGORY_DESCRIPTIONS: Record<TopicCategory, string> = {
  Classics:
    "Landmark engineering essays that shaped how the industry builds software, from scaling stories to architecture manifestos.",
  Postmortems:
    "Production incident reviews and root-cause analyses from engineering teams: what broke, why, and what changed afterwards.",
  "AI & Machine Learning":
    "How teams train, serve and scale models in production: inference systems, GPUs, LLM infrastructure and ML platforms.",
  "Distributed Systems":
    "Consensus, replication, event streaming and fault tolerance, written by the teams running these systems at scale.",
  "Databases & Storage":
    "Storage engines, query planners, Postgres at scale, migrations and the internals of the databases teams depend on.",
  "Infrastructure & Cloud":
    "Networking, Kubernetes, edge platforms, reliability and observability from the teams operating global infrastructure.",
  "Low-Level & Compilers":
    "Compilers, systems programming, kernels, WebAssembly and performance work close to the metal.",
  "Web & Platforms":
    "Frontend architecture, browsers, build tools and the platforms behind large web applications.",
};

const SLUG_TO_CATEGORY = new Map<string, TopicCategory>(
  TOPIC_CATEGORIES.map((c) => [CATEGORY_SLUGS[c], c])
);

export function isTopicCategory(category: string): category is TopicCategory {
  return Object.prototype.hasOwnProperty.call(CATEGORY_SLUGS, category);
}

export function categoryToSlug(category: TopicCategory): string {
  return CATEGORY_SLUGS[category];
}

export function slugToCategory(slug: string | null | undefined): TopicCategory | null {
  if (!slug) return null;
  return SLUG_TO_CATEGORY.get(slug.trim().toLowerCase()) ?? null;
}

export const DURATION_VALUES = ["quick", "standard", "long"] as const;
export type DurationValue = (typeof DURATION_VALUES)[number];

export function isDurationValue(value: string | null | undefined): value is DurationValue {
  return Boolean(value) && (DURATION_VALUES as readonly string[]).includes(value as string);
}

/** The filter state the feed works with. `companyId` and `duration` use "all" for no filter. */
export interface FeedFilters {
  category: CategoryFilter;
  companyId: string;
  duration: string;
}

export const DEFAULT_FEED_FILTERS: FeedFilters = {
  category: "All",
  companyId: "all",
  duration: "all",
};

type RawParam = string | string[] | null | undefined;

function firstValue(value: RawParam): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Reads `?category=…&company=…&duration=…` into feed filters.
 * Unknown values are ignored rather than producing an empty feed, so an old or
 * hand-edited link still lands somewhere useful.
 */
export function parseFeedFilters(
  params: { category?: RawParam; company?: RawParam; duration?: RawParam },
  companies: Pick<Company, "id" | "slug">[]
): FeedFilters {
  const category = slugToCategory(firstValue(params.category)) ?? "All";

  const companySlug = firstValue(params.company)?.trim().toLowerCase();
  const company = companySlug ? companies.find((c) => c.slug.toLowerCase() === companySlug) : undefined;

  const duration = firstValue(params.duration)?.trim().toLowerCase();

  return {
    category,
    companyId: company ? company.id : "all",
    duration: isDurationValue(duration) ? duration : "all",
  };
}

/**
 * Writes the shareable filters into `params` (mutating it) and removes the ones
 * that are not set. "Saved" and "Following" are personal views, so they are never
 * put into a link.
 */
export function writeFeedFiltersToParams(
  params: URLSearchParams,
  filters: FeedFilters,
  companies: Pick<Company, "id" | "slug">[]
): URLSearchParams {
  if (isTopicCategory(filters.category)) {
    params.set("category", categoryToSlug(filters.category));
  } else {
    params.delete("category");
  }

  const company =
    filters.companyId !== "all" ? companies.find((c) => c.id === filters.companyId) : undefined;
  if (company) {
    params.set("company", company.slug);
  } else {
    params.delete("company");
  }

  if (isDurationValue(filters.duration)) {
    params.set("duration", filters.duration);
  } else {
    params.delete("duration");
  }

  return params;
}

/** The filters the server can render for a link (personal views fall back to "All"). */
export function serverRenderableFilters(filters: FeedFilters): FeedFilters {
  return isTopicCategory(filters.category) ? filters : { ...filters, category: "All" };
}

export function sameFilters(a: FeedFilters, b: FeedFilters): boolean {
  return a.category === b.category && a.companyId === b.companyId && a.duration === b.duration;
}
