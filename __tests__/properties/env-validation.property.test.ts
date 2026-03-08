// Feature: phase-0-foundation-setup, Property 1: Environment Validation Fails Fast
/**
 * **Validates: Requirements 9.4**
 * 
 * Property: For any incomplete set of environment variables, when the validation 
 * function is called, the system should throw an error that clearly identifies 
 * which variables are missing or invalid.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { validateEnv } from '@/lib/env'

describe('Property: Environment Validation Fails Fast', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  const requiredEnvVars = [
    'CONVEX_DEPLOYMENT',
    'NEXT_PUBLIC_CONVEX_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'PDFSHIFT_API_KEY',
    'POLAR_ACCESS_TOKEN',
    'POLAR_WEBHOOK_SECRET',
  ] as const

  const validEnvValues: Record<string, string> = {
    CONVEX_DEPLOYMENT: 'test-deployment',
    NEXT_PUBLIC_CONVEX_URL: 'https://test.convex.cloud',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_12345',
    CLERK_SECRET_KEY: 'sk_test_12345',
    UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'test-token',
    PDFSHIFT_API_KEY: 'test-api-key',
    POLAR_ACCESS_TOKEN: 'polar_at_test',
    POLAR_WEBHOOK_SECRET: 'whsec_test',
    NODE_ENV: 'test',
  }

  it('should throw an error when any required environment variable is missing', () => {
    fc.assert(
      fc.property(
        fc.subarray([...requiredEnvVars], { minLength: 1, maxLength: requiredEnvVars.length }),
        (missingVars) => {
          // Set up environment with some variables missing
          process.env = { ...validEnvValues, NODE_ENV: 'test' } as NodeJS.ProcessEnv
          
          // Remove the selected variables
          missingVars.forEach(varName => {
            delete (process.env as Record<string, string | undefined>)[varName as string]
          })

          // Validation should throw
          expect(() => validateEnv()).toThrow()
          
          // Error message should mention environment validation failure
          try {
            validateEnv()
          } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect((error as Error).message).toContain('Environment variable validation failed')
            
            // Error should identify at least one of the missing variables
            const errorMessage = (error as Error).message
            const mentionsMissingVar = missingVars.some(varName => 
              errorMessage.includes(varName as string)
            )
            expect(mentionsMissingVar).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should throw an error when CLERK keys have invalid prefixes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }).filter(s => !s.startsWith('pk_') && s.trim().length > 0),
        fc.string({ minLength: 5, maxLength: 20 }).filter(s => !s.startsWith('sk_') && s.trim().length > 0),
        (invalidPublicKey, invalidSecretKey) => {
          // Set up environment with invalid Clerk keys
          process.env = {
            ...validEnvValues,
            NODE_ENV: 'test',
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: invalidPublicKey,
            CLERK_SECRET_KEY: invalidSecretKey,
          } as NodeJS.ProcessEnv

          // Validation should throw
          expect(() => validateEnv()).toThrow()
          
          // Error should mention the invalid keys
          try {
            validateEnv()
          } catch (error) {
            expect(error).toBeInstanceOf(Error)
            const errorMessage = (error as Error).message
            expect(errorMessage).toContain('Environment variable validation failed')
            
            // Should mention at least one of the Clerk keys
            const mentionsClerkKey = 
              errorMessage.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') ||
              errorMessage.includes('CLERK_SECRET_KEY')
            expect(mentionsClerkKey).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should throw an error when URL fields are invalid', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => {
          // Filter out valid URLs and whitespace-only strings
          if (s.trim().length === 0) return false
          try {
            new URL(s)
            return false
          } catch {
            return true
          }
        }),
        (invalidUrl) => {
          // Test with invalid CONVEX_URL
          process.env = {
            ...validEnvValues,
            NODE_ENV: 'test',
            NEXT_PUBLIC_CONVEX_URL: invalidUrl,
          } as NodeJS.ProcessEnv

          expect(() => validateEnv()).toThrow()
          
          try {
            validateEnv()
          } catch (error) {
            expect(error).toBeInstanceOf(Error)
            const errorMessage = (error as Error).message
            expect(errorMessage).toContain('Environment variable validation failed')
            expect(errorMessage).toContain('NEXT_PUBLIC_CONVEX_URL')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should throw an error when required string fields are empty', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredEnvVars),
        (varName) => {
          // Set up environment with one variable as empty string or undefined
          process.env = { ...validEnvValues, NODE_ENV: 'test' } as NodeJS.ProcessEnv
          delete (process.env as Record<string, string | undefined>)[varName]

          expect(() => validateEnv()).toThrow()
          
          try {
            validateEnv()
          } catch (error) {
            expect(error).toBeInstanceOf(Error)
            const errorMessage = (error as Error).message
            expect(errorMessage).toContain('Environment variable validation failed')
            expect(errorMessage).toContain(varName)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should succeed when all environment variables are valid', () => {
    // Set up complete valid environment
    process.env = { ...validEnvValues, NODE_ENV: 'test' } as NodeJS.ProcessEnv

    // Should not throw
    expect(() => validateEnv()).not.toThrow()
    
    // Should return parsed environment
    const env = validateEnv()
    expect(env).toBeDefined()
    expect(env.CONVEX_DEPLOYMENT).toBe('test-deployment')
    expect(env.CLERK_SECRET_KEY).toBe('sk_test_12345')
  })
})
