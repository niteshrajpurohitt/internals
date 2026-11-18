import { createClient } from "@supabase/supabase-js";
import { Company, PostWithCompany } from "./types";
import { interleavePostsByCompany } from "./feed-utils";

function cleanSupabaseUrl(url?: string): string | null {
  if (!url) return null;
  let cleaned = url
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");
  if (!cleaned || cleaned.includes("your-project") || cleaned.includes("your-supabase-url")) {
    return null;
  }
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.origin;
  } catch {
    return null;
  }
}

function cleanSupabaseKey(key?: string): string | null {
  if (!key) return null;
  const cleaned = key.trim().replace(/^["']|["']$/g, "");
  if (
    !cleaned ||
    cleaned.includes("your-anon-public-key") ||
    cleaned.includes("paste_publishable_key_here")
  ) {
    return null;
  }
  return cleaned;
}

const supabaseUrl = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = cleanSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client = null;
if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn("Failed to initialize Supabase client:", err);
    client = null;
  }
}

export const supabase = client;

export function getServiceSupabase() {
  const serviceKey = cleanSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (serviceKey && supabaseUrl) {
    try {
      return createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } catch (err) {
      console.warn("Failed to initialize Supabase service client:", err);
    }
  } else if (supabaseUrl) {
    console.warn(
      "[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set; falling back to the anon key. " +
        "Writes (sync, cleanup) will be rejected by row-level security."
    );
  }
  return supabase;
}

export async function getCompanies(options?: { minPosts?: number }): Promise<Company[]> {
  if (!supabase) {
    return [];
  }

  const minPosts = options?.minPosts ?? 0;

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, slug, website_url, feed_url, created_at, posts(count)")
      .order("name", { ascending: true });

    if (error) {
      console.warn("Supabase query failed:", error.message);
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    interface CompanyRow {
      id: string;
      name: string;
      slug: string;
      website_url: string;
      feed_url: string | null;
      created_at: string;
      posts?: Array<{ count: number }>;
    }

    const formatted: Company[] = (data as unknown as CompanyRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      website_url: c.website_url,
      feed_url: c.feed_url,
      created_at: c.created_at,
      post_count: c.posts?.[0]?.count ?? 0,
    }));

    if (minPosts > 0) {
      return formatted.filter((c) => (c.post_count ?? 0) >= minPosts);
    }

    return formatted;
  } catch (err) {
    console.warn("Supabase companies connection error:", err);
    throw err;
  }
}

export interface PostQueryOptions {
  offset?: number;
  limit?: number;
  companyId?: string;
  category?: string;
  searchQuery?: string;
  duration?: string;
}

export function getDurationReadTimes(duration?: string): string[] {
  switch (duration) {
    case "quick": // < 5 min
      return ["1 min read", "2 min read", "3 min read", "4 min read"];
    case "standard": // 5 - 10 min
      return [
        "5 min read",
        "6 min read",
        "7 min read",
        "8 min read",
        "9 min read",
        "10 min read",
      ];
    case "long": // 10+ min (covers comprehensive architecture analyses and postmortems)
      return Array.from({ length: 110 }, (_, i) => `${i + 11} min read`);
    default:
      return [];
  }
}

