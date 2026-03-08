import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Feature: phase-0-foundation-setup, Property 5: Rate Limit Response Headers
// Validates: Requirements 6.5

// Mock the dependencies before importing the route
vi.mock('@/lib/rate-limit')
vi.mock('@/lib/pdf')

import { POST } from '@/app/api/pdf/route'
import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { generatePDF } from '@/lib/pdf'

describe('Property 5: Rate Limit Response Headers', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env }
    
    // Set up valid environment for tests
    process.env.CONVEX_DEPLOYMENT = 'test-deployment'
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud'
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_12345'
    process.env.CLERK_SECRET_KEY = 'sk_test_12345'
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    process.env.PDFSHIFT_API_KEY = 'test-api-key'
    process.env.POLAR_ACCESS_TOKEN = 'polar_at_test'
    process.env.POLAR_WEBHOOK_SECRET = 'whsec_test'
    process.env.NODE_ENV = 'test'
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('should include valid rate limit headers in all responses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          html: fc.string({ minLength: 1, maxLength: 100 }),
          ip: fc.oneof(
            fc.ipV4(),
            fc.ipV6(),
            fc.constant('unknown')
          ),
          shouldExceedLimit: fc.boolean(),
          limit: fc.integer({ min: 1, max: 100 }),
          remaining: fc.integer({ min: 0, max: 100 }),
          resetTimestamp: fc.integer({ min: Math.floor(Date.now() / 1000), max: Math.floor(Date.now() / 1000) + 3600 }),
        }),
        async ({ html, ip, shouldExceedLimit, limit, remaining, resetTimestamp }) => {
          // Mock rate limit response
          vi.mocked(checkRateLimit).mockResolvedValue({
            success: !shouldExceedLimit,
            limit,
            remaining: shouldExceedLimit ? 0 : remaining,
            reset: resetTimestamp,
          })

          // Mock PDF generation
          vi.mocked(generatePDF).mockResolvedValue(Buffer.from('fake-pdf-content'))

          // Create request
          const request = new NextRequest('http://localhost:3000/api/pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-forwarded-for': ip,
            },
            body: JSON.stringify({ html }),
          })

          // Call the API route
          const response = await POST(request)

          // Verify rate limit headers are present
          const limitHeader = response.headers.get('X-RateLimit-Limit')
          const remainingHeader = response.headers.get('X-RateLimit-Remaining')
          const resetHeader = response.headers.get('X-RateLimit-Reset')

          // All headers must be present
          expect(limitHeader).not.toBeNull()
          expect(remainingHeader).not.toBeNull()
          expect(resetHeader).not.toBeNull()

          // All headers must be valid numbers
          const parsedLimit = Number(limitHeader)
          const parsedRemaining = Number(remainingHeader)
          const parsedReset = Number(resetHeader)

          expect(Number.isFinite(parsedLimit)).toBe(true)
          expect(Number.isFinite(parsedRemaining)).toBe(true)
          expect(Number.isFinite(parsedReset)).toBe(true)

          // Limit should be positive
          expect(parsedLimit).toBeGreaterThan(0)

          // Remaining should be non-negative
          expect(parsedRemaining).toBeGreaterThanOrEqual(0)

          // Reset should be a valid Unix timestamp (in seconds)
          expect(parsedReset).toBeGreaterThan(0)

          // Verify header values match what was returned by checkRateLimit
          expect(parsedLimit).toBe(limit)
          expect(parsedReset).toBe(resetTimestamp)

          // If rate limited, status should be 429 and remaining should be 0
          if (shouldExceedLimit) {
            expect(response.status).toBe(429)
            expect(parsedRemaining).toBe(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include rate limit headers even when request is invalid', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          invalidBody: fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(''),
            fc.record({ notHtml: fc.string() }),
            fc.integer(),
            fc.boolean()
          ),
          ip: fc.ipV4(),
          limit: fc.integer({ min: 1, max: 100 }),
          remaining: fc.integer({ min: 0, max: 100 }),
          resetTimestamp: fc.integer({ min: Math.floor(Date.now() / 1000), max: Math.floor(Date.now() / 1000) + 3600 }),
        }),
        async ({ invalidBody, ip, limit, remaining, resetTimestamp }) => {
          // Mock rate limit to allow request
          vi.mocked(checkRateLimit).mockResolvedValue({
            success: true,
            limit,
            remaining,
            reset: resetTimestamp,
          })

          // Create request with invalid body
          const request = new NextRequest('http://localhost:3000/api/pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-forwarded-for': ip,
            },
            body: JSON.stringify(invalidBody),
          })

          // Call the API route
          const response = await POST(request)

          // Verify rate limit headers are present even for invalid requests
          const limitHeader = response.headers.get('X-RateLimit-Limit')
          const remainingHeader = response.headers.get('X-RateLimit-Remaining')
          const resetHeader = response.headers.get('X-RateLimit-Reset')

          expect(limitHeader).not.toBeNull()
          expect(remainingHeader).not.toBeNull()
          expect(resetHeader).not.toBeNull()

          // Verify they are valid numbers
          expect(Number.isFinite(Number(limitHeader))).toBe(true)
          expect(Number.isFinite(Number(remainingHeader))).toBe(true)
          expect(Number.isFinite(Number(resetHeader))).toBe(true)

          // Should return 400 for invalid request
          expect(response.status).toBe(400)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include rate limit headers for rate-limited requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          html: fc.string({ minLength: 1 }),
          ip: fc.ipV4(),
          limit: fc.integer({ min: 1, max: 100 }),
          resetTimestamp: fc.integer({ min: Math.floor(Date.now() / 1000), max: Math.floor(Date.now() / 1000) + 3600 }),
        }),
        async ({ html, ip, limit, resetTimestamp }) => {
          // Mock rate limit to exceed limit
          vi.mocked(checkRateLimit).mockResolvedValue({
            success: false,
            limit,
            remaining: 0,
            reset: resetTimestamp,
          })

          // Create request
          const request = new NextRequest('http://localhost:3000/api/pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-forwarded-for': ip,
            },
            body: JSON.stringify({ html }),
          })

          // Call the API route
          const response = await POST(request)

          // Verify rate limit headers are present
          const limitHeader = response.headers.get('X-RateLimit-Limit')
          const remainingHeader = response.headers.get('X-RateLimit-Remaining')
          const resetHeader = response.headers.get('X-RateLimit-Reset')

          expect(limitHeader).not.toBeNull()
          expect(remainingHeader).not.toBeNull()
          expect(resetHeader).not.toBeNull()

          // Verify values
          expect(Number(limitHeader)).toBe(limit)
          expect(Number(remainingHeader)).toBe(0)
          expect(Number(resetHeader)).toBe(resetTimestamp)

          // Should return 429
          expect(response.status).toBe(429)
        }
      ),
      { numRuns: 100 }
    )
  })
})
