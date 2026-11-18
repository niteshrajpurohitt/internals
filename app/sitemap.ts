import type { MetadataRoute } from "next";
import { getCompanies } from "@/lib/supabase";
import { TOPIC_CATEGORIES, categoryToSlug } from "@/lib/feed-filters";

// Regenerated at most once a day; new companies appear without a redeploy.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://internals.niteshrajpurohit.in";
  const now = new Date();

  const categoryPages: MetadataRoute.Sitemap = TOPIC_CATEGORIES.map((category) => ({
    url: `${baseUrl}/category/${categoryToSlug(category)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // If the database is unreachable, still serve the static part of the sitemap.
  const companies = await getCompanies({ minPosts: 2 }).catch((err) => {
    console.warn("[sitemap] getCompanies failed:", err);
    return [];
  });
  const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${baseUrl}/company/${company.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...categoryPages,
    ...companyPages,
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