export function getCategoryTagVariations(category: string): string[] {
  switch (category) {
    case "AI & Machine Learning":
      return [
        "AI & Machine Learning",
        "AI & GPU Systems",
        "AI / Systems",
        "AI",
        "Machine Learning",
        "Deep Learning",
        "GPU",
        "LLM",
        "Triton",
        "CUDA",
        "Inference",
        "Transformers",
        "Quantization",
        "Model Training",
        "Interpretability",
        "RAG",
      ];
    case "Distributed Systems":
      return [
        "Distributed Systems",
        "Distributed System",
        "Distributed",
        "Consensus",
        "Raft",
        "Paxos",
        "Kafka",
        "Microservices",
        "Event Streaming",
        "Event Stream",
        "Idempotency",
        "Fault Tolerance",
        "Actor Model",
      ];
    case "Databases & Storage":
      return [
        "Databases & Storage",
        "Database & Storage",
        "Databases",
        "Storage",
        "PostgreSQL",
        "ClickHouse",
        "ScyllaDB",
        "Cassandra",
        "CockroachDB",
        "DuckDB",
        "Redis",
        "RocksDB",
        "MySQL",
        "SQLite",
        "Storage Engine",
        "Distributed SQL",
      ];
    case "Infrastructure & Cloud":
      return [
        "Infrastructure & Cloud",
        "Infrastructure & Edge",
        "Infra & Cloud",
        "Infrastructure",
        "Kubernetes",
        "Docker",
        "Containers",
        "Networking",
        "eBPF",
        "Linux Kernel",
        "Anycast",
        "Cloudflare",
        "AWS",
        "Chaos Engineering",
        "Reliability",
        "Observability",
      ];
    case "Low-Level & Compilers":
      return [
        "Low-Level & Compilers",
        "Compilers",
        "Compiler",
        "Systems Programming",
        "Rust",
        "Zig",
        "C++",
        "Golang",
        "Linux Kernel",
        "WebAssembly",
        "WASM",
        "eBPF",
        "LLVM",
        "Memory Management",
        "Assembly",
      ];
    case "Web & Platforms":
      return [
        "Web & Platforms",
        "Frontend & Platforms",
        "Web Platforms",
        "Frontend",
        "Web Systems",
        "CRDT",
        "WebAssembly",
        "Vite",
        "Webpack",
        "React",
        "Turbopack",
        "State Management",
        "Core Web Vitals",
        "Browser",
      ];
    case "Classics":
      return ["Classics", "★ Classics", "Classic"];
    case "Postmortems":
      return [
        "Postmortems",
        "Postmortem",
        "Outage Analysis",
        "Incident Review",
        "RCA",
        "Disruption",
        "Root Cause Analysis",
        "Incident Report",
      ];
    default:
      return [category];
  }
}

