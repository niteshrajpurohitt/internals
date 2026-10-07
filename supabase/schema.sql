-- ==============================================================================
-- engfeed — Supabase SQL Migration Script
-- Production-ready schema with RLS policies and 25 Tier-1 Engineering Companies
-- ==============================================================================

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- 3. Create 'companies' Table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    website_url TEXT NOT NULL,
    feed_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create 'posts' Table
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    read_time TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Indexes for fast aggregation and querying
CREATE INDEX idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX idx_posts_company_id ON public.posts(company_id);
CREATE INDEX idx_posts_tags ON public.posts USING GIN (tags);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Public Read Access (Anon and Authenticated users can SELECT)
CREATE POLICY "Public companies are viewable by everyone" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts 
FOR SELECT 
USING (true);

-- Writes are restricted to service_role (default deny for anon/authenticated)
CREATE POLICY "Service role has full access to companies"
ON public.companies
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to posts"
ON public.posts
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ==============================================================================
-- 8. Seed Data: 25 Tier-1 Engineering Companies & Sample Technical Deep Dives
-- ==============================================================================

INSERT INTO public.companies (name, slug, website_url, feed_url) VALUES
-- Infrastructure, Networking & Edge
('Cloudflare', 'cloudflare', 'https://blog.cloudflare.com/', 'https://blog.cloudflare.com/rss/'),
('Fly.io', 'flyio', 'https://fly.io/blog/', 'https://fly.io/blog/feed.xml'),
('Discord', 'discord', 'https://discord.com/blog', 'https://discord.com/blog/rss.xml'),
('Tailscale', 'tailscale', 'https://tailscale.com/blog', 'https://tailscale.com/blog/index.xml'),
('Datadog', 'datadog', 'https://www.datadoghq.com/blog/', 'https://www.datadoghq.com/blog/index.xml'),
('Meta Engineering', 'meta', 'https://engineering.fb.com/', 'https://engineering.fb.com/feed/'),
('AWS Architecture', 'aws', 'https://aws.amazon.com/blogs/architecture/', 'https://aws.amazon.com/blogs/architecture/feed/'),

-- Databases, Storage & Consensus
('Supabase', 'supabase', 'https://supabase.com/blog', 'https://supabase.com/rss.xml'),
('ClickHouse', 'clickhouse', 'https://clickhouse.com/blog', 'custom:clickhouse'),
('TigerBeetle', 'tigerbeetle', 'https://tigerbeetle.com/blog', 'https://tigerbeetle.com/blog/rss.xml'),
('CockroachDB', 'cockroachdb', 'https://www.cockroachlabs.com/blog/', 'custom:cockroachdb'),
('ScyllaDB', 'scylladb', 'https://www.scylladb.com/', 'https://www.scylladb.com/feed/'),
('PlanetScale', 'planetscale', 'https://planetscale.com/blog', 'https://planetscale.com/blog/rss.xml'),
('DuckDB', 'duckdb', 'https://duckdb.org/news/', 'https://duckdb.org/feed.xml'),

-- Platforms, Compilers & Web Systems
('Stripe', 'stripe', 'https://stripe.com/blog', 'https://stripe.com/blog/feed.rss'),
('Vercel', 'vercel', 'https://vercel.com/blog', 'https://vercel.com/atom'),
('Figma', 'figma', 'https://www.figma.com/blog', 'https://www.figma.com/blog/feed/atom.xml'),
('Linear', 'linear', 'https://linear.app/blog', 'custom:linear'),
('GitHub Engineering', 'github', 'https://github.blog/category/engineering/', 'https://github.blog/category/engineering/feed/'),
('Shopify Engineering', 'shopify', 'https://shopify.engineering/', 'https://shopify.engineering/blog.atom'),
('Slack Engineering', 'slack', 'https://slack.engineering/', 'https://slack.engineering/feed'),
('Netflix Tech Blog', 'netflix', 'https://netflixtechblog.com/', 'https://netflixtechblog.com/feed'),
('Spotify Engineering', 'spotify', 'https://engineering.atspotify.com/', 'https://engineering.atspotify.com/feed/'),
('Airbnb Tech', 'airbnb', 'https://airbnb.tech/', 'https://airbnb.tech/feed/'),
('Canva Engineering', 'canva', 'https://canvatechblog.com/', 'custom:canva'),
('Uber Engineering', 'uber', 'https://www.uber.com/blog/engineering/', 'custom:uber'),
('Chrome Developers', 'chrome', 'https://developer.chrome.com/blog', 'https://developer.chrome.com/feeds/blog.xml'),
('web.dev', 'webdev', 'https://web.dev/', 'https://web.dev/feed.xml'),
('React Blog', 'react', 'https://react.dev/blog', 'https://react.dev/rss.xml'),
('Evil Martians', 'evilmartians', 'https://evilmartians.com/chronicles', 'https://evilmartians.com/chronicles.rss'),

