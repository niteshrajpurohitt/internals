import { describe, expect, it } from "vitest";
import {
  cleanHtmlSummary,
  cleanTitle,
  decodeHtmlEntities,
  detectCategories,
  DEFAULT_READ_TIME,
  estimateReadTime,
  generateSlug,
  isDisqualifiedByVeto,
  isTechnicalEngineeringArticle,
} from "@/lib/rss";

// A realistic teaser summary so the "empty / too short summary" gate doesn't decide the result.
const TECH_SUMMARY =
  "We describe the architecture of our storage engine, how replication works across regions, and the latency we measured in production.";

describe("isDisqualifiedByVeto: marketing titles are rejected", () => {
  it.each([
    "Announcing our new AI assistant for enterprise teams",
    "Introducing Workers AI pricing",
    "What's new in Dashboards: monthly roundup",
    "Acme is now generally available on AWS Marketplace",
    "We raised a Series C funding round",
    "Join our webinar on cloud cost optimization",
    "Customer story: how Globex improved checkout conversion",
    "Black Friday deals on all plans",
    "v2.4.0",
    "Release v1.2 changelog",
    "Meet the team: our new London office",
    "Named a Leader in the Gartner Magic Quadrant",
  ])("vetoes %j", (title) => {
    expect(isDisqualifiedByVeto(title)).toBe(true);
  });
});

describe("isDisqualifiedByVeto: engineering titles are kept", () => {
  it.each([
    "How we built a globally distributed rate limiter",
    "How we scaled Postgres to 10 million queries per second",
    "How we migrated 2PB of data with zero downtime",
    "Under the hood of our query planner",
    "A deep dive into eBPF-based load balancing",
    "Postmortem: the March 12 control plane outage",
    "Incident review: DNS resolution failures",
    // Explicit engineering phrasing wins even when a loose veto word appears
    "How we built our partner integration platform",
    // Office-opening veto must not catch data-center infrastructure posts
    "Building a new data center network fabric",
  ])("keeps %j", (title) => {
    expect(isDisqualifiedByVeto(title)).toBe(false);
  });
});

describe("isTechnicalEngineeringArticle", () => {
  it("accepts a technical post with a real summary", () => {
    expect(
      isTechnicalEngineeringArticle("How we scaled our Kafka pipeline to 1M events per second", TECH_SUMMARY)
    ).toBe(true);
  });

  it("rejects a vetoed title even with a technical summary", () => {
    expect(isTechnicalEngineeringArticle("Announcing our new database product", TECH_SUMMARY)).toBe(false);
  });

  it("rejects an empty or placeholder summary", () => {
    expect(isTechnicalEngineeringArticle("Scaling distributed databases", "")).toBe(false);
    expect(isTechnicalEngineeringArticle("Scaling distributed databases", "No content.")).toBe(false);
  });

  it("rejects version-number titles", () => {
    expect(isTechnicalEngineeringArticle("3.2 is out with faster builds", TECH_SUMMARY)).toBe(false);
  });

  it("rejects boilerplate 'stay tuned' teasers", () => {
    expect(
      isTechnicalEngineeringArticle(
        "Database replication improvements",
        "We have exciting replication updates coming soon to our database. Stay tuned for more."
      )
    ).toBe(false);
  });

  it("rejects a non-technical title with a non-technical summary", () => {
    expect(
      isTechnicalEngineeringArticle(
        "Our favourite moments from the summer picnic",
        "The whole team got together in the park for food, games and a lot of sunshine."
      )
    ).toBe(false);
  });
});

