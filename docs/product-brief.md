---
description: Core coding standards and conventions for this project
alwaysApply: true
---

# Project Overview
Inkdown is a dark-mode-first, premium Markdown to PDF web application.
Tagline: "The document finisher for AI-generated content"
Domain: inkdown.app
Target users: Developers, AI power users, technical writers who generate
content with Claude/ChatGPT and need a fast, polished export to PDF.
Primary search intent we own: "Markdown to PDF" (10,000+ monthly searches)

# Coding Standards
- TypeScript strict mode always — no `any`, no implicit types
- Functional components only, no class components
- Named exports for components, default exports for pages
- File naming: PascalCase for components, kebab-case for utilities
- Keep components small and single-purpose — split early, not late
- Server Components by default — only add "use client" when genuinely needed
- All API calls go through server actions or route handlers, never raw
  fetch from client
- Environment variables accessed only in server-side code, never exposed
  to client except NEXT_PUBLIC_ prefixed keys
- All Convex queries and mutations fully typed via generated types
- No inline styles — Tailwind classes only
- Framer Motion for all animations — no CSS transitions or keyframes
- Every server action has try/catch with user-facing error states
- No `localStorage` or `sessionStorage` anywhere in the codebase

# Architecture & Design

## Layout & Navigation
- Full-screen writing mode is the DEFAULT view — split screen is opt-in
- Split screen is a toggle, not the starting point
- Homepage IS the app — no separate marketing page vs product page
- Clerk auth gates ONLY the /archive route — all other routes are public
- Mobile: full-screen writing only, no split screen, bottom sheet preview,
  thumb-zone export button always reachable

## Visual Language
- Dark mode is the hero — light mode is equally polished, dark is default
- Aesthetic reference: Notion calm + Apple visionOS finish + Linear speed
- Glassmorphism surfaces throughout: backdrop-blur-xl, semi-transparent
  backgrounds, subtle borders
- Spring physics via Framer Motion only — things settle, never just stop
- Shadows are colored, never plain black

## Design Tokens
Background dark:      #09090b  (zinc-950)
Background light:     #fafafa  (zinc-50)
Surface dark:         rgba(24,24,27,0.8)   (zinc-900/80)
Surface light:        rgba(255,255,255,0.6) (white/60)
Accent primary:       #6366f1  (indigo-500)
Accent secondary:     #8b5cf6  (violet-500)
Accent gradient:      from-indigo-500 to-violet-500
Text primary dark:    #f4f4f5  (zinc-100)
Text primary light:   #18181b  (zinc-900)
Text muted dark:      #71717a  (zinc-500)
Text muted light:     #a1a1aa  (zinc-400)
Border dark:          rgba(255,255,255,0.08)
Border light:         rgba(0,0,0,0.08)
Backdrop blur:        backdrop-blur-xl (24px)
Shadow accent:        shadow-indigo-500/10

## User Tiers
- Anonymous:       1 export/day via Upstash Redis IP rate limiting,
                   watermarked PDF, 1 theme (Clean), no account needed
- Pay-per-export:  $0.99 via Polar guest checkout, signed JWT credit
                   token, no account needed, no watermark, all themes
- Pro subscriber:  $7.99/month via Polar, Clerk account required,
                   unlimited exports, no watermark, all themes, archive

# Libraries & Tools
- Framework:       Next.js 15 App Router
- Database:        Convex — no ORM, Convex is the query layer
- Auth:            Clerk — subscribers only, gates /archive route
- Payments:        Polar.sh — MOR, handles VAT/tax, guest checkout
- Editor:          CodeMirror 6 via @uiw/react-codemirror
- PDF generation:  PDFShift API — server-side only, never client-side
- Rate limiting:   Upstash Redis via @upstash/ratelimit
- Styling:         Tailwind CSS + shadcn/ui (zinc base, dark mode: class)
- Animation:       Framer Motion — spring physics only
- Icons:           Lucide React
- Hosting:         Vercel

# PDF Themes
Five curated, professionally designed themes. Not a config panel.
Free tier unlocks Clean only. All themes unlocked on paid tiers.

- Clean:      Inter font, generous whitespace, minimal borders.
              Default free tier theme.

