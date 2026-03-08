---
description: Development roadmap and phase milestones for Inkdown
alwaysApply: false
---

# Inkdown Development Roadmap

## How to Use This File
This roadmap defines what is in scope per phase. When building any
feature, check which phase it belongs to. Do not build Phase 2+ features
during Phase 1 — scope creep kills momentum. Each phase ends with a
deployable, usable product.

---

## Phase 1 — Core Loop (Weeks 1–2)
Goal: The editor works, export works, the experience feels magical.
No auth, no payments. Ship to real users and validate the core loop.
Milestone: inkdown.app is live, anonymous users can write and export.

### In Scope
- Next.js 15 project scaffold with full stack configured
- CodeMirror 6 editor with custom Inkdown dark/light theme
- Markdown syntax highlighting and slash commands (/h1 /table /code)
- Floating inline toolbar on text selection (bold, italic, link)
- Full-screen writing mode as default view
- Floating draggable PDF preview bubble (expands on hover)
- Split-screen toggle (animated, opt-in only)
- Paste & Clean — auto-strip AI markdown artifacts on paste
- Undo toast when Paste & Clean modifies content
- PDF export via PDFShift server action
- 5 PDF themes implemented (Clean, Technical, Editorial, Minimal, Warm)
- ExportSheet — slides up before export, theme picker inside
- Export animation — theatrical "printing" micro-interaction
- Watermark applied to all free tier exports
- Upstash Redis rate limiting — 1 export/day by IP
- Rate limit hit → upsell sheet opens (Polar not wired yet, coming Phase 2)
- Mobile layout — full-screen writing, bottom sheet preview, thumb-zone export
- Dark mode default, light mode toggle, system preference respected
- All error states and edge cases per project-standards.mdc
- SEO foundations — OG tags, JSON-LD, sitemap.xml, correct H1
- Vercel deployment — inkdown.app live on custom domain
- Pre-loaded sample Markdown document that can be exported immediately on first visit
- Vercel Analytics / Speed Insights / Observability wired with events for export started/completed, rate-limit hit, and export failed
- Floating support button implemented, opening an email draft to hello@inkdown.app
- Anonymous export artifacts retained for 1 hour to support re-download, then deleted

### Out of Scope for Phase 1
- Payments, Polar integration
- Clerk auth
- Convex database
- Archive
- Shared PDF links
- Image uploads in Markdown
- Deep analytics funnels, custom dashboards, or complex reporting beyond basic event tracking

---

## Phase 2 — Payments (Weeks 3–4)
Goal: Revenue. Both pay-per-export and Pro subscription working end-to-end.
Milestone: First paying customer can complete checkout and export without
a hitch.

### In Scope
- Polar.sh SDK integration
- Pay-per-export flow: guest checkout → signed JWT credit token issued
- JWT credit token validation on export server action
- Subscription checkout flow — redirects to Polar hosted page
- Polar webhook handler at /api/webhooks/polar
- Webhook signature verification
- Subscription active/inactive state stored in Convex users table
- Watermark removal for paid tiers
- All 5 themes unlocked for paid tiers (free stays on Clean only)
- Pricing page — tasteful, single page, clear tier comparison
- Upsell sheet fully wired — pay-per-export and Pro options shown at
  rate limit moment
- Upgrade prompt shown contextually when free user tries locked theme
- Track payment-related events in Vercel Analytics (checkout started/completed, upsell views, upgrade prompt interactions)

### Out of Scope for Phase 2
- Clerk auth UI (subscription state tracked by Polar webhook only at this stage)
- Archive (needs Clerk identity)
- Shared PDF links

---

## Phase 3 — Archive & Account (Weeks 5–6)
Goal: Subscriber stickiness. The archive makes Pro worth renewing every month.
Milestone: A Pro subscriber can export, find their document in the archive
next week, edit it, and re-export with a new theme.

### In Scope
- Clerk auth — sign up / sign in for Pro subscribers only
- Clerk middleware protecting /archive route
- Convex schema live: documents table and users table
- Auto-save md source + PDF to Convex on every Pro subscriber export
- Archive page — real-time list via Convex query, search,
- Measurement of archive interactions in Vercel Analytics (document opened from archive, search usage, re-export from archive), following logging/privacy rules in project-standards.mdc