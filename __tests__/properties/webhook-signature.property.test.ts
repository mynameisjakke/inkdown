import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { NextRequest } from 'next/server'

// Feature: phase-0-foundation-setup, Property 4: Webhook Signature Rejection
// **Validates: Requirements 8.5**
//
// For any webhook request without a valid signature, the webhook handler should
// return a 401 status code and not process the webhook payload.

describe('Property 4: Webhook Signature Rejection', () => {
  beforeEach(() => {
    // Set up required environment variables
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud'
    process.env.POLAR_WEBHOOK_SECRET = 'whsec_test_secret_12345'
  })

  it('should reject webhook requests with missing signatures', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          type: fc.constantFrom('subscription.created', 'subscription.updated', 'checkout.completed'),
          data: fc.record({
            id: fc.uuid(),
            customer_id: fc.uuid(),
            status: fc.constantFrom('active', 'canceled', 'past_due', 'trialing'),
          }),
        }),
        async (webhookPayload) => {
          // Import the route handler
          const { POST } = await import('@/app/api/webhooks/polar/route')

          // Create a request without a signature header
          const request = new NextRequest('http://localhost:3000/api/webhooks/polar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          })

          // Call the handler
          const response = await POST(request)

          // Verify 401 status
          expect(response.status).toBe(401)

          // Verify error message
          const body = await response.json()
          expect(body).toHaveProperty('error')
          expect(body.error).toMatch(/signature/i)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject webhook requests with invalid signatures', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          type: fc.constantFrom('subscription.created', 'subscription.updated', 'checkout.completed'),
          data: fc.record({
            id: fc.uuid(),
            customer_id: fc.uuid(),
            status: fc.constantFrom('active', 'canceled', 'past_due', 'trialing'),
          }),
        }),
        fc.string({ minLength: 10, maxLength: 100 }), // Invalid signature
        async (webhookPayload, invalidSignature) => {
          // Import the route handler
          const { POST } = await import('@/app/api/webhooks/polar/route')

          // Create a request with an invalid signature
          const request = new NextRequest('http://localhost:3000/api/webhooks/polar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'webhook-signature': invalidSignature,
            },
            body: JSON.stringify(webhookPayload),
          })

          // Call the handler
          const response = await POST(request)

          // Verify 401 status
          expect(response.status).toBe(401)

          // Verify error message
          const body = await response.json()
          expect(body).toHaveProperty('error')
          expect(body.error).toMatch(/signature|invalid/i)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject webhook requests with malformed signature formats', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          type: fc.constantFrom('subscription.created', 'subscription.updated', 'checkout.completed'),
          data: fc.record({
            id: fc.uuid(),
            customer_id: fc.uuid(),
            status: fc.constantFrom('active', 'canceled', 'past_due', 'trialing'),
          }),
        }),
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('invalid'),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('=')), // String without signature format
        ),
        async (webhookPayload, malformedSignature) => {
          // Import the route handler
          const { POST } = await import('@/app/api/webhooks/polar/route')

          // Create a request with a malformed signature
          const request = new NextRequest('http://localhost:3000/api/webhooks/polar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'webhook-signature': malformedSignature,
            },
            body: JSON.stringify(webhookPayload),
          })

          // Call the handler
          const response = await POST(request)

          // Verify 401 status
          expect(response.status).toBe(401)

          // Verify error message
          const body = await response.json()
          expect(body).toHaveProperty('error')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not process payload when signature verification fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          type: fc.constantFrom('subscription.created', 'subscription.updated', 'checkout.completed'),
          data: fc.record({
            id: fc.uuid(),
            customer_id: fc.uuid(),
            status: fc.constantFrom('active', 'canceled', 'past_due', 'trialing'),
          }),
        }),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (webhookPayload, invalidSignature) => {
          // We'll verify that the handler returns 401 before any processing
          // This is tested by ensuring the response is immediate and no side effects occur
          const { POST } = await import('@/app/api/webhooks/polar/route')

          const request = new NextRequest('http://localhost:3000/api/webhooks/polar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'webhook-signature': invalidSignature,
            },
            body: JSON.stringify(webhookPayload),
          })

          const response = await POST(request)

          // Verify rejection happens before any processing
          expect(response.status).toBe(401)
          
          // The handler should return immediately without processing
          const body = await response.json()
          expect(body).toHaveProperty('error')
          expect(body).not.toHaveProperty('received')
        }
      ),
      { numRuns: 100 }
    )
  })
})