export function parseSearchTokens(searchQuery: string): string[] {
  const cleaned = searchQuery
    .replace(/[(),%_.:;"'`\\/\[\]{}|]/g, " ")
    .trim()
    .toLowerCase();

  const tokens = Array.from(new Set(cleaned.split(/\s+/).filter(Boolean)));
  return tokens.slice(0, 5);
}

let cachedCompanies: Company[] | null = null;
let lastCompanyFetch = 0;

export async function getCachedCompanies(): Promise<Company[]> {
  const now = Date.now();
  if (cachedCompanies && now - lastCompanyFetch < 5 * 60 * 1000) {
    return cachedCompanies;
  }
  const comps = await getCompanies();
  if (comps.length > 0) {
    cachedCompanies = comps;
    lastCompanyFetch = now;
  }
  return comps;
}

const COMMON_SEARCH_STOPWORDS = new Set([
  "in", "at", "to", "on", "by", "of", "for", "or", "an", "is", "the", "and", "how", "why", "we"
]);

export function extractCompanyFromQuery(
  searchQuery: string,
  companies: Company[]
): { company: Company | null; remainingQuery: string } {
  const cleaned = searchQuery.trim().toLowerCase();
  if (!cleaned || companies.length === 0) {
    return { company: null, remainingQuery: searchQuery };
  }

  // Sort by longest name first to match multi-word companies accurately (e.g. "Google Research" before "Google")
  const sorted = [...companies].sort((a, b) => b.name.length - a.name.length);

  for (const comp of sorted) {
    const name = comp.name.toLowerCase();
    const slug = comp.slug.toLowerCase();

    if (cleaned === name || cleaned === slug) {
      return { company: comp, remainingQuery: "" };
    }
    if (cleaned.startsWith(name + " ")) {
      return { company: comp, remainingQuery: cleaned.slice(name.length + 1).trim() };
    }
    if (cleaned.startsWith(slug + " ")) {
      return { company: comp, remainingQuery: cleaned.slice(slug.length + 1).trim() };
    }
    if (cleaned.endsWith(" " + name)) {
      return { company: comp, remainingQuery: cleaned.slice(0, cleaned.length - name.length - 1).trim() };
    }
    if (cleaned.endsWith(" " + slug)) {
      return { company: comp, remainingQuery: cleaned.slice(0, cleaned.length - slug.length - 1).trim() };
    }
  }

  return { company: null, remainingQuery: searchQuery };
}

export function applySearchFilter<T>(
  query: T,
  searchQuery: string | undefined,
  companies: Company[]
): T {
  if (!searchQuery || !searchQuery.trim()) {
    return query;
  }

  const { company: matchedComp, remainingQuery } = extractCompanyFromQuery(searchQuery, companies);

  // If a multi-word or standalone company matched with no remaining search term
  if (matchedComp && !remainingQuery.trim()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (query as any).or(
      `company_id.eq.${matchedComp.id},title.ilike.%${matchedComp.name}%,summary.ilike.%${matchedComp.name}%`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentQuery = query as any;

  if (matchedComp) {
    currentQuery = currentQuery.or(
      `company_id.eq.${matchedComp.id},title.ilike.%${matchedComp.name}%,summary.ilike.%${matchedComp.name}%`
    );
  }

  const tokens = parseSearchTokens(remainingQuery || searchQuery);
  if (tokens.length === 0) {
    return currentQuery as T;
  }

  for (const token of tokens) {
    // Single-word company check if not already matched
    const shouldCheckCompany = !matchedComp && token.length >= 3 && !COMMON_SEARCH_STOPWORDS.has(token);

    const matchedComps = shouldCheckCompany
      ? companies.filter((c) => {
          const slug = c.slug.toLowerCase();
          const name = c.name.toLowerCase();
          return (
            slug === token ||
            name === token ||
            (token.length >= 4 && (slug.startsWith(token) || name.startsWith(token)))
          );
        })
      : [];

    // Sanitize special characters for Postgres regex word-boundary matching
    const safeRegex = token.replace(/[[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    // Case variations for tag matching
    const titleCasedTag = token.charAt(0).toUpperCase() + token.slice(1);
    const upperCasedTag = token.toUpperCase();
    const tagConditions = Array.from(new Set([token, titleCasedTag, upperCasedTag]))
      .map((t) => `tags.cs.{"${t}"}`)
      .join(",");

    if (matchedComps.length === 1) {
      currentQuery = currentQuery.or(
        `title.imatch.\\y${safeRegex}\\y,summary.imatch.\\y${safeRegex}\\y,${tagConditions},company_id.eq.${matchedComps[0].id}`
      );
    } else if (matchedComps.length > 1) {
      const ids = matchedComps.map((c) => c.id).join(",");
      currentQuery = currentQuery.or(
        `title.imatch.\\y${safeRegex}\\y,summary.imatch.\\y${safeRegex}\\y,${tagConditions},company_id.in.(${ids})`
      );
    } else {
      currentQuery = currentQuery.or(
        `title.imatch.\\y${safeRegex}\\y,summary.imatch.\\y${safeRegex}\\y,${tagConditions}`
      );
    }
  }

  return currentQuery as T;
}

// Track whether fts (Full-Text Search) column is active in PostgreSQL
let isFtsAvailable: boolean | null = null;

type BaseFilterOptions = Pick<PostQueryOptions, "companyId" | "category" | "duration">;

function buildCountQuery(filters: BaseFilterOptions) {
  let q = supabase!.from("posts").select("*", { count: "exact", head: true });
  if (filters.companyId && filters.companyId !== "all") {
    q = q.eq("company_id", filters.companyId);
  }
  if (filters.category && filters.category !== "All") {
    q = q.overlaps("tags", getCategoryTagVariations(filters.category));
  }
  if (filters.duration && filters.duration !== "all") {
    const times = getDurationReadTimes(filters.duration);
    if (times.length > 0) q = q.in("read_time", times);
  }
  return q;
}

function buildListQuery(filters: BaseFilterOptions) {
  let q = supabase!
    .from("posts")
    .select(
      `
      *,
      companies (
        id,
        name,
        slug,
        website_url,
        feed_url,
        created_at
      )
    `
    )
    .order("published_at", { ascending: false })
    // Tiebreaker: without a unique sort key, rows sharing a published_at can be
    // returned in a different order per request, so pages skip/repeat posts.
    .order("id", { ascending: false });

  if (filters.companyId && filters.companyId !== "all") {
    q = q.eq("company_id", filters.companyId);
  }
  if (filters.category && filters.category !== "All") {
    q = q.overlaps("tags", getCategoryTagVariations(filters.category));
  }
  if (filters.duration && filters.duration !== "all") {
    const times = getDurationReadTimes(filters.duration);
    if (times.length > 0) q = q.in("read_time", times);
  }
  return q;
}

/**
 * How a search query is executed. Decided once per (query + filters) and shared by
 * getPosts() and getPostCount(), so the list and the total always use the same method.
 *
 * - "fts":    Postgres full-text search (title/tags/summary), used when it finds results.
 * - "filter": word-boundary + tag + company matching. Used when the query names a
 *             company (company names are not in the fts index), when fts finds
 *             nothing, or when the fts column does not exist.
 */
type SearchPlan = { mode: "fts"; count: number } | { mode: "filter" };

const PLAN_TTL_MS = 60 * 1000;
const planCache = new Map<string, { expires: number; plan: Promise<SearchPlan> }>();

async function computeSearchPlan(search: string, filters: BaseFilterOptions): Promise<SearchPlan> {
  if (isFtsAvailable === false) return { mode: "filter" };

  const companies = await getCachedCompanies().catch(() => [] as Company[]);
  if (extractCompanyFromQuery(search, companies).company) {
    return { mode: "filter" };
  }

  try {
    const { count, error } = await buildCountQuery(filters).textSearch("fts", search, {
      type: "websearch",
      config: "english",
    });
    if (error) {
      if (error.code === "42703") isFtsAvailable = false;
      return { mode: "filter" };
    }
    isFtsAvailable = true;
    return typeof count === "number" && count > 0 ? { mode: "fts", count } : { mode: "filter" };
  } catch {
    return { mode: "filter" };
  }
}

function getSearchPlan(search: string, filters: BaseFilterOptions): Promise<SearchPlan> {
  const key = JSON.stringify([search.toLowerCase(), filters.companyId, filters.category, filters.duration]);
  const now = Date.now();
  const cached = planCache.get(key);
  if (cached && cached.expires > now) return cached.plan;

  if (planCache.size > 500) {
    for (const [k, v] of planCache) if (v.expires <= now) planCache.delete(k);
    if (planCache.size > 500) planCache.clear();
  }

  const plan = computeSearchPlan(search, filters);
  planCache.set(key, { expires: now + PLAN_TTL_MS, plan });
  // Don't keep a failed lookup around
  plan.catch(() => planCache.delete(key));
  return plan;
}

export async function getPostCount(options?: PostQueryOptions): Promise<number> {
  const { companyId, category, searchQuery, duration } = options || {};
  if (!supabase) {
    return 0;
  }
  const filters = { companyId, category, duration };

  try {
    const trimmedSearch = searchQuery?.trim();
    let query = buildCountQuery(filters);

    if (trimmedSearch) {
      const plan = await getSearchPlan(trimmedSearch, filters);
      if (plan.mode === "fts") {
        return plan.count;
      }
      const companies = await getCachedCompanies();
      query = applySearchFilter(query, trimmedSearch, companies);
    }

    const { count, error } = await query;
    if (error) {
      console.warn("Supabase count query failed:", error.message);
      throw new Error(`Count query failed: ${error.message}`);
    }
    return typeof count === "number" ? count : 0;
  } catch (err) {
    console.warn("Supabase count error:", err);
    throw err;
  }
}

type PostRowWithCompany = PostWithCompany & { companies?: Company | null };

function normalizePosts(data: PostRowWithCompany[]): PostWithCompany[] {
  return data.map((post) => ({
    ...post,
    company: post.companies || null,
  }));
}

export async function getPosts(options?: PostQueryOptions): Promise<PostWithCompany[]> {
  const { offset = 0, limit = 40, companyId, category, searchQuery, duration } = options || {};
  if (!supabase) {
    return [];
  }
  const filters = { companyId, category, duration };

  try {
    const trimmedSearch = searchQuery?.trim();
    let query = buildListQuery(filters);

    if (trimmedSearch) {
      const plan = await getSearchPlan(trimmedSearch, filters);
      if (plan.mode === "fts") {
        query = query.textSearch("fts", trimmedSearch, { type: "websearch", config: "english" });
      } else {
        const companies = await getCachedCompanies();
        query = applySearchFilter(query, trimmedSearch, companies);
      }
    }

    // Deterministic SQL offset range to prevent skipped or duplicated rows across pagination
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.warn("Supabase posts query failed:", error.message);
      throw new Error(`Posts query failed: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    const normalized = normalizePosts(data as PostRowWithCompany[]);

    // If fetching the first page of the general feed, apply interleaving directly
    const isGeneralFeed = (!companyId || companyId === "all") && !trimmedSearch;
    if (isGeneralFeed && offset === 0) {
      return interleavePostsByCompany(normalized, 2);
    }

    return normalized;
  } catch (err) {
    console.warn("Supabase posts connection error:", err);
    throw err;
  }
}
