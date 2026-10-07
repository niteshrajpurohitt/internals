import Parser from "rss-parser";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "engfeed-aggregator/1.0 (+https://engfeed.dev; discovery engine)",
    Accept: "application/rss+xml, application/atom+xml, text/xml, application/xml, */*",
  },
});

// Universal Veto: immediate rejection of product GA announcements, changelogs, marketing, PR, events, and HR
const UNIVERSAL_VETO_PATTERNS: RegExp[] = [
  // 1. General Availability & Feature Rollout Announcements
  /\b(now generally available|generally available( on| in| across)?|general availability|\bGA\b)\b/i,
  /\b(now available( on| in| for| across)?|is now available|now in (preview|beta|early access))\b/i,
  /\b(available on [a-zA-Z\s]*(gateway|marketplace|catalog|hub|cloud))\b/i,
  /\b(introducing support for|added support for|now supported on|now live on)\b/i,
  /\b[a-zA-Z0-9\s]+\s+[0-9]+\.[0-9]+\s+(is\s+)?now available\b/i,

  // 2. Product / Feature Launch Announcements & Changelogs
  /^(announcing|introducing|meet|welcome to|new in)\s+[\w\s]+(dashboard|console|ui|portal|pricing|gateway|tier|service|feature)\b/i,
  /\b(what's new in|monthly roundup|weekly roundup|quarterly update|product update|changelog|release notes)\b/i,
  /\b(this release (targets|introduces|brings|adds|fixes))\b/i,

  // 3. Corporate PR, Deal Announcements & Real Estate
  /\b(partner(s|ed|ing)?\s+(with|for)|partnership with|join forces|teams? up with|teaming up with|\bx\s+[A-Z][a-zA-Z0-9]+)\b/i,
  /\b(opens?|opening|new)\s+([a-zA-Z\s]+)?(hub|office|headquarters|campus|center|centre)\b/i,
  /\b(commercial agreement|strategic alliance|enterprise agreement|sovereign enterprise)\b/i,
  /\b(series\s+[a-f]|funding round|valuation|ipo|seed round|venture round|capital raised)\b/i,
  /\b(appointed as|joins as|executive team|welcoming our new|hires? as|c-suite)\b/i,
  /\b(earnings call|shareholder letter|quarterly results|financial results|fiscal year)\b/i,
  /\b(terms of service update|privacy policy update|brand refresh|new logo|rebrand)\b/i,

  // 4. Economic, Labor Market & Policy Studies (Think-tank & CSR reports)
  /\b(robot exposure index|physical job tasks|jobs? will robots do|predict the jobs)\b/i,
  /\b(labor market|workforce impact|future of work|job disruption|unemployment rate)\b/i,
  /\b(economic impact|gdp growth|macroeconomic|wages? impact)\b/i,
  /\b(societal impact|public policy paper|governance framework|regulatory response|amicus brief)\b/i,
  /\b(diversity report|sustainability report|carbon footprint|our pledge|our commitment)\b/i,

  // 5. Customer Marketing, Promotional & Sales Case Studies
  /^how\s+[\w\s]+\s+(is using|uses|scales with|transforms|reimagines|chose|accelerates with)\s+/i,
  /\b(customer story|customer spotlight|customer success|client story|case study)\b/i,
  /\b(pricing change|price update|discount|black friday|cyber monday)\b/i,

  // 6. Events, Conferences, Talks, Webinars & Podcasts
  /\b(webinar|conference recap|visit our booth|fireside chat|panel discussion|roundtable|watch the recording|podcast episode)\b/i,
  /\b(share your story|tell us what you think|community survey|take the survey|feedback form)\b/i,
  /\b(named a leader in gartner|forrester wave|magic quadrant)\b/i,
  /\b(intern spotlight|life at\s+[A-Z]|meet the team|employee spotlight|we are hiring)\b/i,
];

// Core architectural & systems markers
const CORE_TECHNICAL_MARKERS = [
  // Systems & Architecture
  "latency",
  "throughput",
  "distributed system",
  "distributed systems",
  "distributed",
  "concurrency",
  "sharding",
  "replication",
  "kernel",
  "microservices",
  "benchmark",
  "benchmarking",
  "benchmarked",
  "inference",
  "quantization",
  "kv cache",
  "pipeline",
  "memory allocator",
  "gpu cluster",
  "zero-copy",
  "profiling",
  "internals",
  "postmortem",
  "packet",
  "consensus",
  "raft",
  "paxos",
  "acid",
  "idempotency",
  "idempotent",
  "fault tolerance",
  "actor model",
  "load balancer",
  "service mesh",
  "observability",
  "chaos engineering",
  "rate limit",
  "rate limiting",

  // Data & Storage Engines
  "postgres",
  "postgresql",
  "mysql",
  "sqlite",
  "clickhouse",
  "scylladb",
  "cassandra",
  "cockroachdb",
  "duckdb",
  "redis",
  "rocksdb",
  "btree",
  "b-tree",
  "lsm",
  "lsm-tree",
  "nvme",
  "storage engine",
  "mvcc",
  "columnar",
  "query planner",
  "database index",
  "database indexing",

  // Cloud & Infra
  "kubernetes",
  "k8s",
  "docker",
  "container",
  "containers",
  "anycast",
  "cdn",
  "networking",
  "firecracker",
  "serverless",
  "dns",
  "bgp",
  "wireguard",
  "ddos",
  "envoy",
  "istio",
  "terraform",

  // Low-Level, Compilers & Languages
  "rust",
  "zig",
  "c++",
  "golang",
  "compiler",
  "compilers",
  "ast",
  "llvm",
  "webassembly",
  "wasm",
  "ebpf",
  "xdp",
  "linux kernel",
  "memory management",
  "allocator",
  "assembly",
  "v8",
  "simd",
  "garbage collection",

  // Web & UI Systems
  "crdt",
  "crdts",
  "turbopack",
  "bundler",
  "local-first",
  "sync engine",
  "canvas",
  "webgl",
  "webgpu",
  "virtual dom",
  "rendering engine",

  // AI & ML Systems
  "llm",
  "transformer",
  "transformers",
  "triton",
  "cuda",
  "model training",
  "fine-tuning",
  "vector search",
  "vector database",
  "embedding",
  "embeddings",
  "rag",
  "vllm",
  "interpretability",
  "monosemanticity",
  "diffusion model",
  "reinforcement learning",
];

// Engineering Action Verbs
const ENGINEERING_ACTION_VERBS = [
  "migrated",
  "migrating",
  "migration",
  "optimized",
  "optimizing",
  "optimization",
  "architected",
  "architecture",
  "reduced latency",
  "debugged",
  "debugging",
  "implemented",
  "implementing",
  "rewrote",
  "rewriting",
  "refactored",
  "refactoring",
  "profiled",
  "profiling",
  "scaled",
  "scaling",
  "how we built",
  "how we designed",
  "how we scaled",
  "deep dive",
  "under the hood",
];

export function isDisqualifiedByVeto(title: string, content: string = ""): boolean {
  const combined = `${title} ${content}`;
  const lowerTitle = title.toLowerCase();

  // If title explicitly signals engineering action, exempt from loose patterns
  const isExplicitEngineeringTitle =
    lowerTitle.includes("how we built") ||
    lowerTitle.includes("how we scaled") ||
    lowerTitle.includes("how we migrated") ||
    lowerTitle.includes("postmortem") ||
    lowerTitle.includes("outage analysis");

  if (isExplicitEngineeringTitle) {
    return false;
  }

  for (const pattern of UNIVERSAL_VETO_PATTERNS) {
    if (pattern.test(title) || pattern.test(combined)) {
      return true;
    }
  }

  return false;
}

export function calculateTechnicalScore(title: string, content: string = ""): number {
  let score = 0;

  // Title matches are weighted heavily (2 points each)
  for (const marker of CORE_TECHNICAL_MARKERS) {
    if (matchesKeyword(title, marker)) {
      score += 2;
    }
  }

  for (const verb of ENGINEERING_ACTION_VERBS) {
    if (matchesKeyword(title, verb)) {
      score += 2;
    }
  }

  // Content matches add 1 point each
  if (content) {
    for (const marker of CORE_TECHNICAL_MARKERS) {
      if (matchesKeyword(content, marker)) {
        score += 1;
      }
    }
  }

  return score;
}

export function isTechnicalEngineeringArticle(title: string, content: string = ""): boolean {
  // Gate 1: Check Universal Veto
  if (isDisqualifiedByVeto(title, content)) {
    return false;
  }

  // Reject empty, broken, or ultra-short summaries
  const cleanContent = (content || "").trim();
  if (!cleanContent || cleanContent === "No content." || cleanContent.length < 40) {
    return false;
  }

  // Reject malformed HTML fragments or broken sentence starts
  if (
    /^(from is|is now|this release|\. [0-9]|on \. [0-9])/i.test(cleanContent) ||
    /GoogleAI Gateway/i.test(cleanContent) ||
    /\b(available on [a-zA-Z\s]*(gateway|marketplace|catalog))\b/i.test(cleanContent)
  ) {
    return false;
  }

  // Reject version tags, release numbers, and merge pull requests
  if (
    /^v?[0-9]+\.[0-9]+/i.test(title) ||
    /^release\s+v/i.test(title) ||
    /merge\s+pull\s+request/i.test(title) ||
    /release\s+changelog/i.test(title)
  ) {
    return false;
  }

  // Reject site-wide boilerplate marketing taglines
  const lowerContent = cleanContent.toLowerCase();
  if (
    lowerContent.includes("is an ai safety and research company") ||
    lowerContent.includes("overview of the latest") ||
    lowerContent.includes("stay tuned")
  ) {
    return false;
  }

  // Gate 2: Positive Technical Score (must have >= 2 points)
  const score = calculateTechnicalScore(title, cleanContent);
  return score >= 2;
}

export function isMarketingFluff(title: string, content: string = ""): boolean {
  return !isTechnicalEngineeringArticle(title, content);
}

// Refined 7-Pillar Technical Taxonomy with exact technical signals
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "AI & Machine Learning": [
    "ai",
    "llm",
    "gpt",
    "gpu",
    "triton",
    "transformer",
    "transformers",
    "inference",
    "machine learning",
    "deep learning",
    "neural",
    "interpretability",
    "kv cache",
    "cuda",
    "quantization",
    "vllm",
    "model training",
    "fine-tuning",
    "embedding",
    "embeddings",
    "vector search",
    "vector database",
    "diffusion",
    "rag",
    "agentic",
    "claude",
    "llama",
    "gemini",
  ],
  "Distributed Systems": [
    "distributed system",
    "distributed systems",
    "distributed",
    "consensus",
    "raft",
    "paxos",
    "microservices",
    "microservice",
    "rpc",
    "grpc",
    "event stream",
    "event streaming",
    "idempotency",
    "idempotent",
    "fault tolerance",
    "actor model",
    "kafka",
    "replication",
    "partition",
    "consistency",
    "active-active",
    "two-phase commit",
    "distributed transactions",
    "scalability",
    "queue",
    "queues",
    "queuing",
    "message queue",
    "pubsub",
    "data pipeline",
    "failover",
    "circuit breaker",
    "stream processing",
    "event-driven",
    "multi-region",
    "replication lag",
    "distributed cache",
    "distributed tracing",
    "load balancing",
    "opentelemetry",
  ],
  "Databases & Storage": [
    "postgres",
    "postgresql",
    "mysql",
    "sql",
    "database",
    "databases",
    "scylladb",
    "cassandra",
    "cockroachdb",
    "clickhouse",
    "sqlite",
    "duckdb",
    "tigerbeetle",
    "storage engine",
    "mvcc",
    "sharding",
    "acid",
    "cache",
    "caching",
    "redis",
    "rocksdb",
    "btree",
    "b-tree",
    "lsm",
    "lsm-tree",
    "nvme",
    "pgvector",
    "columnar",
  ],
  "Infrastructure & Cloud": [
    "kubernetes",
    "k8s",
    "docker",
    "container",
    "containers",
    "anycast",
    "cdn",
    "networking",
    "firecracker",
    "cloud infrastructure",
    "cloud",
    "aws",
    "gcp",
    "azure",
    "serverless",
    "dns",
    "bgp",
    "wireguard",
    "ddos",
    "reliability",
    "latency",
    "chaos engineering",
    "load balancer",
    "service mesh",
    "observability",
    "sre",
    "terraform",
  ],
  "Low-Level & Compilers": [
    "rust",
    "zig",
    "c++",
    "golang",
    "compiler",
    "compilers",
    "ast",
    "llvm",
    "webassembly",
    "wasm",
    "ebpf",
    "xdp",
    "linux kernel",
    "kernel",
    "memory management",
    "allocator",
    "assembly",
    "v8",
    "simd",
    "zero-copy",
    "concurrency",
    "garbage collection",
    "profiling",
    "flamegraph",
    "cpu optimization",
    "jit",
    "codegen",
    "bytecode",
    "linker",
    "multithreading",
    "lock-free",
    "atomics",
    "io_uring",
    "epoll",
    "cache locality",
  ],
  "Web & Platforms": [
    "frontend",
    "crdt",
    "crdts",
    "browser",
    "browsers",
    "typescript",
    "javascript",
    "react",
    "next.js",
    "turbopack",
    "bundler",
    "design system",
    "multiplayer",
    "local-first",
    "sync engine",
    "canvas",
    "rendering",
    "webgl",
    "webgpu",
    "ui",
    "css",
    "dom",
    "server components",
    "rsc",
    "streaming ssr",
    "hydration",
    "islands architecture",
    "micro-frontend",
    "microfrontends",
    "state management",
    "core web vitals",
    "web vitals",
    "inp",
    "lcp",
    "layout shift",
    "vite",
    "webpack",
    "turborepo",
    "monorepo",
    "tailwind",
    "accessibility",
    "a11y",
    "design tokens",
    "web worker",
    "service worker",
    "pwa",
    "react native",
    "electron",
    "playwright",
    "headless ui",
    "storybook",
  ],
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesKeyword(text: string, kw: string): boolean {
  const escaped = escapeRegex(kw.toLowerCase());
  // Use regex word boundaries for alphanumeric boundaries, fallback for special chars like c++ or next.js
  const prefix = /^[a-z0-9]/i.test(kw) ? "\\b" : "(?:^|\\s|[^a-zA-Z0-9])";
  const suffix = /[a-z0-9]$/i.test(kw) ? "\\b" : "(?:$|\\s|[^a-zA-Z0-9])";
  const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");
  return regex.test(text);
}

export function detectCategories(
  title: string,
  summary: string,
  existingTags: string[] = []
): string[] {
  const combined = `${title} ${summary} ${existingTags.join(" ")}`;
  const detectedTags = new Set<string>();

  // Preserve 'Classics' and 'Postmortems' tags if in existing tags
  if (existingTags.some((t) => t.toLowerCase() === "classics")) {
    detectedTags.add("Classics");
  }
  if (existingTags.some((t) => t.toLowerCase() === "postmortems" || t.toLowerCase() === "postmortem")) {
    detectedTags.add("Postmortems");
  }

  // Auto-detect production postmortems & incident analyses
  if (
    /\b(postmortem|outage\s+analysis|root\s+cause\s+analysis|\brca\b|incident\s+report|incident\s+review|service\s+disruption|post-mortem)\b/i.test(
      `${title} ${summary}`
    )
  ) {
    detectedTags.add("Postmortems");
  }

  // Score match count per category using strict word-boundary matching
  const categoryScores: { category: string; score: number }[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (matchesKeyword(combined, kw)) {
        score++;
      }
    }
    if (score > 0) {
      categoryScores.push({ category, score });
    }
  }

  // Sort categories by highest match score first
  categoryScores.sort((a, b) => b.score - a.score);

  // Take top 1 or 2 matching categories
  for (const item of categoryScores.slice(0, 2)) {
    detectedTags.add(item.category);
  }

  // Also include 1-2 specific keyword chips if found
  const specificSignals = [
    "Rust",
    "eBPF",
    "Kubernetes",
    "GPU",
    "PostgreSQL",
    "ClickHouse",
    "Kafka",
    "Distributed Systems",
    "WebAssembly",
    "CRDT",
    "Linux Kernel",
    "Raft",
  ];
  for (const sig of specificSignals) {
    if (matchesKeyword(combined, sig)) {
      detectedTags.add(sig);
    }
  }

  const tagsArray = Array.from(detectedTags);
  return tagsArray.length > 0 ? tagsArray.slice(0, 4) : [];
}

