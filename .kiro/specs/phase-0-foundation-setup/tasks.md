# Implementation Plan: Phase 0 Foundation Setup

## Overview

This plan establishes the complete technical foundation for Inkdown by configuring Next.js 15 with TypeScript, integrating six external services (Convex, Clerk, Upstash Redis, PDFShift, Polar, Vercel), and establishing automated CI/CD pipelines. Each task builds incrementally toward a production-ready deployment at inkdown.app.

## Tasks

- [x] 1. Initialize Next.js 15 project with TypeScript strict mode
  - Create new Next.js 15 project using `npx create-next-app@latest`
  - Enable TypeScript strict mode in tsconfig.json
  - Configure App Router architecture
  - Set up path aliases (@/* mapping)
  - Create .gitignore excluding node_modules, .next, .env.local, build artifacts
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [-] 2. Initialize Git repository and connect to GitHub
  - Initialize git repository with `git init`
  - Create GitHub repository for the project
  - Add remote origin pointing to GitHub repository
  - Create initial commit with conventional commit format: "chore: initialize Next.js 15 project"
  - Push to GitHub main branch
  - _Requirements: 2.1, 2.2, 2.5, 17.1_

- [ ] 3. Set up Vercel deployment and domain
  - Connect GitHub repository to Vercel
  - Configure inkdown.app domain in Vercel project settings
  - Verify automatic deployment on push to main
  - Confirm HTTPS with valid SSL certificate
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 4. Install and configure Convex database
  - Install convex npm package
  - Run `npx convex dev` to initialize Convex project
  - Create convex/schema.ts with users table definition
  - Add CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL to .env.local
  - Add same variables to Vercel environment settings
  - Deploy schema with `npx convex deploy`
  - Verify TypeScript types generation in convex/_generated/
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

- [ ] 5. Install and configure Clerk authentication
  - Install @clerk/nextjs npm package
  - Create Clerk application in dashboard
  - Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to .env.local
  - Add same variables to Vercel environment settings
  - Create middleware.ts with route protection for /archive
  - Create app/layout.tsx with ClerkProvider wrapper
  - Create components/providers/convex-clerk-provider.tsx for Convex-Clerk integration
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

- [ ] 6. Install and configure Upstash Redis for rate limiting
  - Install @upstash/redis and @upstash/ratelimit npm packages
  - Create Upstash Redis database in dashboard
  - Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
  - Add same variables to Vercel environment settings
  - Create lib/rate-limit.ts with rate limiting utility (10 requests per 10 minutes)
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 7. Create environment variable validation system
  - Install zod npm package
  - Create lib/env.ts with Zod schema for all environment variables
  - Implement validateEnv() function that fails fast with clear error messages
  - Add validation for all service credentials (Convex, Clerk, Upstash, PDFShift, Polar)
  - Create .env.local.example documenting all required variables
  - _Requirements: 9.1, 9.4, 9.5_

- [ ]* 7.1 Write property test for environment validation
  - **Property 1: Environment Validation Fails Fast**
  - **Validates: Requirements 9.4**
  - Test that validateEnv() throws clear errors for any incomplete environment variable set
  - Use fast-check to generate various combinations of missing/invalid variables
  - Verify error messages identify which variables are problematic

- [ ] 8. Set up PDFShift API integration
  - Create PDFShift account and obtain API key
  - Add PDFSHIFT_API_KEY to .env.local (server-side only)
  - Add same variable to Vercel environment settings
  - Create lib/pdf.ts with generatePDF() wrapper function
  - Implement error handling with user-friendly messages
  - Verify API key never appears in client-side bundle
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 8.1 Write property test for client-side secret exclusion
  - **Property 2: Client-Side Secret Exclusion**
  - **Validates: Requirements 7.3**
  - Build the application and analyze client-side bundle
  - Verify PDFSHIFT_API_KEY never appears in any client-side JavaScript
  - Test across different build configurations

- [ ]* 8.2 Write property test for PDF error transformation
  - **Property 3: PDF Error Transformation**
  - **Validates: Requirements 7.5**
  - Mock PDFShift API to throw various error types
  - Verify generatePDF() catches all errors and throws user-friendly messages
  - Ensure internal API details are never exposed in error messages

- [ ] 9. Set up Polar.sh payments integration
  - Install @polar-sh/sdk npm package
  - Create Polar.sh account and obtain access token
  - Add POLAR_ACCESS_TOKEN and POLAR_WEBHOOK_SECRET to .env.local
  - Add same variables to Vercel environment settings
  - Create app/api/webhooks/polar/route.ts with webhook handler
  - Implement signature verification using validateWebhookSignature
  - Handle subscription.created, subscription.updated, and checkout.completed events
  - Create convex/users.ts with updateSubscription and handleCheckout mutations
  - Register webhook URL in Polar dashboard
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ]* 9.1 Write property test for webhook signature rejection
  - **Property 4: Webhook Signature Rejection**
  - **Validates: Requirements 8.5**
  - Generate webhook requests with invalid/missing signatures
  - Verify handler returns 401 for all invalid signatures
  - Ensure payload is never processed without valid signature

- [ ] 10. Checkpoint - Verify all service integrations
  - Ensure all environment variables are set locally and in Vercel
  - Test Convex connection with a simple query
  - Test Clerk authentication by accessing /archive route
  - Test Upstash Redis connection with rate limit check
  - Test PDFShift API with sample HTML
  - Test Polar webhook with test event from dashboard
  - Ensure all tests pass, ask the user if questions arise

- [ ] 11. Install and configure Tailwind CSS
  - Install tailwindcss, postcss, and autoprefixer npm packages
  - Run `npx tailwindcss init -p` to create config files
  - Configure tailwind.config.ts with zinc palette and dark mode class strategy
  - Create app/globals.css with Tailwind directives and CSS variables
  - Add Tailwind classes to app/layout.tsx to verify setup
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 12. Install and configure shadcn/ui
  - Install shadcn/ui dependencies (class-variance-authority, clsx, tailwind-merge, tailwindcss-animate)
  - Create components.json with zinc base color and dark mode
  - Create lib/utils.ts with cn() utility function
  - Run `npx shadcn-ui@latest init` to complete setup
  - Verify components will be placed in components/ui/
  - _Requirements: 10.4, 10.6_

- [ ] 13. Install additional UI dependencies
  - Install framer-motion for animations
  - Install lucide-react for icons
  - Install @uiw/react-codemirror for code editing
  - Install @codemirror/lang-markdown for Markdown syntax highlighting
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 14. Set up Vitest test infrastructure
  - Install vitest, @vitejs/plugin-react, jsdom as dev dependencies
  - Install @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
  - Install fast-check for property-based testing
  - Create vitest.config.ts with jsdom environment and path aliases
  - Create vitest.setup.ts with @testing-library/jest-dom imports
  - Add test scripts to package.json: "test": "vitest --run", "test:watch": "vitest"
  - Create __tests__ directory structure (unit/, integration/, properties/)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ]* 14.1 Write unit tests for environment validation
  - Test validateEnv() throws when CONVEX_DEPLOYMENT is missing
  - Test validateEnv() throws when CLERK_SECRET_KEY doesn't start with sk_
  - Test validateEnv() throws when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY doesn't start with pk_
  - Test validateEnv() succeeds with all valid variables
  - _Requirements: 9.4_

- [ ]* 14.2 Write unit tests for rate limiting
  - Test rate limit allows requests within limit
  - Test rate limit blocks requests exceeding limit
  - Test rate limit resets after time window
  - Test rate limit returns correct remaining count
  - _Requirements: 6.5_

- [ ]* 14.3 Write unit tests for PDF generation wrapper
  - Test generatePDF() calls PDFShift API with correct parameters
  - Test generatePDF() returns Buffer on success
  - Test generatePDF() throws user-friendly error on API failure
  - Test generatePDF() handles network errors gracefully
  - _Requirements: 7.5_

- [ ] 15. Create API route for PDF generation
  - Create app/api/pdf/route.ts with POST handler
  - Implement rate limiting check using checkRateLimit()
  - Return 429 with rate limit headers when limit exceeded
  - Call generatePDF() with request body HTML
  - Return PDF binary with appropriate headers
  - Handle errors with user-facing messages
  - _Requirements: 7.4, 6.5_

- [ ]* 15.1 Write property test for rate limit response headers
  - **Property 5: Rate Limit Response Headers**
  - **Validates: Requirements 6.5**
  - Generate rate-limited requests
  - Verify all responses include X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  - Verify header values are valid numbers

- [ ] 16. Create project structure and placeholder routes
  - Create app/page.tsx with basic homepage content
  - Create app/archive/page.tsx with protected route (requires auth)
  - Create components/ui/ directory for shadcn components
  - Create lib/ directory with utils.ts
  - Create public/ directory with favicon.ico
  - Verify directory structure matches design document
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [ ] 17. Integrate Vercel Analytics
  - Install @vercel/analytics npm package
  - Add Analytics component to app/layout.tsx
  - Verify analytics events are sent in production
  - _Requirements: 15.1, 15.2_

- [ ] 18. Create GitHub Actions CI/CD pipeline
  - Create .github/workflows/ci.yml
  - Configure workflow to run on push to all branches
  - Add step: Checkout code with actions/checkout@v4
  - Add step: Setup Node.js 20 with actions/setup-node@v4 and npm cache
  - Add step: Install dependencies with npm ci
  - Add step: Run ESLint with npm run lint
  - Add step: Run TypeScript type check with npm run type-check
  - Add step: Run tests with npm run test
  - Add step: Build project with npm run build (include mock env vars)
  - Set timeout to 10 minutes
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 19. Add type-check script to package.json
  - Add "type-check": "tsc --noEmit" to scripts section
  - Verify script runs successfully
  - _Requirements: 13.4_

- [ ] 20. Create comprehensive README.md
  - Add project description and overview
  - Document prerequisites (Node.js 20+, npm, accounts for services)
  - Document setup instructions step-by-step
  - Document environment variable configuration
  - Add commands: npm install, npm run dev, npm run test, npm run build
  - Include links to external service documentation (Convex, Clerk, Upstash, PDFShift, Polar)
  - Add git workflow and conventional commit examples
  - _Requirements: 2.4, 17.4, 18.1, 18.3, 18.4, 18.5, 18.6, 18.7_

- [ ] 21. Checkpoint - Verify complete build and deployment
  - Run npm run build locally and verify success
  - Run npm run dev locally and verify Development_Server starts
  - Run npm run test locally and verify all tests pass
  - Run npm run lint and verify no errors
  - Run npm run type-check and verify no errors
  - Push all changes to GitHub
  - Verify GitHub Actions CI pipeline passes
  - Verify Vercel deployment completes successfully
  - Verify application is accessible at https://inkdown.app
  - Verify homepage returns HTTP 200
  - Verify /archive redirects unauthenticated users to Clerk sign-in
  - Ensure all tests pass, ask the user if questions arise
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ] 22. Final commit and push
  - Create final commit: "chore: complete Phase 0 foundation setup"
  - Push all commits to GitHub main branch
  - Verify all commits follow conventional commit format
  - Tag release as v0.1.0
  - _Requirements: 2.3, 17.2, 17.3_

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Commit after each completed task using conventional commit format (feat:, chore:, test:, docs:)
- All environment variables must be set both locally (.env.local) and in Vercel
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation before proceeding
- Phase 0 completion means the foundation is ready for Phase 1 feature development