describe("detectCategories", () => {
  it("tags postmortems from the title", () => {
    expect(detectCategories("Postmortem: elevated error rates in us-east-1", "")).toContain("Postmortems");
  });

  it("tags an outage title as a postmortem only when the summary confirms it", () => {
    expect(
      detectCategories("The June 3 outage", "A root cause analysis of the cascading failure.")
    ).toContain("Postmortems");
    expect(detectCategories("Preventing outage risk with chaos testing", "We run game days.")).not.toContain(
      "Postmortems"
    );
  });

  it("preserves Classics and Postmortems tags that were already set", () => {
    const tags = detectCategories("Something unrelated", "", ["Classics", "Postmortem"]);
    expect(tags).toContain("Classics");
    expect(tags).toContain("Postmortems");
  });

  it("adds specific signal chips only when they are in the title", () => {
    expect(detectCategories("Writing our proxy in Rust", "")).toContain("Rust");
    expect(detectCategories("Writing our proxy", "We rewrote it in Rust.")).not.toContain("Rust");
  });

  it("never returns more than 4 tags", () => {
    const tags = detectCategories(
      "Postmortem: Rust eBPF Kubernetes GPU PostgreSQL Kafka outage",
      "root cause analysis",
      ["Classics"]
    );
    expect(tags.length).toBeLessThanOrEqual(4);
  });

  it("always returns at least one category", () => {
    expect(detectCategories("Untitled", "").length).toBeGreaterThan(0);
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes named, decimal and hex entities", () => {
    expect(decodeHtmlEntities("Tom &amp; Jerry &#8212; &#x27;hi&#x27; &hellip;")).toBe("Tom & Jerry — 'hi' …");
  });

  it("decodes in a single pass (double-encoded text stays encoded once)", () => {
    expect(decodeHtmlEntities("&amp;lt;div&amp;gt;")).toBe("&lt;div&gt;");
  });

  it("decodes astral code points such as emoji", () => {
    expect(decodeHtmlEntities("&#128640;")).toBe("🚀");
  });

  it("leaves unknown or out-of-range entities alone", () => {
    expect(decodeHtmlEntities("&bogus; &#99999999;")).toBe("&bogus; &#99999999;");
  });
});

describe("cleanTitle", () => {
  it("strips a trailing site-name segment", () => {
    expect(cleanTitle("Scaling our edge network | Cloudflare")).toBe("Scaling our edge network");
    expect(cleanTitle("Building Turbopack - Vercel")).toBe("Building Turbopack");
    expect(cleanTitle("Sharding at scale — Stripe Engineering Blog")).toBe("Sharding at scale");
  });

  it("does not touch hyphenated words or mid-title dashes", () => {
    expect(cleanTitle("Re-engineering the build system")).toBe("Re-engineering the build system");
    expect(cleanTitle("Notes - Engineering lessons from 10 years")).toBe(
      "Notes - Engineering lessons from 10 years"
    );
  });

  it("never reduces a title to an empty string", () => {
    expect(cleanTitle("Engineering")).toBe("Engineering");
  });

  it("decodes entities", () => {
    expect(cleanTitle("Q&amp;A with our SRE team")).toBe("Q&A with our SRE team");
  });
});

describe("cleanHtmlSummary", () => {
  it("strips tags and keeps the first two sentences", () => {
    const html =
      "<p>First sentence about the system design.</p><p>Second sentence about tradeoffs.</p><p>Third one.</p>";
    expect(cleanHtmlSummary(html)).toBe(
      "First sentence about the system design. Second sentence about tradeoffs."
    );
  });

  it("caps long text at 280 characters", () => {
    const long = "word ".repeat(200);
    const result = cleanHtmlSummary(long);
    expect(result.length).toBeLessThanOrEqual(280);
    expect(result.endsWith("...")).toBe(true);
  });
});

describe("estimateReadTime", () => {
  it("uses the default for teaser-length text", () => {
    expect(estimateReadTime("A short teaser.")).toBe(DEFAULT_READ_TIME);
    expect(estimateReadTime("")).toBe(DEFAULT_READ_TIME);
  });

  it("estimates from word count at ~220 wpm for full articles", () => {
    expect(estimateReadTime("word ".repeat(2200))).toBe("10 min read");
  });

  it("caps very long articles at 60 minutes", () => {
    expect(estimateReadTime("word ".repeat(50000))).toBe("60 min read");
  });

  it("ignores HTML tags when counting words", () => {
    expect(estimateReadTime("<p>word</p> ".repeat(2200))).toBe("10 min read");
  });
});

describe("generateSlug", () => {
  it("lowercases, drops punctuation and hyphenates", () => {
    expect(generateSlug("How We Scaled Postgres: 10x Faster!")).toBe("how-we-scaled-postgres-10x-faster");
  });

  it("is at most 80 characters", () => {
    expect(generateSlug("a ".repeat(100)).length).toBeLessThanOrEqual(80);
  });
});
