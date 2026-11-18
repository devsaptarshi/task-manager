/**
 * Fixed-window rate limiter, held in memory for the life of the serverless
 * instance. It is NOT distributed — on Vercel each warm instance has its own
 * counters, and a cold start resets them. That makes it a soft limit, not a
 * hard guarantee: good enough to blunt casual brute-forcing and runaway AI
 * cost from a single client, not a substitute for a shared store (Upstash
 * Redis, etc.) under real multi-instance traffic. Documented, not hidden.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

// Evict stale buckets occasionally so this map doesn't grow unbounded over
// the lifetime of a long-lived instance.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
