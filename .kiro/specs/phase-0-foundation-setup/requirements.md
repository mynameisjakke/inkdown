# Requirements Document

## Introduction

Phase 0 establishes the complete foundation and infrastructure for Inkdown, a dark-mode-first, premium Markdown to PDF web application. This phase configures all external services, establishes the development environment, sets up CI/CD pipelines, and creates the basic project structure following Next.js 15 App Router conventions. Upon completion, the project will be fully deployed to production at inkdown.app and ready for Phase 1 feature development.

## Glossary

- **Project**: The Next.js 15 application codebase for Inkdown
- **Repository**: The GitHub repository hosting the Project source code
- **Deployment**: The live application running on Vercel at inkdown.app
- **CI_Pipeline**: GitHub Actions workflow that runs automated checks on every push
- **Environment_Variables**: Configuration values for service integrations stored securely
- **Service_Integration**: Connection between the Project and external services (Convex, Clerk, Upstash, PDFShift, Polar)
- **Test_Suite**: Collection of automated tests using Vitest and Testing Library
- **Build_Process**: Compilation and bundling of the Project for production deployment
- **Component_Library**: shadcn/ui components configured with zinc palette and dark mode
- **Development_Server**: Local Next.js server running at localhost:3000

## Requirements

### Requirement 1: Initialize Next.js Project

**User Story:** As a developer, I want a Next.js 15 project with TypeScript strict mode, so that I can build type-safe features with the latest framework capabilities.

#### Acceptance Criteria

1. THE Project SHALL use Next.js version 15 or higher
2. THE Project SHALL enable TypeScript strict mode in tsconfig.json
3. THE Project SHALL use the App Router architecture (not Pages Router)
4. THE Project SHALL include a package.json with all required dependencies
5. WHEN the Development_Server starts, THE Project SHALL run without errors
6. THE Project SHALL include a .gitignore file excluding node_modules, .next, .env.local, and build artifacts

### Requirement 2: Configure GitHub Repository Connection

**User Story:** As a developer, I want the local repository connected to GitHub, so that I can version control the codebase and enable CI/CD workflows.

#### Acceptance Criteria

1. THE Repository SHALL be initialized with git
2. THE Repository SHALL have a remote named "origin" pointing to the GitHub repository
3. WHEN code is pushed, THE Repository SHALL successfully sync with GitHub
4. THE Repository SHALL include a README.md with project description and setup instructions
5. THE Repository SHALL use conventional commit message format for all commits

### Requirement 3: Set Up Vercel Deployment

**User Story:** As a developer, I want the project deployed to Vercel with the inkdown.app domain, so that the application is accessible in production.

#### Acceptance Criteria

1. THE Deployment SHALL be connected to the GitHub Repository
2. THE Deployment SHALL be accessible at https://inkdown.app
3. WHEN code is pushed to the main branch, THE Deployment SHALL automatically redeploy
4. THE Deployment SHALL complete the Build_Process without errors
5. THE Deployment SHALL serve the application over HTTPS with valid SSL certificate

### Requirement 4: Integrate Convex Database

**User Story:** As a developer, I want Convex integrated with the project, so that I can store and query application data.

#### Acceptance Criteria

1. THE Project SHALL include the convex npm package
2. THE Project SHALL include a convex/ directory with schema definitions
3. THE Environment_Variables SHALL include CONVEX_DEPLOYMENT for production
4. THE Environment_Variables SHALL include NEXT_PUBLIC_CONVEX_URL for client access
5. WHEN the Development_Server starts, THE Project SHALL successfully connect to Convex
6. THE Project SHALL generate TypeScript types from Convex schema

### Requirement 5: Integrate Clerk Authentication

**User Story:** As a developer, I want Clerk authentication integrated, so that I can protect subscriber-only routes.

#### Acceptance Criteria

1. THE Project SHALL include the @clerk/nextjs npm package
2. THE Project SHALL include Clerk middleware protecting the /archive route
3. THE Environment_Variables SHALL include NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
4. THE Environment_Variables SHALL include CLERK_SECRET_KEY
5. WHEN an unauthenticated user accesses /archive, THE Project SHALL redirect to sign-in
6. THE Project SHALL sync Clerk user metadata with Convex users table