- Technical:  JetBrains Mono for code blocks, tight spacing, numbered
              headings, indigo accent color, built for specs and docs.

- Editorial:  Lora serif throughout, drop caps on first paragraph,
              elegant chapter-style headings, refined line spacing.

- Minimal:    Maximum whitespace, zero decorative elements, Helvetica,
              pure typography — nothing competes with the content.

- Warm:       Slightly off-white paper tone (#fdf8f0), Georgia serif,
              amber accents, soft shadows — feels like a printed book.

# Watermark (Free Tier)
Applied to every page of free tier PDF exports.
- Text:     "Created with Inkdown — inkdown.app"
- Angle:    -45 degrees, centered on each page
- Opacity:  8% — visible but not obnoxious
- Font:     Inter, 14pt
- Color:    zinc-400 (#a1a1aa)
- Removed entirely on pay-per-export and Pro tier

# Paste & Clean Feature
Detects AI-generated Markdown artifacts and strips them automatically.
Common patterns to remove:
- Introductory phrases: "Here's the markdown:", "Here is your document:"
- Closing phrases: "Let me know if you need changes", "Hope this helps!"
- Meta-commentary: "I've formatted this as...", "This document includes..."
- Unnecessary code fence labels when pasting plain markdown
- Extra blank lines (normalize to max 2 consecutive)

When content is modified:
- Show "Cleaned up pasted content" toast with "Undo" action for 5 seconds
- Undo restores the original pasted content exactly

# Floating Preview Bubble Behavior
The draggable PDF preview bubble:
- Starts in bottom-right corner on first visit
- Position persists in sessionStorage (resets on new tab/session)
- Expands on hover to show larger live preview
- Collapses back to bubble when mouse leaves
- Can be dragged anywhere on screen
- Never blocks the editor or export button

# Sample Document (Phase 1)
Pre-loaded on first visit to demonstrate all Markdown features:
- All heading levels (H1-H6)
- Bold, italic, strikethrough, inline code
- Ordered and unordered lists
- Blockquotes
- Code blocks with syntax highlighting
- Tables
- Horizontal rules
- Links
Content should feel like a real document, not Lorem Ipsum.
Title: "Welcome to Inkdown — Your Markdown Finisher"

# Anonymous Export Retention
Generated PDFs for anonymous users are:
- Stored temporarily in Vercel Blob or similar
- Retained for 1 hour after generation
- Accessible via signed URL for re-download
- Automatically deleted after 1 hour
- No user data or IP stored beyond rate limit window

# Error States & Edge Cases
Follow these rules exactly — never show generic browser errors.

- PDF generation failure:
  Show inline error toast with "Something went wrong — try again"
  Retry button triggers the same export flow
  Never show a blank download or silent failure

- Rate limit hit (free tier):
  Do NOT show a generic 429 error
  Immediately open the ExportSheet in upsell mode
  Show remaining time until reset alongside the upsell options

- Network offline:
  Editor continues to work fully — writing is never blocked
  Export button shows "You're offline" tooltip, disabled state
  Re-enables automatically when connection restores

- Empty document:
  Export button is disabled
  Tooltip on hover: "Add some content first"
  No error — just prevent the action gracefully

- Very large document (10,000+ words):
  Show estimated generation time before triggering export
  "This may take ~15 seconds" with a progress indicator
  Do not let the user think it has frozen

- Paste & Clean conflict:
  If cleanup changes content, show a subtle "Cleaned up pasted content"
  toast with an "Undo" action for 5 seconds

# Non-Functional Requirements
- Lighthouse score 90+ on all metrics at launch
- LCP under 2.5s, CLS under 0.1, INP under 200ms
- PDF generation completes within 10 seconds for docs up to 10,000 words
- Rate limiting strictly enforced — 1 export per day per IP, anonymous
- No API keys exposed client-side — all webhook payloads signature-verified
- Keyboard navigable editor, proper ARIA labels, focus management on modals
- Proper OG tags, JSON-LD structured data, sitemap.xml from day one
- Fully functional on iOS Safari and Android Chrome
- Upstash Redis used exclusively for rate limiting logic
- All Polar webhook payloads verified via signature before processing
- Vercel production deployment, preview deployments on every PR