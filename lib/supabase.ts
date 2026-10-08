import { createClient } from "@supabase/supabase-js";
import { Company, PostWithCompany } from "./types";

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
    client = createClient(supabaseUrl!, supabaseAnonKey!);
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
  }
  return supabase;
}

export async function getCompanies(): Promise<Company[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) {
      console.warn("Supabase query returned empty or failed:", error?.message);
      return [];
    }

    return data as Company[];
  } catch (err) {
    console.warn("Supabase connection error:", err);
    return [];
  }
}

export interface PostQueryOptions {
  offset?: number;
  limit?: number;
  companyId?: string;
  category?: string;
  searchQuery?: string;
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

export function applySearchFilter<T>(
  query: T,
  searchQuery: string | undefined,
  companies: Company[]
): T {
  if (!searchQuery || !searchQuery.trim()) {
    return query;
  }

  const tokens = parseSearchTokens(searchQuery);
  if (tokens.length === 0) {
    return query;
  }

  let currentQuery = query as any;

  for (const token of tokens) {
    const matchedComps = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(token) ||
        c.slug.toLowerCase().includes(token)
    );

    if (matchedComps.length === 1) {
      currentQuery = currentQuery.or(
        `title.ilike.%${token}%,summary.ilike.%${token}%,company_id.eq.${matchedComps[0].id}`
      );
    } else if (matchedComps.length > 1) {
      const ids = matchedComps.map((c) => c.id).join(",");
      currentQuery = currentQuery.or(
        `title.ilike.%${token}%,summary.ilike.%${token}%,company_id.in.(${ids})`
      );
    } else {
      currentQuery = currentQuery.or(
        `title.ilike.%${token}%,summary.ilike.%${token}%`
      );
    }
  }

  return currentQuery as T;
}

export async function getPostCount(options?: PostQueryOptions): Promise<number> {
  const { companyId, category, searchQuery } = options || {};

  if (!supabase) {
    return 0;
  }

  try {
    let query = supabase.from("posts").select("*", { count: "exact", head: true });

    if (companyId && companyId !== "all") {
      query = query.eq("company_id", companyId);
    }
    if (category && category !== "All") {
      const variations = getCategoryTagVariations(category);
      query = query.overlaps("tags", variations);
    }
    if (searchQuery && searchQuery.trim()) {
      const companies = await getCachedCompanies();
      query = applySearchFilter(query, searchQuery, companies);
    }

    const { count, error } = await query;
    if (error || typeof count !== "number") {
      return 0;
    }
    return count;
  } catch {
    return 0;
  }
}

/**
 * Fair Feed Interleaving: Prevents any single high-volume blog (e.g. OpenAI, Vercel)
 * from dominating consecutive cards on the general feed while preserving recency.
 */
export function interleavePostsByCompany(
  posts: PostWithCompany[],
  maxConsecutive: number = 2
): PostWithCompany[] {
  if (posts.length <= maxConsecutive) return posts;

  const result: PostWithCompany[] = [];
  const deferred: PostWithCompany[] = [];

  for (const post of posts) {
    const compId = post.company_id;
    const len = result.length;
    let consecutiveCount = 0;

    for (let i = len - 1; i >= 0 && i >= len - maxConsecutive; i--) {
      if (result[i].company_id === compId) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    if (consecutiveCount >= maxConsecutive) {
      deferred.push(post);
    } else {
      result.push(post);
      // Re-inject a deferred post from an alternate company if available
      if (deferred.length > 0) {
        const altIndex = deferred.findIndex((d) => d.company_id !== compId);
        if (altIndex !== -1) {
          result.push(deferred.splice(altIndex, 1)[0]);
        }
      }
    }
  }

  // Append any remaining deferred items
  result.push(...deferred);
  return result;
}

export async function getPosts(options?: PostQueryOptions): Promise<PostWithCompany[]> {
  const { offset = 0, limit = 40, companyId, category, searchQuery } = options || {};

  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
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
      .order("published_at", { ascending: false });

    if (companyId && companyId !== "all") {
      query = query.eq("company_id", companyId);
    }
    if (category && category !== "All") {
      const variations = getCategoryTagVariations(category);
      query = query.overlaps("tags", variations);
    }
    if (searchQuery && searchQuery.trim()) {
      const companies = await getCachedCompanies();
      query = applySearchFilter(query, searchQuery, companies);
    }

    const isGeneralFeed = (!companyId || companyId === "all") && !searchQuery;
    const fetchLimit = isGeneralFeed ? Math.min(limit * 2, 120) : limit;

    query = query.range(offset, offset + fetchLimit - 1);

    const { data, error } = await query;

    if (error || !data) {
      console.warn("Supabase query returned empty or failed:", error?.message);
      return [];
    }

    // Normalize company property
    const normalized = data.map((post: PostWithCompany) => ({
      ...post,
      company: post.companies || null,
    })) as PostWithCompany[];

    if (isGeneralFeed) {
      const interleaved = interleavePostsByCompany(normalized, 2);
      return interleaved.slice(0, limit);
    }

    return normalized.slice(0, limit);
  } catch (err) {
    console.warn("Supabase connection error:", err);
    return [];
  }
}
