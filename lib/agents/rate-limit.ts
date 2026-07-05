import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const memoryBuckets = new Map<string, { count: number; resetAt: number }>()

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const bucket = memoryBuckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs }
  }

  if (bucket.count >= limit) {
    return { success: false, limit, remaining: 0, reset: bucket.resetAt }
  }

  bucket.count += 1
  return {
    success: true,
    limit,
    remaining: limit - bucket.count,
    reset: bucket.resetAt,
  }
}

function getUpstashLimiter(limit: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const redis = new Redis({ url, token })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: "trackify:agents",
  })
}

const authenticatedChatLimiter = getUpstashLimiter(60, "1 h")
const publicFinnaLimiter = getUpstashLimiter(30, "1 h")

export async function checkAuthenticatedAgentRateLimit(
  userId: string
): Promise<RateLimitResult> {
  if (authenticatedChatLimiter) {
    const result = await authenticatedChatLimiter.limit(`user:${userId}`)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }
  return memoryRateLimit(`user:${userId}`, 60, 60 * 60 * 1000)
}

export async function checkPublicFinnaRateLimit(
  clientKey: string
): Promise<RateLimitResult> {
  if (publicFinnaLimiter) {
    const result = await publicFinnaLimiter.limit(`ip:${clientKey}`)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  }
  return memoryRateLimit(`ip:${clientKey}`, 30, 60 * 60 * 1000)
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip") ?? "unknown"
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  }
}
