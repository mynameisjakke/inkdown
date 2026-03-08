# Inkdown

A dark-mode-first, premium Markdown to PDF web application built with Next.js 15. Transform your Markdown documents into beautifully formatted PDFs with a seamless, modern interface.

## Overview

Inkdown is a serverless web application that provides real-time Markdown editing with instant PDF export capabilities. Built on a modern tech stack, it integrates six external services to deliver authentication, data storage, rate limiting, PDF generation, and payment processing.

**Key Features:**
- Real-time Markdown editing with syntax highlighting
- One-click PDF export with professional formatting
- Secure authentication and user management
- Subscription-based access control
- Rate-limited API to prevent abuse
- Dark mode optimized interface

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: Convex (real-time data storage)
- **Authentication**: Clerk
- **Rate Limiting**: Upstash Redis
- **PDF Generation**: PDFShift API
- **Payments**: Polar.sh
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js 20+** installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** for version control
- Accounts for the following services:
  - [Convex](https://www.convex.dev/) - Database
  - [Clerk](https://clerk.com/) - Authentication
  - [Upstash](https://upstash.com/) - Redis for rate limiting
  - [PDFShift](https://pdfshift.io/) - PDF generation
  - [Polar.sh](https://polar.sh/) - Payment processing
  - [Vercel](https://vercel.com/) - Deployment (optional for local development)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inkdown
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory by copying the example file:

```bash
cp .env.local.example .env.local
```

Then fill in the required values:

#### Convex Configuration
1. Visit [Convex Dashboard](https://dashboard.convex.dev/)
2. Create a new project or select existing one
3. Run `npx convex dev` to get your deployment URL
4. Copy the values to your `.env.local`:
   ```
   CONVEX_DEPLOYMENT=your-deployment-name
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

#### Clerk Configuration
1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Navigate to API Keys section
4. Copy the keys to your `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
5. Configure allowed redirect URLs in Clerk dashboard (add your local and production URLs)

#### Upstash Redis Configuration
1. Visit [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST API credentials to your `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

#### PDFShift Configuration
1. Visit [PDFShift](https://pdfshift.io/)
2. Sign up and get your API key
3. Add to your `.env.local`:
   ```
   PDFSHIFT_API_KEY=your-api-key
   ```

#### Polar Configuration
1. Visit [Polar Dashboard](https://polar.sh/)
2. Create an account and generate an access token
3. Create a webhook secret for signature verification
4. Add to your `.env.local`:
   ```
   POLAR_ACCESS_TOKEN=polar_at_...
   POLAR_WEBHOOK_SECRET=whsec_...
   ```
5. Register webhook URL in Polar dashboard: `https://your-domain.com/api/webhooks/polar`

### 4. Deploy Convex Schema

Deploy your database schema to Convex:

```bash
npx convex deploy
```

This will generate TypeScript types in `convex/_generated/`.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server at localhost:3000 |
| `npm run build` | Build the application for production |
| `npm start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint to check code quality |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
inkdown/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage
│   ├── archive/           # Protected archive route
│   ├── api/               # API routes
│   │   ├── pdf/          # PDF generation endpoint
│   │   └── webhooks/     # Webhook handlers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers/        # Context providers
├── lib/                   # Utility functions
│   ├── env.ts            # Environment validation
│   ├── rate-limit.ts     # Rate limiting logic
│   ├── pdf.ts            # PDF generation wrapper
│   └── utils.ts          # General utilities
├── convex/                # Convex database
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User management
│   └── _generated/       # Auto-generated types
├── public/                # Static assets
├── __tests__/             # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── properties/       # Property-based tests
└── .github/workflows/     # CI/CD pipelines
```

## Git Workflow

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for clear and meaningful commit history.

### Commit Message Format

```
<type>: <description>

[optional body]

[optional footer]
```

### Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `style:` - Code style changes (formatting, etc.)
- `perf:` - Performance improvements

### Examples

```bash
# Adding a new feature
git commit -m "feat: add PDF export button to editor"

# Fixing a bug
git commit -m "fix: resolve rate limit header calculation"

# Updating documentation
git commit -m "docs: update setup instructions for Clerk"

# Maintenance task
git commit -m "chore: update dependencies to latest versions"

# Adding tests
git commit -m "test: add unit tests for PDF generation"
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Visit [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your GitHub repository
4. Configure environment variables in Vercel project settings (same as `.env.local`)
5. Deploy

Vercel will automatically deploy on every push to the main branch.

### Environment Variables in Vercel

Add all environment variables from `.env.local` to your Vercel project:

1. Go to Project Settings → Environment Variables
2. Add each variable from `.env.local.example`
3. Ensure variables are available for Production, Preview, and Development environments

## External Service Documentation

- **Convex**: [Documentation](https://docs.convex.dev/) | [Dashboard](https://dashboard.convex.dev/)
- **Clerk**: [Documentation](https://clerk.com/docs) | [Dashboard](https://dashboard.clerk.com/)
- **Upstash Redis**: [Documentation](https://docs.upstash.com/redis) | [Console](https://console.upstash.com/)
- **PDFShift**: [Documentation](https://pdfshift.io/documentation) | [Dashboard](https://pdfshift.io/dashboard)
- **Polar.sh**: [Documentation](https://docs.polar.sh/) | [Dashboard](https://polar.sh/dashboard)
- **Vercel**: [Documentation](https://vercel.com/docs) | [Dashboard](https://vercel.com/dashboard)

## Testing

The project uses a dual testing approach:

- **Unit Tests**: Verify specific examples and edge cases
- **Property-Based Tests**: Verify universal properties across randomized inputs

Run tests with:

```bash
npm run test          # Run once
npm run test:watch    # Watch mode
```

## CI/CD Pipeline

GitHub Actions automatically runs on every push:

1. Install dependencies
2. Run ESLint
3. Run TypeScript type checking
4. Run test suite
5. Build the application

The pipeline must pass before merging to main.

## Troubleshooting

### Development server won't start

- Verify all environment variables are set in `.env.local`
- Run `npm install` to ensure dependencies are installed
- Check that Node.js version is 20 or higher: `node --version`

### Build fails

- Run `npm run type-check` to identify TypeScript errors
- Run `npm run lint` to identify code quality issues
- Ensure all environment variables are set

### Tests fail

- Verify test environment variables are configured
- Run `npm run test:watch` to see detailed error messages
- Check that all dependencies are installed

### Convex connection issues

- Ensure `npx convex dev` is running in development
- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Check Convex dashboard for deployment status

## License

Private project - All rights reserved.

## Support

For issues and questions, please open an issue in the GitHub repository.
