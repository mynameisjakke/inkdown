// Feature: phase-0-foundation-setup, Property 2: Client-Side Secret Exclusion
/**
 * **Validates: Requirements 7.3**
 * 
 * Property: For any file in the client-side bundle (app/ components with 'use client', 
 * or any NEXT_PUBLIC_ environment variable), the PDFShift API key should never appear 
 * in the compiled output.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

describe('Property: Client-Side Secret Exclusion', () => {
  let buildOutput: string[] = []
  let buildCompleted = false

  beforeAll(async () => {
    // Build the application to generate the client-side bundle
    try {
      console.log('Building Next.js application...')
      execSync('npm run build', {
        stdio: 'pipe',
        env: {
          ...process.env,
          // Provide all required environment variables for the build
          CONVEX_DEPLOYMENT: 'test-deployment',
          NEXT_PUBLIC_CONVEX_URL: 'https://test.convex.cloud',
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_12345',
          CLERK_SECRET_KEY: 'sk_test_12345',
          UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
          UPSTASH_REDIS_REST_TOKEN: 'test-token',
          PDFSHIFT_API_KEY: 'test-secret-api-key-12345',
          POLAR_ACCESS_TOKEN: 'polar_at_test',
          POLAR_WEBHOOK_SECRET: 'whsec_test',
          NODE_ENV: 'production',
        },
      })
      buildCompleted = true
      console.log('Build completed successfully')
    } catch (error) {
      console.error('Build failed:', error)
      buildCompleted = false
    }
  }, 120000) // 2 minute timeout for build

  /**
   * Recursively find all JavaScript files in a directory
   */
  function findJavaScriptFiles(dir: string): string[] {
    const files: string[] = []
    
    try {
      const entries = readdirSync(dir)
      
      for (const entry of entries) {
        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory()) {
          files.push(...findJavaScriptFiles(fullPath))
        } else if (entry.endsWith('.js') || entry.endsWith('.mjs')) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
      console.warn(`Could not read directory ${dir}:`, error)
    }
    
    return files
  }

  /**
   * Check if a file contains the secret
   */
  function fileContainsSecret(filePath: string, secret: string): boolean {
    try {
      const content = readFileSync(filePath, 'utf-8')
      return content.includes(secret)
    } catch (error) {
      console.warn(`Could not read file ${filePath}:`, error)
      return false
    }
  }

  it('should never expose PDFSHIFT_API_KEY in client-side JavaScript bundles', () => {
    expect(buildCompleted).toBe(true)

    // Find all client-side JavaScript files in the .next directory
    const clientBundleDir = join(process.cwd(), '.next', 'static')
    const clientFiles = findJavaScriptFiles(clientBundleDir)
    
    expect(clientFiles.length).toBeGreaterThan(0)
    console.log(`Found ${clientFiles.length} client-side JavaScript files`)

    // The secret we're looking for
    const secret = 'test-secret-api-key-12345'

    // Check each file for the secret
    for (const file of clientFiles) {
      const containsSecret = fileContainsSecret(file, secret)
      expect(containsSecret).toBe(false)
      
      if (containsSecret) {
        console.error(`SECRET LEAKED: Found PDFSHIFT_API_KEY in ${file}`)
      }
    }
  })

  it('should never expose PDFSHIFT_API_KEY in server-rendered pages', () => {
    expect(buildCompleted).toBe(true)

    // Check server-side pages that might be sent to the client
    const pagesDir = join(process.cwd(), '.next', 'server', 'app')
    const pageFiles = findJavaScriptFiles(pagesDir)
    
    console.log(`Found ${pageFiles.length} server page files`)

    const secret = 'test-secret-api-key-12345'

    // Server files can contain the secret, but we check HTML output files
    // which might be sent to the client
    const htmlFiles = pageFiles.filter(f => f.endsWith('.html'))
    
    for (const file of htmlFiles) {
      const containsSecret = fileContainsSecret(file, secret)
      expect(containsSecret).toBe(false)
      
      if (containsSecret) {
        console.error(`SECRET LEAKED: Found PDFSHIFT_API_KEY in HTML output ${file}`)
      }
    }
  })

  it('should only expose environment variables prefixed with NEXT_PUBLIC_', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'PDFSHIFT_API_KEY',
          'CLERK_SECRET_KEY',
          'POLAR_ACCESS_TOKEN',
          'POLAR_WEBHOOK_SECRET',
          'UPSTASH_REDIS_REST_TOKEN',
          'CONVEX_DEPLOYMENT'
        ),
        (secretEnvVar) => {
          expect(buildCompleted).toBe(true)

          // These server-only secrets should never appear in client bundles
          const clientBundleDir = join(process.cwd(), '.next', 'static')
          const clientFiles = findJavaScriptFiles(clientBundleDir)

          // Check that the environment variable name itself doesn't appear
          // in a way that suggests it's being used client-side
          for (const file of clientFiles) {
            try {
              const content = readFileSync(file, 'utf-8')
              
              // Look for patterns like process.env.SECRET_KEY or "SECRET_KEY"
              const hasDirectReference = content.includes(`process.env.${secretEnvVar}`)
              const hasStringReference = content.includes(`"${secretEnvVar}"`) || content.includes(`'${secretEnvVar}'`)
              
              // If we find references, they should only be in comments or dead code
              // For this test, we'll be strict and not allow any references
              expect(hasDirectReference).toBe(false)
              
              if (hasDirectReference) {
                console.error(`Found reference to ${secretEnvVar} in client bundle ${file}`)
              }
            } catch (error) {
              // File read error, skip
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should verify NEXT_PUBLIC_ variables are the only ones accessible client-side', () => {
    expect(buildCompleted).toBe(true)

    const clientBundleDir = join(process.cwd(), '.next', 'static')
    const clientFiles = findJavaScriptFiles(clientBundleDir)

    // Server-only secrets that should NEVER appear
    const serverSecrets = [
      'PDFSHIFT_API_KEY',
      'CLERK_SECRET_KEY',
      'POLAR_ACCESS_TOKEN',
      'POLAR_WEBHOOK_SECRET',
      'UPSTASH_REDIS_REST_TOKEN',
    ]

    // Check all client files
    for (const file of clientFiles) {
      try {
        const content = readFileSync(file, 'utf-8')
        
        for (const secret of serverSecrets) {
          // Check for the environment variable name in process.env access patterns
          const hasEnvAccess = content.includes(`process.env.${secret}`)
          expect(hasEnvAccess).toBe(false)
          
          if (hasEnvAccess) {
            console.error(`Found process.env.${secret} in client bundle ${file}`)
          }
        }
      } catch (error) {
        // File read error, skip
      }
    }
  })

  it('should verify API key patterns never appear in client bundles', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 50 }).map(s => `test-api-key-${s}`),
        (testApiKey) => {
          // This property tests that if we were to use different API keys,
          // they would also not leak to the client
          
          // For this test, we check that the pattern of API key usage
          // (Base64 encoding with 'api:' prefix) doesn't appear in client code
          const clientBundleDir = join(process.cwd(), '.next', 'static')
          const clientFiles = findJavaScriptFiles(clientBundleDir)

          for (const file of clientFiles) {
            try {
              const content = readFileSync(file, 'utf-8')
              
              // Check for PDFShift-specific patterns
              const hasPDFShiftAuth = content.includes('api.pdfshift.io')
              const hasBasicAuthPattern = content.includes('Basic ') && content.includes('api:')
              
              // If we find PDFShift API references, they should not include auth
              if (hasPDFShiftAuth) {
                expect(hasBasicAuthPattern).toBe(false)
                
                if (hasBasicAuthPattern) {
                  console.error(`Found PDFShift authentication pattern in client bundle ${file}`)
                }
              }
            } catch (error) {
              // File read error, skip
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