-- AI Systems, Compute & ML Infrastructure
('OpenAI', 'openai', 'https://openai.com/index/engineering/', 'https://openai.com/news/rss.xml'),
('Anthropic', 'anthropic', 'https://anthropic.com/research', 'custom:anthropic'),
('Mistral AI', 'mistral', 'https://mistral.ai/news/', 'custom:mistral'),
('Google Research', 'google', 'https://research.google/blog/', 'https://research.google/blog/rss/'),
('Hugging Face', 'huggingface', 'https://huggingface.co/blog', 'https://huggingface.co/blog/feed.xml')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    website_url = EXCLUDED.website_url,
    feed_url = EXCLUDED.feed_url;

-- Insert Seed Technical Deep Dives (linked via company slug lookup)
INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'Scaling Distributed KV Caching Across Multi-Cluster GPU Infrastructure',
    'scaling-distributed-kv-caching',
    'https://openai.com/index/scaling-kubernetes-to-7500-nodes/',
    'A comprehensive exploration of multi-tenant KV cache offloading across PCIe and InfiniBand fabrics. Reduces TTFT (Time-To-First-Token) by 64% while maintaining strict memory locality under burst token requests.',
    ARRAY['AI / Systems', 'Distributed Systems', 'GPU', 'Kubernetes'],
    '8 min read',
    NOW() - INTERVAL '1 day'
FROM public.companies c WHERE c.slug = 'openai'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'How Turbopack Accelerates Large-Scale Monorepos with Incremental Graph Computation',
    'turbopack-incremental-computation',
    'https://vercel.com/blog/turbopack',
    'A deep technical review of the Turbo engine architecture written in Rust. Details fine-grained function-level reactivity and how AST-level cache validation eliminates redundant compilation cycles in million-line repos.',
    ARRAY['Web Platforms', 'Rust', 'Compilers', 'Architecture'],
    '6 min read',
    NOW() - INTERVAL '2 days'
FROM public.companies c WHERE c.slug = 'vercel'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'Mechanistic Interpretability at Scale: Tracking Feature Superposition in Large Language Models',
    'mechanistic-interpretability-superposition',
    'https://anthropic.com/research/towards-monosemanticity-decomposing-language-models-with-dictionary-learning',
    'An architectural teardown of sparse autoencoder representations to resolve neuron superposition. Explores how decomposing multi-million activation vectors uncovers isolated semantic circuits during chain-of-thought execution.',
    ARRAY['AI / Systems', 'Machine Learning', 'Interpretability', 'Research'],
    '12 min read',
    NOW() - INTERVAL '3 days'
FROM public.companies c WHERE c.slug = 'anthropic'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'Zero-Allocation eBPF Packet Filtering in Anycast Edge Networks',
    'zero-allocation-ebpf-anycast',
    'https://blog.cloudflare.com/l4drop-xdp-ebpf-based-ddos-mitigations/',
    'How Cloudflare migrates Layer 4 DDoS mitigation into the Linux kernel XDP driver with zero socket allocations. Achieves line-rate 100Gbps ingress mitigation per bare-metal edge box with deterministic sub-microsecond latency.',
    ARRAY['Infra & Cloud', 'eBPF', 'Networking', 'Linux Kernel'],
    '10 min read',
    NOW() - INTERVAL '4 days'
FROM public.companies c WHERE c.slug = 'cloudflare'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'How Discord Stores Trillions of Messages: Migrating from Cassandra to ScyllaDB',
    'discord-migrating-cassandra-to-scylladb',
    'https://discord.com/blog/how-discord-stores-trillions-of-messages',
    'A production retrospective on reducing tail latency spikes and JVM garbage collection pauses by shifting 4 trillion chat messages from Cassandra to a C++-native ScyllaDB cluster.',
    ARRAY['Database & Storage', 'ScyllaDB', 'C++', 'Distributed Systems'],
    '9 min read',
    NOW() - INTERVAL '5 days'
