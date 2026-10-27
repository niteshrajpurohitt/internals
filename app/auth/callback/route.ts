import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // 1. Sanitize 'next' redirect target to prevent Open Redirect attacks
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    next = "/";
  }

  // 2. Determine safe redirect origin (prevent Host Header Poisoning)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const requestHost = request.headers.get("host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const configuredHost = process.env.NEXT_PUBLIC_SITE_URL
    ? (() => {
        try {
          return new URL(process.env.NEXT_PUBLIC_SITE_URL).host;
        } catch {
          return null;
        }
      })()
    : null;

  let targetOrigin = origin;
  if (!isLocalEnv && forwardedHost) {
    // Only trust forwarded host if it matches request host or configured site URL
    if (forwardedHost === requestHost || (configuredHost && forwardedHost === configuredHost)) {
      targetOrigin = `https://${forwardedHost}`;
    }
  }

  const redirectTarget = `${targetOrigin}${next}`;

  if (code) {
    // 1. Create the redirect response object FIRST
    const response = NextResponse.redirect(redirectTarget);

    // 2. Initialize Supabase SSR client directly wired to this redirect response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Directly write every auth cookie onto the outgoing redirect response
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // 3. Exchange the temporary code for active user session tokens
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }

    console.error("Supabase OAuth code exchange error:", error.message);
  }

  return NextResponse.redirect(`${origin}?auth_error=true`);
}

