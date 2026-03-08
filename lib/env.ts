import { z } from 'zod'

const envSchema = z.object({
  // Convex
  CONVEX_DEPLOYMENT: z.string().min(1, 'CONVEX_DEPLOYMENT is required'),
  NEXT_PUBLIC_CONVEX_URL: z.string().url('NEXT_PUBLIC_CONVEX_URL must be a valid URL'),
  
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .startsWith('pk_', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_'),
  CLERK_SECRET_KEY: z
    .string()
    .startsWith('sk_', 'CLERK_SECRET_KEY must start with sk_'),
  
  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
  
  // PDFShift
  PDFSHIFT_API_KEY: z.string().min(1, 'PDFSHIFT_API_KEY is required'),
  
  // Polar
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map(e => {
          const path = e.path.join('.')
          const message = e.message
          return `  - ${path}: ${message}`
        })
        .join('\n')
      
      throw new Error(
        `Environment variable validation failed:\n${issues}\n\n` +
        `Please check your .env.local file and ensure all required variables are set correctly.`
      )
    }
    throw error
  }
}
