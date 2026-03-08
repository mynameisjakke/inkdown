import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock the Upstash modules before importing checkRateLimit
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    // Mock Redis client methods if needed
  })),
}))

vi.mock('@upstash/ratelimit', () => {
  const mockLimiters = new Map<string, { count: number; resetTime: number }>()
  
  const RatelimitMock = vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockImplementation(async (identifier: string) => {
      const now = Date.now()
      const state = mockLimiters.get(identifier) || { count: 0, resetTime: now + 600000 }
      
      // Reset if time window has passed
      if (now >= state.resetTime) {
        state.count = 0
        state.resetTime = now + 600000
      }
      
      state.count++
      mockLimiters.set(identifier, state)
      
      const success = state.count <= 10
      const remaining = Math.max(0, 10 - state.count)
      
      return {
        success,
        limit: 10,
        remaining,
        reset: state.resetTime,
      }
    }),
  })) as unknown as {
    new (): { limit: (identifier: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }> }
    slidingWindow: (requests: number, window: string) => string
  }
  
  // Add static method
  RatelimitMock.slidingWindow = vi.fn().mockReturnValue('sliding-window-limiter') as unknown as (requests: number, window: string) => string
  
  return {
    Ratelimit: RatelimitMock,
  }
})

import { checkRateLimit } from '@/lib/rate-limit'

describe('Rate limiting', () => {
  beforeEach(() => {
    // Set up test environment variables
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should allow requests within limit', async () => {
    const identifier = `test-${Date.now()}-${Math.random()}`
    
    const result = await checkRateLimit(identifier)
    
    expect(result.success).toBe(true)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBeGreaterThanOrEqual(0)
    expect(result.reset).toBeGreaterThan(Date.now())
  })

  it('should return correct remaining count', async () => {
    const identifier = `test-${Date.now()}-${Math.random()}`
    
    const firstResult = await checkRateLimit(identifier)
    const secondResult = await checkRateLimit(identifier)
    
    expect(firstResult.remaining).toBeGreaterThan(secondResult.remaining)
    expect(secondResult.remaining).toBe(firstResult.remaining - 1)
  })

  it('should block requests exceeding limit', async () => {
    const identifier = `test-${Date.now()}-${Math.random()}`
    
    // Make 10 requests to hit the limit
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(identifier)
    }
    
    // 11th request should be blocked
    const result = await checkRateLimit(identifier)
    
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should have reset timestamp in the future', async () => {
    const identifier = `test-${Date.now()}-${Math.random()}`
    
    const result = await checkRateLimit(identifier)
    const now = Date.now()
    
    expect(result.reset).toBeGreaterThan(now)
    // Reset should be within 10 minutes (600000ms) + some buffer
    expect(result.reset).toBeLessThan(now + 700000)
  })
})
