import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostCount, getPosts } from "@/lib/supabase";
import {
  CATEGORY_DESCRIPTIONS,
  TOPIC_CATEGORIES,
  categoryToSlug,
  slugToCategory,
} from "@/lib/feed-filters";
import { ListingPage } from "@/components/listing-page";
import { FollowButton } from "@/components/follow-button";

// Rebuilt in the background at most once an hour (the feed syncs every 6 hours).
export const revalidate = 3600;
// Only the known categories exist; anything else is a 404 without a database call.
export const dynamicParams = false;

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return TOPIC_CATEGORIES.map((category) => ({ slug: categoryToSlug(category) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = slugToCategory((await params).slug);
  if (!category) return {};

  const title = `${category} — Engineering Blog Posts | Internals`;
  const description = CATEGORY_DESCRIPTIONS[category];
  const path = `/category/${categoryToSlug(category)}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const category = slugToCategory((await params).slug);
  if (!category) notFound();

  const [posts, totalCount] = await Promise.all([
    getPosts({ offset: 0, limit: 30, category }).catch((err) => {
      console.warn(`[category/${category}] getPosts failed:`, err);
      return [];
    }),
    getPostCount({ category }).catch(() => 0),
  ]);

  const slug = categoryToSlug(category);

  return (
    <ListingPage
      eyebrow="Category"
      title={category}
      description={CATEGORY_DESCRIPTIONS[category]}
      posts={posts}
      totalCount={totalCount}
      browseHref={`/?category=${slug}`}
      action={<FollowButton target={{ kind: "category", category, label: category }} />}
      relatedTitle="Other categories"
      related={TOPIC_CATEGORIES.filter((c) => c !== category).map((c) => ({
        label: c,
        href: `/category/${categoryToSlug(c)}`,
      }))}
    />
  );
}
