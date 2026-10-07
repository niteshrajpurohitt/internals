import { createClient } from "@supabase/supabase-js";
import { Company, PostWithCompany } from "./types";
import { MOCK_COMPANIES, MOCK_POSTS } from "./mock-data";

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
    return MOCK_COMPANIES;
  }

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Supabase query returned empty or failed, using mock data:", error?.message);
      return MOCK_COMPANIES;
    }

    return data as Company[];
  } catch (err) {
    console.warn("Supabase connection error, falling back to mock data:", err);
    return MOCK_COMPANIES;
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
    default:
      return [category];
  }
}

export async function getPostCount(options?: PostQueryOptions): Promise<number> {
  const { companyId, category, searchQuery } = options || {};

  if (!supabase) {
    let mock = MOCK_POSTS;
    if (companyId && companyId !== "all") {
      mock = mock.filter((p) => p.company_id === companyId || p.company?.id === companyId);
    }
    if (category && category !== "All") {
      const variations = getCategoryTagVariations(category);
      mock = mock.filter((p) =>
        p.tags.some((t) => variations.some((v) => t.toLowerCase() === v.toLowerCase()))
      );
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      mock = mock.filter(
        (p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
      );
    }
    return mock.length;
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
      const cleanQ = searchQuery.trim().replace(/[%_]/g, "");
      if (cleanQ) {
        query = query.or(`title.ilike.%${cleanQ}%,summary.ilike.%${cleanQ}%`);
      }
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

export async function getPosts(options?: PostQueryOptions): Promise<PostWithCompany[]> {
  const { offset = 0, limit = 40, companyId, category, searchQuery } = options || {};

  if (!supabase) {
    let mock = MOCK_POSTS;
    if (companyId && companyId !== "all") {
      mock = mock.filter((p) => p.company_id === companyId || p.company?.id === companyId);
    }
    if (category && category !== "All") {
      const variations = getCategoryTagVariations(category);
      mock = mock.filter((p) =>
        p.tags.some((t) => variations.some((v) => t.toLowerCase() === v.toLowerCase()))
      );
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      mock = mock.filter(
        (p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
      );
    }
    return mock.slice(offset, offset + limit);
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
      const cleanQ = searchQuery.trim().replace(/[%_]/g, "");
      if (cleanQ) {
        query = query.or(`title.ilike.%${cleanQ}%,summary.ilike.%${cleanQ}%`);
      }
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error || !data) {
      console.warn("Supabase query returned empty or failed:", error?.message);
      return [];
    }

    // Normalize company property
    return data.map((post: PostWithCompany) => ({
      ...post,
      company: post.companies || null,
    })) as PostWithCompany[];
  } catch (err) {
    console.warn("Supabase connection error:", err);
    return [];
  }
}
