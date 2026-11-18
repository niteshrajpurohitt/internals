import { describe, expect, it } from "vitest";
import { interleavePostsByCompany } from "@/lib/feed-utils";
import type { PostWithCompany } from "@/lib/types";

function post(id: string, companyId: string): PostWithCompany {
  return {
    id,
    company_id: companyId,
    title: id,
    slug: id,
    source_url: `https://example.com/${id}`,
    summary: "",
    tags: [],
    read_time: "5 min read",
    published_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
  };
}

function maxRun(posts: PostWithCompany[]): number {
  let best = 0;
  let run = 0;
  for (let i = 0; i < posts.length; i++) {
    run = i > 0 && posts[i].company_id === posts[i - 1].company_id ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

describe("interleavePostsByCompany", () => {
  it("breaks up long runs from one company when others are available", () => {
    const input = [
      post("a1", "A"),
      post("a2", "A"),
      post("a3", "A"),
      post("a4", "A"),
      post("b1", "B"),
      post("b2", "B"),
      post("c1", "C"),
    ];
    const result = interleavePostsByCompany(input, 2);
    expect(maxRun(result)).toBeLessThanOrEqual(2);
  });

  it("keeps every post exactly once", () => {
    const input = ["A", "A", "A", "B", "A", "C", "A", "A"].map((c, i) => post(`p${i}`, c));
    const result = interleavePostsByCompany(input, 2);
    expect(result.map((p) => p.id).sort()).toEqual(input.map((p) => p.id).sort());
  });

  it("leaves short or already-mixed lists unchanged", () => {
    const mixed = [post("a", "A"), post("b", "B"), post("c", "A"), post("d", "B")];
    expect(interleavePostsByCompany(mixed, 2)).toEqual(mixed);
    const short = [post("a", "A"), post("b", "A")];
    expect(interleavePostsByCompany(short, 2)).toEqual(short);
  });

  it("appends leftovers when a single company has everything", () => {
    const input = ["A", "A", "A", "A"].map((c, i) => post(`p${i}`, c));
    expect(interleavePostsByCompany(input, 2).map((p) => p.id)).toEqual(["p0", "p1", "p2", "p3"]);
  });
});
