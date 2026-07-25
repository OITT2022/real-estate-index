import { headers } from "next/headers";

/**
 * Simple in-memory sliding-window rate limiter for server actions.
 *
 * Single-instance only — fine for a single-container deploy, breaks if
 * the app scales horizontally. When that day arrives, replace the `buckets`
 * Map with an Upstash Ratelimit client; the call sites stay unchanged.
 */

type Window = { count: number; resetAt: number };
const buckets = new Map<string, Window>();

// Periodically drop expired entries so the Map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [k, w] of buckets) {
    if (w.resetAt <= now) buckets.delete(k);
  }
}, 60_000).unref?.();

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const w = buckets.get(key);
  if (!w || w.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (w.count >= limit) {
    return { allowed: false, retryAfterMs: w.resetAt - now };
  }
  w.count += 1;
  return { allowed: true };
}

/** Pull the client IP from the standard proxy headers; fall back to "unknown". */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xreal = h.get("x-real-ip");
  if (xreal) return xreal.trim();
  return "unknown";
}
