---
description: Tech stack, route structure, authentication, and data flow for Inkdown
inclusion: auto
---

# Inkdown Architecture

## Stack
- Framework: Next.js 15 App Router
- Database: Convex — no ORM, Convex is the query layer
- Auth: Clerk — subscribers only, gates /archive route
- Payments: Polar.sh — MOR, handles VAT/tax, guest checkout
- Editor: CodeMirror 6 via @uiw/react-codemirror
- PDF generation: PDFShift API — server-side only, never client-side
- Rate limiting: Upstash Redis via @upstash/ratelimit
- Styling: Tailwind CSS + shadcn/ui
- Animation: Framer Motion
- Icons: Lucide React
- Hosting: Vercel

## Route Structure
```
app/
├── page.tsx              # Homepage = editor (public)
├── archive/
│   └── page.tsx          # Subscriber archive (Clerk protected)
├── pricing/
│   └── page.tsx          # Pricing comparison (public)
├── api/
│   ├── webhooks/
│   │   └── polar/
│   │       └── route.ts  # Polar webhook handler
│   └── export/
│       └── route.ts      # PDF generation endpoint
```

## Authentication Flow
- Anonymous users: full editor access, 1 export/day via IP rate limiting
- Pay-per-export: guest checkout → JWT credit token → no account needed
- Pro subscribers: Clerk account required, gates /archive only
- Clerk middleware protects /archive route exclusively

## Payment Flow
- Pay-per-export: Polar guest checkout → webhook → issue signed JWT → validate on export
- Subscription: Polar hosted checkout → webhook → update Convex users table → Clerk metadata sync
- Watermark removed for all paid tiers
- All 5 themes unlocked for paid tiers (free tier locked to Clean only)

## Data Flow
- Anonymous exports: temporary storage (1 hour), no database record
- Pro exports: auto-save to Convex (raw .md + generated PDF)
- Rate limiting: Upstash Redis tracks IP → export count → 24h window
- Subscription state: Polar webhook → Convex users table → Clerk metadata

## Server Actions
All mutations go through server actions:
- `exportToPDF(markdown, theme, creditToken?)` - generates PDF, checks rate limits
- `saveToArchive(markdown, pdfUrl)` - stores document in Convex (Pro only)
- `validateCreditToken(token)` - verifies JWT signature for pay-per-export

## Security
- All API keys server-side only
- Polar webhook signature verification required
- JWT credit tokens signed with secret, short expiry (24h)
- Rate limiting strictly enforced at IP level
- No client-side PDF generation (prevents abuse)
