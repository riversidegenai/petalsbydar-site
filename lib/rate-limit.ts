// Lightweight in-memory rate limiter. This is intentionally dependency-free
// (no Redis/Upstash) because the store is low-traffic and runs on Vercel; the
// goal is to blunt abuse — email/quota floods on /api/orders, card-testing on
// /api/payments, storage spam on /api/upload — not to be a distributed,
// perfectly-accurate limiter. Counters live per lambda instance, so a
// determined attacker hitting many cold instances gets a higher effective
// limit, but the common single-instance abuse case is covered. Swap in Upstash
// if/when traffic justifies it.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bound the map so a flood of distinct keys can't grow memory unboundedly.
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Fixed-window rate limit. Returns ok:false once `limit` requests for `key`
 * have been seen within `windowMs`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (buckets.size >= MAX_KEYS) {
      // Evict expired entries before inserting a new key under pressure.
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/** Best-effort client IP from standard proxy headers (Vercel sets these). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Convenience wrapper: enforce a limit for a named route + the request IP.
 * Returns a 429 NextResponse-ready payload when blocked, or null when allowed.
 */
export function checkRateLimit(
  req: Request,
  route: string,
  limit: number,
  windowMs: number,
): { blocked: true; retryAfterSeconds: number } | { blocked: false } {
  const now = Date.now();
  const result = rateLimit(`${route}:${clientIp(req)}`, limit, windowMs, now);
  if (!result.ok) {
    return { blocked: true, retryAfterSeconds: result.retryAfterSeconds };
  }
  return { blocked: false };
}
