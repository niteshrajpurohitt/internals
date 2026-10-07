export interface LandmarkArticle {
  companySlug: string;
  companyName: string;
  websiteUrl: string;
  title: string;
  slug: string;
  sourceUrl: string;
  summary: string;
  tags: string[];
  readTime: string;
  publishedAt: string;
}

export const LANDMARK_POSTMORTEMS: LandmarkArticle[] = [
  {
    companySlug: "crowdstrike",
    companyName: "CrowdStrike",
    websiteUrl: "https://www.crowdstrike.com/blog/",
    title: "Falcon Sensor Update: Windows Kernel Driver Channel 291 Outage Root Cause Analysis (PIR)",
    slug: "crowdstrike-falcon-channel-291-windows-kernel-rca",
    sourceUrl: "https://www.crowdstrike.com/blog/falcon-update-for-windows-hosts-technical-root-cause-analysis/",
    summary:
      "A technical review of how an out-of-bounds pointer read (0xc0000005) inside CSFilter.sys during Channel File 291 evaluation triggered kernel panic bugchecks on 8.5 million Windows systems, and why defensive validation in ring 0 drivers is critical.",
    tags: ["Postmortems", "Low-Level & Compilers", "Windows Kernel", "Outage Analysis"],
    readTime: "12 min read",
    publishedAt: "2024-07-24T18:00:00.000Z",
  },
  {
    companySlug: "aws",
    companyName: "AWS Architecture",
    websiteUrl: "https://aws.amazon.com/blogs/architecture/",
    title: "AWS Post-Event Summary: Amazon Kinesis Operating Capacity and Front-End Thread Starvation Outage",
    slug: "aws-kinesis-operating-capacity-thread-starvation-outage",
    sourceUrl: "https://aws.amazon.com/message/11201/",
    summary:
      "Detailed root cause analysis of the US-EAST-1 Kinesis disruption: how adding capacity exceeded OS thread allocation limits on the front-end fleet, creating cluster-wide cascading backpressure across dependent AWS services.",
    tags: ["Postmortems", "Distributed Systems", "Infrastructure & Cloud", "Outage Analysis"],
    readTime: "14 min read",
    publishedAt: "2020-11-28T12:00:00.000Z",
  },
  {
    companySlug: "aws",
    companyName: "AWS Architecture",
    websiteUrl: "https://aws.amazon.com/blogs/architecture/",
    title: "Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region",
    slug: "summary-of-the-amazon-s3-service-disruption-us-east-1",
    sourceUrl: "https://aws.amazon.com/message/41926/",
    summary:
      "The definitive postmortem detailing how an operational command removed more servers than intended, triggering a complete cold restart of the S3 index subsystem and massive cascading dependency failures across the cloud.",
    tags: ["Postmortems", "Distributed Systems", "Databases & Storage", "Outage Analysis"],
    readTime: "10 min read",
    publishedAt: "2017-03-02T12:00:00.000Z",
  },
  {
    companySlug: "github",
    companyName: "GitHub Engineering",
    websiteUrl: "https://github.blog/category/engineering/",
    title: "GitHub Postmortem: An Update on the 24-Hour Service Degradation (MySQL Split-Brain & Partition)",
    slug: "github-postmortem-24-hour-service-degradation-mysql",
    sourceUrl: "https://github.blog/2018-10-30-oct21-post-incident-analysis/",
    summary:
      "How a brief 43-second network split between US East and US East 2 caused database partitions, brief split-brain writes, and required 24 hours of manual transaction replication reconciliation.",
    tags: ["Postmortems", "Databases & Storage", "Distributed Systems", "Postmortem"],
    readTime: "11 min read",
    publishedAt: "2018-10-30T12:00:00.000Z",
  },
  {
    companySlug: "cloudflare",
    companyName: "Cloudflare",
    websiteUrl: "https://blog.cloudflare.com/",
    title: "Post-Mortem on the Cloudbleed Buffer Over-Read Parser Bug",
    slug: "cloudflare-cloudbleed-buffer-over-read-postmortem",
    sourceUrl: "https://blog.cloudflare.com/incident-report-on-memory-leak-caused-by-cloudflare-parser-bug/",
    summary:
      "An architectural retrospective analyzing how an off-by-one pointer error in a Ragel HTML parser rewrite caused uninitialized memory buffers containing HTTP headers and private data to leak into downstream responses.",
    tags: ["Postmortems", "Low-Level & Compilers", "Infrastructure & Cloud", "Security"],
    readTime: "9 min read",
    publishedAt: "2017-02-23T12:00:00.000Z",
  },
  {
    companySlug: "gitlab",
    companyName: "GitLab",
    websiteUrl: "https://about.gitlab.com/blog/",
    title: "Postmortem of Database Outage and pg_dump Backup Restoration Review",
    slug: "gitlab-database-outage-backup-restoration-review",
    sourceUrl: "https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/",
    summary:
      "The transparent engineering breakdown of how an accidental directory wipe on the primary PostgreSQL node revealed multiple silent backup failure modes, and how the team recovered from secondary LVM snapshots live on stream.",
    tags: ["Postmortems", "Databases & Storage", "Infrastructure & Cloud", "Postmortem"],
    readTime: "13 min read",
    publishedAt: "2017-02-10T12:00:00.000Z",
  },
  {
    companySlug: "slack",
    companyName: "Slack Engineering",
    websiteUrl: "https://slack.engineering/",
    title: "Dissecting the WebSocket Reconnection Storm: Slack Outage Postmortem",
    slug: "slack-websocket-reconnection-storm-outage",
    sourceUrl: "https://slack.engineering/dissecting-the-slack-reconnection-storm/",
    summary:
      "How a sudden network blip caused millions of active clients to reconnect simultaneously, overwhelming Redis message brokers and triggering backpressure deadlocks in the gateway tier.",
    tags: ["Postmortems", "Distributed Systems", "Infrastructure & Cloud", "Outage Analysis"],
    readTime: "8 min read",
    publishedAt: "2021-01-05T12:00:00.000Z",
  },
  {
    companySlug: "meta",
    companyName: "Meta Engineering",
    websiteUrl: "https://engineering.fb.com/",
    title: "Update on the Global Outage: BGP Routing and Backbone Network Teardown",
    slug: "meta-global-outage-bgp-backbone-network-teardown",
    sourceUrl: "https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/",
    summary:
      "How an automated audit command severed backbone connections between datacenters, causing DNS servers to withdraw BGP advertisements globally and cutting off remote console access.",
    tags: ["Postmortems", "Infrastructure & Cloud", "Distributed Systems", "Networking"],
    readTime: "10 min read",
    publishedAt: "2021-10-05T12:00:00.000Z",
  },
];

