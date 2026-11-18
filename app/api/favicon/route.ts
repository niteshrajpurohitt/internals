import { NextRequest, NextResponse } from "next/server";
import { BRAND_DOMAINS, getCompanyDomain } from "@/lib/company-domain";
import { getCachedCompanies } from "@/lib/supabase";

const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
const STATIC_ALLOWED = new Set(Object.values(BRAND_DOMAINS));

/**
 * Only proxy icons for companies this site actually lists. Without this the route
 * is an open proxy that anyone can use (at our expense) for arbitrary domains.
 */
async function isAllowedDomain(domain: string): Promise<boolean> {
  if (STATIC_ALLOWED.has(domain)) return true;
  try {
    const companies = await getCachedCompanies();
    return companies.some((c) => getCompanyDomain(c.website_url, c.slug) === domain);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain")?.trim().toLowerCase();

  if (!domain || domain.length > 253 || !DOMAIN_REGEX.test(domain)) {
    return new NextResponse(null, { status: 400 });
  }

  if (!(await isAllowedDomain(domain))) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const targetUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; InternalsFaviconProxy/1.0)",
      },
      // Don't let a slow upstream hold the function open
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status === 404 ? 404 : 502 });
    }

    // Only ever serve images from this route
    const contentType = response.headers.get("content-type") || "image/png";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return new NextResponse(null, { status: 502 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache at browser for 1 day, CDN/edge for 30 days, stale-while-revalidate for 7 days
        "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