export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    // Decimal entities: &#39; -> '
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return _;
      }
    })
    // Hex entities: &#x27; -> '
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return _;
      }
    })
    // Named entities
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…");
}

export function cleanTitle(title: string): string {
  if (!title) return "";
  let clean = decodeHtmlEntities(title).trim();
  // Strip trailing site/company suffixes: e.g. " | ClickHouse", " - Vercel", " — Cloudflare Blog"
  clean = clean.replace(
    /\s*[|\-—–•]\s*(ClickHouse|Vercel|Stripe|Cloudflare|Netflix|OpenAI|Anthropic|GitHub|Slack|Uber|Canva|Meta|AWS|Discord|Tailscale|Fly\.io|Datadog|Supabase|TigerBeetle|CockroachDB|ScyllaDB|PlanetScale|DuckDB|Hugging Face|Mistral|Chrome Developers|web\.dev|React|Evil Martians|Google Research|The Cloudflare Blog|Engineering Blog|Engineering|Blog).*$/i,
    ""
  );
  return clean.trim();
}

export function cleanHtmlSummary(htmlOrText: string = ""): string {
  if (!htmlOrText) return "";

  // 1. Strip all HTML tags
  const stripped = htmlOrText.replace(/<[^>]*>/g, " ");

  // 2. Decode all decimal, hex, and named HTML entities
  const text = decodeHtmlEntities(stripped)
    .replace(/\s+/g, " ")
    .trim();

  // 3. Extract first 1-2 clean sentences (up to ~280 chars)
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (sentences && sentences.length > 0) {
    const firstTwo = sentences.slice(0, 2).join("").trim();
    if (firstTwo.length > 30) {
      return firstTwo.length > 280 ? firstTwo.slice(0, 277) + "..." : firstTwo;
    }
  }

  return text.length > 280 ? text.slice(0, 277) + "..." : text;
}