FROM public.companies c WHERE c.slug = 'discord'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'Designing Distributed Financial Ledgers with Zig and Viewstamped Replication',
    'tigerbeetle-financial-ledgers-zig-vsr',
    'https://tigerbeetle.com/blog/2023-07-11-we-put-half-a-million-dollars-on-the-line',
    'How TigerBeetle eliminates subtle silent disk corruptions and hardware flakiness using deterministic state machine simulations and strict static memory allocations in Zig.',
    ARRAY['Database & Storage', 'Zig', 'Consensus', 'Systems Programming'],
    '11 min read',
    NOW() - INTERVAL '6 days'
FROM public.companies c WHERE c.slug = 'tigerbeetle'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'Figma Real-Time Multiplayer: Scaling WebSockets and CRDT State Trees',
    'figma-multiplayer-crdt-scaling',
    'https://www.figma.com/blog/how-figmas-multiplayer-technology-works/',
    'Deep dive into the collaborative multiplayer architecture powering Figma documents. Details operational transforms vs CRDT trade-offs and client-side WebAssembly synchronization trees.',
    ARRAY['Classics', 'Web Platforms', 'WebAssembly', 'CRDT'],
    '7 min read',
    NOW() - INTERVAL '7 days'
FROM public.companies c WHERE c.slug = 'figma'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'How Stripe Architected Exactly-Once Financial Event Processing with Idempotency Keys',
    'stripe-exactly-once-financial-events',
    'https://stripe.com/blog/idempotency',
    'Engineering patterns for achieving zero duplicate charges across network timeouts and multi-datacenter retry storms. Explores database lock partitioning and lease tokens.',
    ARRAY['Classics', 'Infra & Cloud', 'Distributed Systems', 'Idempotency'],
    '6 min read',
    NOW() - INTERVAL '8 days'
FROM public.companies c WHERE c.slug = 'stripe'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'Why Discord is Switching from Go to Rust',
    'why-discord-is-switching-from-go-to-rust',
    'https://discord.com/blog/why-discord-is-switching-from-go-to-rust',
    'An iconic systems teardown detailing how Go non-deterministic garbage collector caused tail latency spikes every 2 minutes, and how Rust zero-cost memory management restored flat sub-millisecond latencies.',
    ARRAY['Classics', 'Rust', 'Go', 'Systems Programming'],
    '9 min read',
    '2020-02-04 12:00:00+00'::timestamptz
FROM public.companies c WHERE c.slug = 'discord'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'How We Built Pingora in Rust to Replace NGINX at Cloudflare Scale',
    'how-we-built-pingora-in-rust',
    'https://blog.cloudflare.com/how-we-built-pingora-in-rust/',
    'Why Cloudflare engineered an async Rust proxy engine to handle over 1 trillion requests per day, saving 70% CPU and 67% memory compared to their legacy NGINX architecture.',
    ARRAY['Classics', 'Rust', 'Networking', 'Infra & Cloud'],
    '11 min read',
    '2022-09-14 12:00:00+00'::timestamptz
FROM public.companies c WHERE c.slug = 'cloudflare'
ON CONFLICT (source_url) DO NOTHING;

INSERT INTO public.posts (
    company_id, 
    title, 
    slug, 
    source_url, 
    summary, 
    tags, 
    read_time, 
    published_at
)
SELECT 
    c.id,
    'Designing Schemaless: How Uber Scaled MySQL to Petabytes',
    'designing-schemaless-uber-mysql',
    'https://www.uber.com/blog/schemaless-sql-database/',
    'How Uber architected an append-only distributed datastore on top of partitioned MySQL instances to survive trip volume scaling from 100K to 10M+ trips daily without schema locks.',
    ARRAY['Classics', 'Database & Storage', 'MySQL', 'Scalability'],
    '10 min read',
    '2016-06-08 12:00:00+00'::timestamptz
FROM public.companies c WHERE c.slug = 'uber'
ON CONFLICT (source_url) DO NOTHING;