### Requirement 6: Integrate Upstash Redis

**User Story:** As a developer, I want Upstash Redis integrated, so that I can implement rate limiting for exports.

#### Acceptance Criteria

1. THE Project SHALL include the @upstash/redis and @upstash/ratelimit npm packages
2. THE Environment_Variables SHALL include UPSTASH_REDIS_REST_URL
3. THE Environment_Variables SHALL include UPSTASH_REDIS_REST_TOKEN
4. WHEN the rate limit client initializes, THE Project SHALL successfully connect to Upstash
5. THE Project SHALL include a rate limiting utility function for IP-based throttling

### Requirement 7: Integrate PDFShift API

**User Story:** As a developer, I want PDFShift API integrated, so that I can generate PDFs from Markdown content.

#### Acceptance Criteria

1. THE Environment_Variables SHALL include PDFSHIFT_API_KEY
2. THE Project SHALL include a server-side PDF generation utility
3. THE Project SHALL never expose PDFShift credentials to client-side code
4. WHEN PDF generation is requested, THE Project SHALL call PDFShift API from server only
5. THE Project SHALL handle PDFShift API errors with user-facing error messages

### Requirement 8: Integrate Polar.sh Payments

**User Story:** As a developer, I want Polar.sh integrated, so that I can process payments and manage subscriptions.

#### Acceptance Criteria

1. THE Project SHALL include the @polar-sh/sdk npm package
2. THE Environment_Variables SHALL include POLAR_ACCESS_TOKEN
3. THE Environment_Variables SHALL include POLAR_WEBHOOK_SECRET
4. THE Project SHALL include a webhook handler at /api/webhooks/polar
5. WHEN a Polar webhook is received, THE Project SHALL verify the signature before processing
6. THE Project SHALL handle subscription.created and checkout.completed webhook events

### Requirement 9: Configure Environment Variables

**User Story:** As a developer, I want all environment variables configured locally and on Vercel, so that service integrations work in all environments.

#### Acceptance Criteria

1. THE Project SHALL include a .env.local.example file documenting all required variables
2. THE Environment_Variables SHALL be set in local .env.local file
3. THE Environment_Variables SHALL be set in Vercel project settings
4. THE Project SHALL fail fast with clear error messages when required variables are missing
5. THE Project SHALL never commit actual secrets to the Repository

### Requirement 10: Set Up Tailwind CSS and shadcn/ui

**User Story:** As a developer, I want Tailwind CSS and shadcn/ui configured with the zinc palette and dark mode, so that I can build consistent UI components.

#### Acceptance Criteria

1. THE Project SHALL include tailwindcss, postcss, and autoprefixer npm packages
2. THE Component_Library SHALL use the zinc color palette as the base
3. THE Component_Library SHALL use class-based dark mode strategy
4. THE Project SHALL include a components.json configuration file for shadcn/ui
5. THE Project SHALL include a global CSS file with Tailwind directives
6. WHEN components are added via shadcn/ui CLI, THE Project SHALL place them in components/ui/

### Requirement 11: Configure Additional UI Dependencies

**User Story:** As a developer, I want Framer Motion, Lucide React, and CodeMirror configured, so that I can build animated, icon-rich interfaces with code editing capabilities.

#### Acceptance Criteria

1. THE Project SHALL include framer-motion npm package
2. THE Project SHALL include lucide-react npm package
3. THE Project SHALL include @uiw/react-codemirror npm package
4. THE Project SHALL include @codemirror/lang-markdown for Markdown syntax highlighting
5. THE Project SHALL follow coding standards requiring Framer Motion for all animations

### Requirement 12: Establish Test Infrastructure

**User Story:** As a developer, I want Vitest and Testing Library configured, so that I can write and run automated tests.

#### Acceptance Criteria