export function estimateReadTime(text: string = ""): string {
  const words = text.trim().split(/\s+/).length;
  // If we have substantial full content, calculate directly
  if (words > 250) {
    const minutes = Math.min(25, Math.max(3, Math.ceil(words / 190)));
    return `${minutes} min read`;
  }
  // If only summary/snippet is provided, estimate realistic technical read time (5–8 mins)
  const dynamicMinutes = 5 + (words % 4);
  return `${dynamicMinutes} min read`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export interface ParsedFeedItem {
  title: string;
  source_url: string;
  summary: string;
  tags: string[];
  read_time: string;
  published_at: string;
  slug: string;
}

export async function fetchAndParseFeed(
  feedUrl: string,
  existingUrls?: Set<string>
): Promise<ParsedFeedItem[]> {
  if (feedUrl.startsWith("custom:")) {
    return fetchCustomFeed(feedUrl, existingUrls);
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    if (!feed.items || feed.items.length === 0) {
      return [];
    }

    const parsedItems: ParsedFeedItem[] = [];

    for (const item of feed.items) {
      const title = cleanTitle(item.title || "");
      const link = (item.link || "").trim();
      if (!title || !link || !link.startsWith("http")) continue;

      // Fast 0ms skip: if already saved in database, don't do any processing
      if (existingUrls && existingUrls.has(link)) {
        continue;
      }

      const rawContent = item.contentSnippet || item.content || item.summary || "";

      // Quality filter: discard PR, broken summaries, or non-technical content
      if (isMarketingFluff(title, rawContent)) {
        continue;
      }

      const summary = cleanHtmlSummary(rawContent);
      if (!summary || summary.length < 35 || summary === "No content.") {
        continue;
      }

      const tags = detectCategories(title, rawContent, item.categories || []);
      if (!tags || tags.length === 0) {
        continue;
      }
      const read_time = estimateReadTime(rawContent);

      let published_at = new Date().toISOString();
      if (item.isoDate) {
        published_at = new Date(item.isoDate).toISOString();
      } else if (item.pubDate) {
        published_at = new Date(item.pubDate).toISOString();
      }

      parsedItems.push({
        title,
        source_url: link,
        summary,
        tags,
        read_time,
        published_at,
        slug: generateSlug(title),
      });
    }

    return parsedItems;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[RSS Parser] Failed to fetch feed at ${feedUrl}:`, msg);
    return [];
  }
}

// Lightweight, legal Open Graph crawler for sites without native RSS feeds
async function fetchCustomFeed(
  customUrl: string,
  existingUrls?: Set<string>
): Promise<ParsedFeedItem[]> {
  const type = customUrl.replace("custom:", "").trim();

  interface CustomConfig {
    listingUrl: string;
    baseUrl: string;
    linkRegex: RegExp;
    categoryHint: string;
  }

  const configs: Record<string, CustomConfig> = {
    anthropic: {
      listingUrl: "https://www.anthropic.com/research",
      baseUrl: "https://www.anthropic.com",
      linkRegex: /href="(\/research\/[a-z0-9-]+)"/gi,
      categoryHint: "AI & Machine Learning",
    },
    mistral: {
      listingUrl: "https://mistral.ai/news/",
      baseUrl: "https://mistral.ai",
      linkRegex: /href="(\/news\/[a-z0-9-]+)"/gi,
      categoryHint: "AI & Machine Learning",
    },
    clickhouse: {
      listingUrl: "https://clickhouse.com/blog",
      baseUrl: "https://clickhouse.com",
      linkRegex: /href="(\/blog\/[a-z0-9-]+)"/gi,
      categoryHint: "Databases & Storage",
    },
    cockroachdb: {
      listingUrl: "https://www.cockroachlabs.com/blog/",
      baseUrl: "https://www.cockroachlabs.com",
      linkRegex: /href="(\/blog\/[a-z0-9-]+)"/gi,
      categoryHint: "Databases & Storage",
    },
    uber: {
      listingUrl: "https://www.uber.com/blog/engineering/",
      baseUrl: "https://www.uber.com",
      linkRegex: /href="(\/blog\/engineering\/[a-z0-9-]+)"/gi,
      categoryHint: "Infrastructure & Cloud",
    },
    linear: {
      listingUrl: "https://linear.app/blog",
      baseUrl: "https://linear.app",
      linkRegex: /href="(\/blog\/[a-z0-9-]+)"/gi,
      categoryHint: "Web & Platforms",
    },
    canva: {
      listingUrl: "https://canvatechblog.com/",
      baseUrl: "https://canvatechblog.com",
      linkRegex: /href="(\/[a-z0-9-]+)"/gi,
      categoryHint: "Web & Platforms",
    },
  };

  const config = configs[type];
  if (!config) return [];

  try {
    const res = await fetch(config.listingUrl, {
      headers: {
        "User-Agent": "engfeed-aggregator/1.0 (+https://engfeed.dev; discovery engine)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];
    const html = await res.text();

    const matchedLinks = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = config.linkRegex.exec(html)) !== null) {
      const path = match[1];
      if (
        !path.includes("/team/") &&
        !path.includes("/category/") &&
        !path.includes("/tag/") &&
        !path.includes("/author/") &&
        path.length > 12
      ) {
        matchedLinks.add(path.startsWith("http") ? path : `${config.baseUrl}${path}`);
      }
      if (matchedLinks.size >= 5) break;
    }

    const items: ParsedFeedItem[] = [];
    const linksToFetch = Array.from(matchedLinks).filter(
      (url) => !existingUrls || !existingUrls.has(url)
    );

    // Fetch Open Graph preview metadata for the un-synced matched articles concurrently
    await Promise.all(
      linksToFetch.map(async (url) => {
        try {
          const articleRes = await fetch(url, {
            headers: {
              "User-Agent": "engfeed-aggregator/1.0 (+https://engfeed.dev; discovery engine)",
              Accept: "text/html",
            },
            signal: AbortSignal.timeout(6000),
          });

          if (!articleRes.ok) return;
          const pageHtml = await articleRes.text();

          // Extract Open Graph tags
          const ogTitleMatch =
            pageHtml.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
            pageHtml.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i) ||
            pageHtml.match(/<title>(.*?)<\/title>/i);

          const ogDescMatch =
            pageHtml.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
            pageHtml.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);

          const title = ogTitleMatch ? cleanTitle(ogTitleMatch[1]) : "";
          if (!title) return;

          const summary = ogDescMatch
            ? cleanHtmlSummary(ogDescMatch[1])
            : `${title} — research and engineering overview.`;

          if (isMarketingFluff(title, summary)) return;

          const tags = detectCategories(title, summary, [config.categoryHint]);
          if (!tags || tags.length === 0) return;

          items.push({
            title,
            source_url: url,
            summary,
            tags,
            read_time: estimateReadTime(summary + " " + title + " detailed technical paper"),
            published_at: new Date().toISOString(),
            slug: generateSlug(title),
          });
        } catch {
          // Skip individual article failure silently
        }
      })
    );

    return items;
  } catch (err) {
    console.warn(`[Custom Ingester] Failed to ingest ${type}:`, err);
    return [];
  }
}

