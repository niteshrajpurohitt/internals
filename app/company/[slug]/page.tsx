import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanies, getPosts } from "@/lib/supabase";
import type { Company } from "@/lib/types";
import { ListingPage } from "@/components/listing-page";
import { FollowButton } from "@/components/follow-button";

// Rebuilt in the background at most once an hour (the feed syncs every 6 hours).
export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

// Same threshold as the feed's company selector: no thin pages for 0–1 posts.
const MIN_POSTS = 2;

// Deduplicated per request: metadata, the page and the "other blogs" list share one query.
const getListedCompanies = cache(() =>
  getCompanies({ minPosts: MIN_POSTS }).catch(() => [] as Company[])
);

async function findCompany(slug: string): Promise<Company | null> {
  const companies = await getListedCompanies();
  const wanted = slug.toLowerCase();
  return companies.find((c) => c.slug.toLowerCase() === wanted) ?? null;
}

export async function generateStaticParams() {
  const companies = await getListedCompanies();
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const company = await findCompany((await params).slug);
  if (!company) return {};

  const title = `${company.name} Engineering Blog — Technical Posts | Internals`;
  const description = `Technical articles from the ${company.name} engineering team, filtered from product news and marketing. ${company.post_count ?? 0} posts, each linking to the original.`;
  const path = `/company/${company.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
  };
}

export default async function CompanyPage({ params }: { params: Params }) {
  const company = await findCompany((await params).slug);
  if (!company) notFound();

  const posts = await getPosts({ offset: 0, limit: 30, companyId: company.id }).catch((err) => {
    console.warn(`[company/${company.slug}] getPosts failed:`, err);
    return [];
  });

  const others = await getListedCompanies();

  return (
    <ListingPage
      eyebrow="Engineering blog"
      title={company.name}
      description={`Technical writing from the ${company.name} engineering team: architecture, infrastructure and production lessons, with release notes and marketing filtered out. Every post links straight to the original.`}
      posts={posts}
      totalCount={company.post_count ?? posts.length}
      browseHref={`/?company=${encodeURIComponent(company.slug)}`}
      externalUrl={/^https?:\/\//i.test(company.website_url) ? company.website_url : undefined}
      action={
        <FollowButton target={{ kind: "company", companyId: company.id, label: company.name }} />
      }
      relatedTitle="Other engineering blogs"
      related={others
        .filter((c) => c.id !== company.id)
        .map((c) => ({ label: c.name, href: `/company/${c.slug}` }))}
    />
  );
}
