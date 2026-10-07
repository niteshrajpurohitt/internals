export interface Company {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  feed_url: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  source_url: string;
  summary: string;
  tags: string[];
  read_time: string;
  published_at: string;
  created_at: string;
}

export interface PostWithCompany extends Post {
  companies?: Company | null;
  company?: Company | null;
}

export type CategoryFilter =
  | "All"
  | "Classics"
  | "Postmortems"
  | "AI & Machine Learning"
  | "Distributed Systems"
  | "Databases & Storage"
  | "Infrastructure & Cloud"
  | "Low-Level & Compilers"
  | "Web & Platforms";

