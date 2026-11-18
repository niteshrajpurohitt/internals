import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Keeps the Supabase auth session fresh.
 *
 * Server Components cannot write cookies, so without this the access token in the
 * cookie expires (after ~1 hour) and server-side `getClaims()` treats a signed-in
 * user as logged out until the browser client refreshes it. Here we refresh the
 * token before rendering and write the new cookies onto both the request (so the
 * page sees them) and the response (so the browser stores them).
 */
export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Nothing to refresh if Supabase isn't configured or the visitor has no auth cookie
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!supabaseUrl || !supabaseAnonKey || !hasAuthCookie) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    });

    // Validates the session and refreshes it if expired (writes cookies via setAll)
    await supabase.auth.getClaims();
  } catch (err) {
    // Never block a page because auth refresh failed
    console.warn("[proxy] Supabase session refresh failed:", err);
  }

  return response;
}

export const config = {
  matcher: [
    // Pages only: skip API routes, the OAuth callback (it sets its own cookies),
    // Next.js internals, metadata files and static assets.
    "/((?!api/|auth/|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
