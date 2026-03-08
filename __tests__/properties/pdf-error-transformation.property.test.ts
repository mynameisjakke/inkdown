// Feature: phase-0-foundation-setup, Property 3: PDF Error Transformation
/**
 * **Validates: Requirements 7.5**
 * 
 * Property: For any error thrown by the PDFShift API, the PDF generation wrapper 
 * should catch it and throw a new error with a user-friendly message that does 
 * not expose internal API details.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { generatePDF } from '@/lib/pdf'

describe('Property: PDF Error Transformation', () => {
  let originalFetch: typeof global.fetch
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original fetch and environment
    originalFetch = global.fetch
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
  })

  afterEach(() => {
    // Restore original fetch and environment
    global.fetch = originalFetch
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('should never expose API endpoint URLs in error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        fc.string({ minLength: 20, maxLength: 200 }),
        async (statusCode, apiErrorMessage) => {
          global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            text: async () => apiErrorMessage,
          })

          try {
            await generatePDF({ html: '<h1>Test</h1>' })
            return false // Should have thrown
          } catch (error) {
            if (!(error instanceof Error)) return false
            const errorMessage = error.message

            // Should NOT expose API endpoint
            if (errorMessage.includes('api.pdfshift.io')) return false
            if (errorMessage.includes('/v3/convert')) return false
            if (errorMessage.includes('https://')) return false
            
            return true
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should never expose API keys or authorization headers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        fc.string({ minLength: 20, maxLength: 100 }),
        async (statusCode, errorBody) => {
          const apiKey = process.env.PDFSHIFT_API_KEY!
          const errorWithCredentials = `API Error: Invalid key ${apiKey} - ${errorBody}`
          
          global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            text: async () => errorWithCredentials,
          })

          try {
            await generatePDF({ html: '<h1>Test</h1>' })
            return false // Should have thrown
          } catch (error) {
            if (!(error instanceof Error)) return false
            const errorMessage = error.message

            // Should NEVER contain the API key
            if (errorMessage.includes(apiKey)) return false
            
            // Should NEVER contain authorization details
            if (errorMessage.includes('Authorization')) return false
            if (errorMessage.includes('Basic')) return false
            if (errorMessage.includes('api:')) return false
            
            return true
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should provide user-friendly messages for all HTTP error codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        async (statusCode) => {
          global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            text: async () => 'Internal API error with technical details',
          })

          try {
            await generatePDF({ html: '<h1>Test</h1>' })
            return false // Should have thrown
          } catch (error) {
            if (!(error instanceof Error)) return false
            const errorMessage = error.message.toLowerCase()

            // Should be user-friendly (contains common user-facing terms)
            const isUserFriendly = 
              errorMessage.includes('pdf') ||
              errorMessage.includes('try again') ||
              errorMessage.includes('service') ||
              errorMessage.includes('temporarily unavailable') ||
              errorMessage.includes('rate limit') ||
              errorMessage.includes('authentication')
            
            if (!isUserFriendly) return false
            
            // Should NOT contain internal technical details
            if (errorMessage.includes('internal api error')) return false
            
            return true
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should transform network errors without exposing error codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'ECONNREFUSED',
          'ETIMEDOUT',
          'ENOTFOUND',
          'ENETUNREACH',
          'ECONNRESET'
        ),
        async (errorCode) => {
          const networkError = new Error(`Network error: ${errorCode}`)
          ;(networkError as any).code = errorCode
          global.fetch = vi.fn().mockRejectedValue(networkError)

          try {
            await generatePDF({ html: '<h1>Test</h1>' })
            return false // Should have thrown
          } catch (error) {
            if (!(error instanceof Error)) return false
            const errorMessage = error.message

            // Should NOT expose network error codes
            if (errorMessage.includes(errorCode)) return false
            if (errorMessage.includes('ECONN')) return false
            if (errorMessage.includes('ETIME')) return false
            if (errorMessage.includes('ENET')) return false
            
            // Should be user-friendly
            const lowerMessage = errorMessage.toLowerCase()
            const isUserFriendly = 
              lowerMessage.includes('pdf') &&
              lowerMessage.includes('try again')
            
            return isUserFriendly
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle specific HTTP status codes with appropriate messages', async () => {
    const statusCodeTests = [
      { status: 401, expectedKeywords: ['authentication', 'failed'] },
      { status: 429, expectedKeywords: ['rate limit', 'exceeded'] },
      { status: 500, expectedKeywords: ['temporarily unavailable', 'try again later'] },
      { status: 502, expectedKeywords: ['temporarily unavailable', 'try again later'] },
      { status: 503, expectedKeywords: ['temporarily unavailable', 'try again later'] },
    ]

    for (const { status, expectedKeywords } of statusCodeTests) {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status,
        text: async () => 'Internal API error details that should not be exposed',
      })

      await expect(
        generatePDF({ html: '<h1>Test</h1>' })
      ).rejects.toThrow()

      try {
        await generatePDF({ html: '<h1>Test</h1>' })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        const errorMessage = (error as Error).message.toLowerCase()

        // Should contain at least one expected keyword
        const containsKeyword = expectedKeywords.some(keyword =>
          errorMessage.includes(keyword.toLowerCase())
        )
        expect(containsKeyword).toBe(true)

        // Should NOT contain internal API details
        expect(errorMessage).not.toContain('internal api error')
      }
    }
  })

  it('should handle response parsing errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        async (statusCode) => {
          global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            text: async () => {
              throw new Error('Failed to parse response body')
            },
          })

          try {
            await generatePDF({ html: '<h1>Test</h1>' })
            return false // Should have thrown
          } catch (error) {
            if (!(error instanceof Error)) return false
            const errorMessage = error.message.toLowerCase()

            // Should be user-friendly even when response parsing fails
            const isUserFriendly = 
              errorMessage.includes('pdf') ||
              errorMessage.includes('try again')
            
            if (!isUserFriendly) return false
            
            // Should NOT expose parsing error
            if (errorMessage.includes('failed to parse response body')) return false
            if (errorMessage.includes('parse')) return false
            
            return true
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
