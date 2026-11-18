// Shared by the post card (to build favicon URLs) and /api/favicon (to allow only these domains).

export const BRAND_DOMAINS: Record<string, string> = {
  netflix: "netflix.com",
  airbnb: "airbnb.com",
  canva: "canva.com",
  shopify: "shopify.com",
  slack: "slack.com",
  github: "github.com",
  meta: "meta.com",
  spotify: "spotify.com",
  chrome: "chrome.com",
  "37signals": "37signals.com",
  cloudflare: "cloudflare.com",
  flyio: "fly.io",
  discord: "discord.com",
  tailscale: "tailscale.com",
  datadog: "datadoghq.com",
  aws: "aws.amazon.com",
  supabase: "supabase.com",
  clickhouse: "clickhouse.com",
  tigerbeetle: "tigerbeetle.com",
  cockroachdb: "cockroachlabs.com",
  scylladb: "scylladb.com",
  planetscale: "planetscale.com",
  duckdb: "duckdb.org",
  stripe: "stripe.com",
  vercel: "vercel.com",
  figma: "figma.com",
  linear: "linear.app",
  uber: "uber.com",
  webdev: "web.dev",
  react: "react.dev",
  evilmartians: "evilmartians.com",
  openai: "openai.com",
  anthropic: "anthropic.com",
  google: "research.google",
  huggingface: "huggingface.co",
  crowdstrike: "crowdstrike.com",
  gitlab: "gitlab.com",
  fastly: "fastly.com",
  atlassian: "atlassian.com",
};

const HOST_ALIASES = ["netflix", "airbnb", "canva", "shopify", "slack", "spotify"];

export function getCompanyDomain(websiteUrl?: string | null, slug?: string | null): string {
  const cleanSlug = (slug || "").toLowerCase();
  if (cleanSlug && BRAND_DOMAINS[cleanSlug]) {
    return BRAND_DOMAINS[cleanSlug];
  }

  if (websiteUrl) {
    try {
      const url = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
      const hostname = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
      const alias = HOST_ALIASES.find((name) => hostname.includes(name));
      return alias ? `${alias}.com` : hostname;
    } catch {
      // ignore
    }
  }

  return "";
}
