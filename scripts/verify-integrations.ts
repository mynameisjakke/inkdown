#!/usr/bin/env tsx
/**
 * Verification script for Phase 0 service integrations
 * Tests each external service connection to ensure proper configuration
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { validateEnv } from '../lib/env'
import { checkRateLimit } from '../lib/rate-limit'
import { generatePDF } from '../lib/pdf'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green')
}

function logError(message: string) {
  log(`✗ ${message}`, 'red')
}

function logInfo(message: string) {
  log(`ℹ ${message}`, 'blue')
}

async function verifyEnvironmentVariables(): Promise<boolean> {
  logInfo('Verifying environment variables...')
  try {
    validateEnv()
    logSuccess('All environment variables are valid')
    return true
  } catch (error) {
    logError('Environment variable validation failed')
    if (error instanceof Error) {
      console.error(error.message)
    }
    return false
  }
}

async function verifyConvex(): Promise<boolean> {
  logInfo('Verifying Convex connection...')
  try {
    const env = validateEnv()
    
    // Check that Convex URL is accessible
    const response = await fetch(env.NEXT_PUBLIC_CONVEX_URL)
    
    if (response.ok || response.status === 404) {
      // 404 is expected for the root URL, it means the service is reachable
      logSuccess('Convex connection successful')
      logInfo(`  Deployment: ${env.CONVEX_DEPLOYMENT}`)
      logInfo(`  URL: ${env.NEXT_PUBLIC_CONVEX_URL}`)
      return true
    } else {
      logError(`Convex connection failed with status ${response.status}`)
      return false
    }
  } catch (error) {
    logError('Convex connection failed')
    if (error instanceof Error) {
      console.error(`  ${error.message}`)
    }
    return false
  }
}

async function verifyClerk(): Promise<boolean> {
  logInfo('Verifying Clerk configuration...')
  try {
    const env = validateEnv()
    
    // Verify key formats
    if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
      logError('Clerk publishable key has invalid format')
      return false
    }
    
    if (!env.CLERK_SECRET_KEY.startsWith('sk_')) {
      logError('Clerk secret key has invalid format')
      return false
    }
    
    logSuccess('Clerk configuration is valid')
    logInfo('  Note: Full authentication test requires running dev server')
    return true
  } catch (error) {
    logError('Clerk configuration check failed')
    if (error instanceof Error) {
      console.error(`  ${error.message}`)
    }
    return false
  }
}

async function verifyUpstashRedis(): Promise<boolean> {
  logInfo('Verifying Upstash Redis connection...')
  try {
    const testIdentifier = `test-${Date.now()}`
    const result = await checkRateLimit(testIdentifier)
    
    logSuccess('Upstash Redis connection successful')
    logInfo(`  Limit: ${result.limit}`)
    logInfo(`  Remaining: ${result.remaining}`)
    return true
  } catch (error) {
    logError('Upstash Redis connection failed')
    if (error instanceof Error) {
      console.error(`  ${error.message}`)
    }
    return false
  }
}

async function verifyPDFShift(): Promise<boolean> {
  logInfo('Verifying PDFShift API...')
  try {
    const testHTML = '<html><body><h1>Test PDF</h1><p>This is a test document.</p></body></html>'
    
    const pdf = await generatePDF({
      html: testHTML,
      format: 'A4',
    })
    
    if (pdf && pdf.length > 0) {
      logSuccess('PDFShift API connection successful')
      logInfo(`  Generated PDF size: ${(pdf.length / 1024).toFixed(2)} KB`)
      return true
    } else {
      logError('PDFShift API returned empty response')
      return false
    }
  } catch (error) {
    logError('PDFShift API connection failed')
    if (error instanceof Error) {
      console.error(`  ${error.message}`)
    }
    return false
  }
}

async function verifyPolar(): Promise<boolean> {
  logInfo('Verifying Polar configuration...')
  try {
    const env = validateEnv()
    
    // Verify token format
    if (!env.POLAR_ACCESS_TOKEN.startsWith('polar_')) {
      logError('Polar access token has invalid format')
      return false
    }
    
    if (!env.POLAR_WEBHOOK_SECRET.startsWith('polar_')) {
      logError('Polar webhook secret has invalid format')
      return false
    }
    
    logSuccess('Polar configuration is valid')
    logInfo('  Note: Webhook test requires manual trigger from Polar dashboard')
    return true
  } catch (error) {
    logError('Polar configuration check failed')
    if (error instanceof Error) {
      console.error(`  ${error.message}`)
    }
    return false
  }
}

async function main() {
  log('\n=== Phase 0 Service Integration Verification ===\n', 'blue')
  
  const results = {
    env: await verifyEnvironmentVariables(),
    convex: false,
    clerk: false,
    redis: false,
    pdfshift: false,
    polar: false,
  }
  
  // Only proceed with service checks if env vars are valid
  if (results.env) {
    console.log()
    results.convex = await verifyConvex()
    console.log()
    results.clerk = await verifyClerk()
    console.log()
    results.redis = await verifyUpstashRedis()
    console.log()
    results.pdfshift = await verifyPDFShift()
    console.log()
    results.polar = await verifyPolar()
  }
  
  // Summary
  console.log()
  log('=== Verification Summary ===', 'blue')
  const allPassed = Object.values(results).every(r => r === true)
  
  if (allPassed) {
    log('\n✓ All service integrations verified successfully!\n', 'green')
    process.exit(0)
  } else {
    log('\n✗ Some service integrations failed verification\n', 'red')
    log('Failed checks:', 'yellow')
    Object.entries(results).forEach(([service, passed]) => {
      if (!passed) {
        log(`  - ${service}`, 'red')
      }
    })
    console.log()
    process.exit(1)
  }
}

main().catch((error) => {
  logError('Verification script failed')
  console.error(error)
  process.exit(1)
})
