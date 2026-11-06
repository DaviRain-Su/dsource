/**
 * Simple in-memory token bucket. Fine for a single-instance Apps host;
 * resets on cold start. No external deps.
 */
type Bucket = {
  tokens: number
  updatedAt: number
}

const buckets = new Map<string, Bucket>()

const MAX_KEYS = 5_000

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

export function rateLimit(
  key: string,
  opts: { capacity: number; refillPerSec: number; cost?: number } = {
    capacity: 20,
    refillPerSec: 20 / 60,
  },
): RateLimitResult {
  const now = Date.now()
  const cost = opts.cost ?? 1
  let bucket = buckets.get(key)
  if (!bucket) {
    if (buckets.size >= MAX_KEYS) {
      // Drop oldest ~10% when the map grows too large.
      const drop = Math.ceil(MAX_KEYS * 0.1)
      let i = 0
      for (const k of buckets.keys()) {
        buckets.delete(k)
        if (++i >= drop) break
      }
    }
    bucket = { tokens: opts.capacity, updatedAt: now }
    buckets.set(key, bucket)
  }

  const elapsed = (now - bucket.updatedAt) / 1000
  bucket.tokens = Math.min(opts.capacity, bucket.tokens + elapsed * opts.refillPerSec)
  bucket.updatedAt = now

  if (bucket.tokens < cost) {
    const need = cost - bucket.tokens
    const retryAfterSec = Math.max(1, Math.ceil(need / opts.refillPerSec))
    return { ok: false, remaining: 0, retryAfterSec }
  }

  bucket.tokens -= cost
  return { ok: true, remaining: Math.floor(bucket.tokens), retryAfterSec: 0 }
}

export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const real = request.headers.get("x-real-ip")?.trim()
  const ip = fwd || real || "unknown"
  return `${scope}:${ip}`
}

/** Admin write / draft-list budget: ~20 actions per minute, burst 10. */
export function limitAdminAction(request: Request): RateLimitResult {
  return rateLimit(clientKey(request, "admin"), {
    capacity: 10,
    refillPerSec: 20 / 60,
  })
}