export const LANDMARK_CLASSICS: LandmarkArticle[] = [
  {
    companySlug: "openai",
    companyName: "OpenAI",
    websiteUrl: "https://openai.com/index/engineering/",
    title: "Scaling Kubernetes to 7,500 Nodes for Deep Learning Infrastructure",
    slug: "scaling-kubernetes-to-7500-nodes",
    sourceUrl: "https://openai.com/index/scaling-kubernetes-to-7500-nodes/",
    summary:
      "OpenAI's foundational infrastructure paper explaining how they scaled a single Kubernetes cluster to 7,500 bare-metal nodes for large-scale GPU training, overcoming iptables bottlenecks, Calico BGP limits, and etcd transaction contention.",
    tags: ["Classics", "Infrastructure & Cloud", "Distributed Systems", "Kubernetes"],
    readTime: "10 min read",
    publishedAt: "2021-01-26T16:00:00.000Z",
  },
  {
    companySlug: "discord",
    companyName: "Discord",
    websiteUrl: "https://discord.com/blog",
    title: "Why Discord is Switching from Go to Rust",
    slug: "why-discord-is-switching-from-go-to-rust",
    sourceUrl: "https://discord.com/blog/why-discord-is-switching-from-go-to-rust",
    summary:
      "An iconic systems teardown detailing how Go's non-deterministic garbage collector caused tail latency spikes every 2 minutes, and how Rust's zero-cost memory management restored flat sub-millisecond latencies.",
    tags: ["Classics", "Low-Level & Compilers", "Rust", "Go"],
    readTime: "9 min read",
    publishedAt: "2020-02-04T12:00:00.000Z",
  },
  {
    companySlug: "cloudflare",
    companyName: "Cloudflare",
    websiteUrl: "https://blog.cloudflare.com/",
    title: "How We Built Pingora in Rust to Replace NGINX at Cloudflare Scale",
    slug: "how-we-built-pingora-in-rust",
    sourceUrl: "https://blog.cloudflare.com/how-we-built-pingora-in-rust/",
    summary:
      "Why Cloudflare engineered an async Rust proxy engine to handle over 1 trillion requests per day, saving 70% CPU and 67% memory compared to their legacy NGINX architecture.",
    tags: ["Classics", "Low-Level & Compilers", "Rust", "Infrastructure & Cloud"],
    readTime: "11 min read",
    publishedAt: "2022-09-14T12:00:00.000Z",
  },
  {
    companySlug: "figma",
    companyName: "Figma",
    websiteUrl: "https://www.figma.com/blog",
    title: "How Figma's Multiplayer Technology Works: CRDTs and WebAssembly",
    slug: "how-figmas-multiplayer-technology-works",
    sourceUrl: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
    summary:
      "Deep dive into the collaborative multiplayer architecture powering Figma documents. Details operational transforms vs CRDT trade-offs and client-side WebAssembly synchronization trees.",
    tags: ["Classics", "Web & Platforms", "WebAssembly", "CRDT"],
    readTime: "8 min read",
    publishedAt: "2019-10-16T12:00:00.000Z",
  },
  {
    companySlug: "stripe",
    companyName: "Stripe",
    websiteUrl: "https://stripe.com/blog",
    title: "Designing Exactly-Once Financial Event Processing with Idempotency Keys",
    slug: "stripe-designing-exactly-once-event-processing-idempotency",
    sourceUrl: "https://stripe.com/blog/idempotency",
    summary:
      "Engineering patterns for achieving zero duplicate charges across network timeouts and multi-datacenter retry storms. Explores database lock partitioning and lease tokens.",
    tags: ["Classics", "Distributed Systems", "Infrastructure & Cloud", "Idempotency"],
    readTime: "7 min read",
    publishedAt: "2017-09-07T12:00:00.000Z",
  },
  {
    companySlug: "uber",
    companyName: "Uber Engineering",
    websiteUrl: "https://www.uber.com/blog/engineering/",
    title: "Designing Schemaless: How Uber Scaled MySQL to Petabytes",
    slug: "designing-schemaless-uber-mysql-scaling",
    sourceUrl: "https://www.uber.com/blog/schemaless-sql-database/",
    summary:
      "How Uber architected an append-only distributed datastore on top of partitioned MySQL instances to survive trip volume scaling from 100K to 10M+ trips daily without schema locks.",
    tags: ["Classics", "Databases & Storage", "MySQL", "Distributed Systems"],
    readTime: "10 min read",
    publishedAt: "2016-06-08T12:00:00.000Z",
  },
  {
    companySlug: "tigerbeetle",
    companyName: "TigerBeetle",
    websiteUrl: "https://tigerbeetle.com/blog",
    title: "Designing Distributed Financial Ledgers with Zig and Viewstamped Replication",
    slug: "tigerbeetle-distributed-financial-ledgers-zig-vsr",
    sourceUrl: "https://tigerbeetle.com/blog/2023-07-11-we-put-half-a-million-dollars-on-the-line",
    summary:
      "How TigerBeetle eliminates subtle silent disk corruptions and hardware flakiness using deterministic state machine simulations and strict static memory allocations in Zig.",
    tags: ["Classics", "Databases & Storage", "Zig", "Consensus"],
    readTime: "11 min read",
    publishedAt: "2023-07-11T12:00:00.000Z",
  },
];
