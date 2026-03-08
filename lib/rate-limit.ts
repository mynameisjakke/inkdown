import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis | null = null
let pdfRateLimit: Ratelimit | null = null

function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return redis
}

function getRateLimiter(): Ratelimit {
  if (!pdfRateLimit) {
    // 10 PDF exports per 10 minutes per IP
    pdfRateLimit = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(10, '10 m'),
      analytics: true,
      prefix: 'ratelimit:pdf',
    })
  }
  return pdfRateLimit
}

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const limiter = getRateLimiter()
  const { success, limit, remaining, reset } = await limiter.limit(identifier)
  return { success, limit, remaining, reset }
}
