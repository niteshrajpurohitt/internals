import crypto from "crypto";
import type { NextRequest } from "next/server";

/**
 * Constant-time comparison to prevent timing attacks when verifying administrative secrets.
 */
export function isTimingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Checks `Authorization: Bearer <secret>`.
 * The secret is intentionally NOT accepted as a `?secret=` query parameter:
 * URLs are written to access logs, proxies and browser history.
 */
export function hasValidBearerSecret(req: NextRequest, secret: string): boolean {
  const authHeader = req.headers.get("authorization");
  const provided = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  return Boolean(provided && isTimingSafeMatch(provided, secret));
}

const PAGE_SIZE = 1000;

/**
 * Reads every row of a query page by page. PostgREST caps a single response at
 * 1000 rows, so a plain `select()` silently returns a truncated list.
 * `fetchPage` must apply a stable `.order()` so pages do not overlap.
 */
export async function fetchAllRows<T>(
  fetchPage: (
    from: number,
    to: number
  ) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
): Promise<{ rows: T[]; error: string | null }> {
  const rows: T[] = [];
  for (let page = 0; ; page++) {
    const { data, error } = await fetchPage(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) return { rows, error: error.message };
    if (!data || data.length === 0) break;
    rows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
  }
  return { rows, error: null };
}
