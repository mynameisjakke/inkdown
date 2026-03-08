# Inkdown Setup Checklist

## Completed
- [x] Domain: inkdown.app (Cloudflare)
- [x] GitHub: Empty repo created
- [x] Vercel: Account + MCP connected + CLI installed
- [x] Convex: Account + project created
- [x] Clerk: Account + project created + MCP connected
- [x] Polar.sh: Account + organization + Pro subscription product + one-time export product
- [x] Upstash Redis: Project created
- [x] PDFShift: Account created

## Pending Setup

### GitHub
- [ ] Connect local repo to GitHub remote
- [ ] Set up Vercel GitHub integration (auto-deploy on push)
- [ ] GitHub Actions: Optional for Phase 1, consider for Phase 2+
- [ ] Husky: Skip for now (overkill for solo/small team in early phase)

### Vercel
- [ ] Link project to GitHub repo
- [ ] Connect inkdown.app domain
- [ ] Add environment variables (see below)
- [ ] Enable Vercel Analytics

### Convex
- [ ] Install CLI: `npm install convex`
- [ ] Run `npx convex dev` to initialize
- [ ] Get deployment URL and deploy key
- [ ] Add to Vercel env vars

### Clerk
- [ ] Get publishable key and secret key
- [ ] Configure allowed redirect URLs (inkdown.app, localhost:3000)
- [ ] Set up /archive route protection
- [ ] Add to Vercel env vars

### Polar
- [ ] Get API keys (server-side only)
- [ ] Configure webhook endpoint: https://inkdown.app/api/webhooks/polar
- [ ] Note webhook signing secret
- [ ] Add to Vercel env vars

### Upstash Redis
- [ ] Get REST URL and token
- [ ] Add to Vercel env vars

### PDFShift
- [ ] Get API key
- [ ] Add to Vercel env vars

## Environment Variables Needed

### Local (.env.local)
```
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Polar
POLAR_API_KEY=
POLAR_WEBHOOK_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# PDFShift
PDFSHIFT_API_KEY=
```

### Vercel (Production)
Same variables as above, set via Vercel dashboard or CLI

## CI/CD Recommendation
For Phase 1: Skip GitHub Actions and Husky
- Vercel auto-deploys on push (built-in CI/CD)
- No tests yet to run in CI
- Husky pre-commit hooks add friction for rapid iteration

For Phase 2+: Consider adding
- GitHub Actions for running tests
- Husky for pre-commit linting (if team grows)

Keep it simple for now. Ship fast.
