---
description: Phase 1 scope control to prevent feature creep
inclusion: auto
---

# Phase Scope Control

## Current Phase: Phase 1 — Core Loop

When building features, check the roadmap (docs/roadmap.md) to verify what's in scope.

## Phase 1 Rules (Weeks 1-2)
DO build:
- Editor with CodeMirror 6
- Slash commands and inline toolbar
- Paste & Clean functionality
- PDF export via PDFShift
- All 5 themes implemented
- ExportSheet with theme picker
- Watermark on free tier
- Upstash Redis rate limiting (1 export/day by IP)
- Mobile layout
- Dark/light mode toggle
- Error states and edge cases
- SEO foundations (OG tags, JSON-LD, sitemap)
- Vercel deployment
- Pre-loaded sample document
- Vercel Analytics events
- Floating support button
- Anonymous export retention (1 hour)

DO NOT build yet:
- Payments or Polar integration
- Clerk auth
- Convex database
- Archive
- Shared PDF links
- Image uploads
- Deep analytics dashboards

## Why This Matters
Scope creep kills momentum. Phase 1 must ship in 2 weeks with a working core loop.
Users can write and export anonymously. That's the validation milestone.

Phase 2 adds payments. Phase 3 adds archive. Not before.

## When Tempted to Add Features Early
Ask: "Can we ship Phase 1 without this?"
If yes, defer it. Get the core loop live first.