1. THE Test_Suite SHALL use Vitest as the test runner
2. THE Test_Suite SHALL use @testing-library/react for component testing
3. THE Test_Suite SHALL use @testing-library/jest-dom for DOM assertions
4. THE Project SHALL include a vitest.config.ts configuration file
5. WHEN tests are run, THE Test_Suite SHALL execute without configuration errors
6. THE Project SHALL include a test script in package.json using vitest --run flag

### Requirement 13: Create GitHub Actions CI/CD Pipeline

**User Story:** As a developer, I want a GitHub Actions workflow that runs on every push, so that code quality is automatically verified.

#### Acceptance Criteria

1. THE CI_Pipeline SHALL run on every push to any branch
2. THE CI_Pipeline SHALL install dependencies using npm ci
3. THE CI_Pipeline SHALL run ESLint for code linting
4. THE CI_Pipeline SHALL run TypeScript type checking
5. THE CI_Pipeline SHALL run the Test_Suite
6. THE CI_Pipeline SHALL run the Build_Process
7. WHEN any check fails, THE CI_Pipeline SHALL fail and block merge
8. THE CI_Pipeline SHALL complete in under 5 minutes for typical changes

### Requirement 14: Establish Project Structure

**User Story:** As a developer, I want a well-organized project structure following Next.js 15 conventions, so that code is maintainable and scalable.

#### Acceptance Criteria

1. THE Project SHALL include an app/ directory for routes and layouts
2. THE Project SHALL include a components/ directory for React components
3. THE Project SHALL include a lib/ directory for utility functions
4. THE Project SHALL include a convex/ directory for database schema and functions
5. THE Project SHALL include a public/ directory for static assets
6. THE Project SHALL include app/page.tsx as the homepage route
7. THE Project SHALL include app/layout.tsx as the root layout
8. THE Project SHALL follow the route structure defined in architecture.md

### Requirement 15: Integrate Vercel Analytics

**User Story:** As a developer, I want Vercel Analytics integrated, so that I can track application usage and performance.

#### Acceptance Criteria

1. THE Project SHALL include the @vercel/analytics npm package
2. THE Project SHALL include Analytics component in the root layout
3. WHEN the Deployment is live, THE Project SHALL send analytics events to Vercel
4. THE Project SHALL track page views automatically
5. THE Project SHALL respect user privacy and GDPR requirements

### Requirement 16: Verify Build Success

**User Story:** As a developer, I want to verify the complete setup builds and deploys successfully, so that I know the foundation is ready for feature development.

#### Acceptance Criteria

1. WHEN npm run build is executed locally, THE Build_Process SHALL complete without errors
2. WHEN npm run dev is executed locally, THE Development_Server SHALL start without errors
3. WHEN npm run test is executed locally, THE Test_Suite SHALL pass all tests
4. WHEN code is pushed to GitHub, THE CI_Pipeline SHALL pass all checks
5. WHEN the Deployment completes, THE application SHALL be accessible at https://inkdown.app
6. THE Deployment SHALL return HTTP 200 status for the homepage
7. THE Deployment SHALL render content without console errors

### Requirement 17: Establish Git Workflow

**User Story:** As a developer, I want a clear git workflow with conventional commits, so that the project history is clean and meaningful.

#### Acceptance Criteria

1. THE Repository SHALL use conventional commit format for all commit messages
2. WHEN a task is completed, THE developer SHALL create a commit with a descriptive message
3. WHEN Phase 0 is completed, THE developer SHALL push all commits to GitHub
4. THE Repository SHALL include commit message examples in documentation
5. THE Project SHALL follow the pattern: feat:, fix:, chore:, docs:, test:, refactor:

### Requirement 18: Document Setup Process

**User Story:** As a developer, I want comprehensive setup documentation, so that other developers can replicate the environment.

#### Acceptance Criteria

1. THE Project SHALL include a README.md with setup instructions
2. THE Project SHALL include a .env.local.example with all required variables
3. THE Project SHALL document the command to install dependencies
4. THE Project SHALL document the command to start the Development_Server
5. THE Project SHALL document the command to run tests
6. THE Project SHALL document the command to build for production
7. THE Project SHALL include links to external service documentation (Convex, Clerk, etc.)
