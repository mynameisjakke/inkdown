import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { validateEnv } from '@/lib/env'

describe('Environment validation', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should throw when CONVEX_DEPLOYMENT is missing', () => {
    delete process.env.CONVEX_DEPLOYMENT

    expect(() => validateEnv()).toThrow('Environment variable validation failed')
    expect(() => validateEnv()).toThrow('CONVEX_DEPLOYMENT')
  })

  it('should throw when CLERK_SECRET_KEY does not start with sk_', () => {
    process.env.CLERK_SECRET_KEY = 'invalid_key'

    expect(() => validateEnv()).toThrow('Environment variable validation failed')
    expect(() => validateEnv()).toThrow('CLERK_SECRET_KEY must start with sk_')
  })

  it('should throw when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY does not start with pk_', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'invalid_key'

    expect(() => validateEnv()).toThrow('Environment variable validation failed')
    expect(() => validateEnv()).toThrow('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_')
  })

  it('should succeed with all valid variables', () => {
    process.env = {
      ...process.env,
      CONVEX_DEPLOYMENT: 'test-deployment',
      NEXT_PUBLIC_CONVEX_URL: 'https://test.convex.cloud',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      CLERK_SECRET_KEY: 'sk_test_123',
      UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
      PDFSHIFT_API_KEY: 'test-api-key',
      POLAR_ACCESS_TOKEN: 'test-access-token',
      POLAR_WEBHOOK_SECRET: 'test-webhook-secret',
      NODE_ENV: 'test',
    }

    expect(() => validateEnv()).not.toThrow()
    const env = validateEnv()
    expect(env.CONVEX_DEPLOYMENT).toBe('test-deployment')
    expect(env.CLERK_SECRET_KEY).toBe('sk_test_123')
  })
})
