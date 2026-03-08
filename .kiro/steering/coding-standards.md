---
description: Core coding standards and conventions for Inkdown
inclusion: auto
---

# Inkdown Coding Standards

## TypeScript Rules
- Strict mode always — no `any`, no implicit types
- All Convex queries and mutations fully typed via generated types
- Functional components only, no class components
- Named exports for components, default exports for pages

## File Naming
- PascalCase for components: `ExportSheet.tsx`
- kebab-case for utilities: `format-markdown.ts`
- kebab-case for routes: `app/archive/page.tsx`

## Component Philosophy
- Keep components small and single-purpose — split early, not late
- Server Components by default — only add "use client" when genuinely needed
- All API calls go through server actions or route handlers, never raw fetch from client
- Every server action has try/catch with user-facing error states

## Styling
- No inline styles — Tailwind classes only
- Framer Motion for all animations — no CSS transitions or keyframes
- Use design tokens from product brief (zinc-950, indigo-500, etc.)
- Glassmorphism surfaces: backdrop-blur-xl, semi-transparent backgrounds

## Security & Environment
- Environment variables accessed only in server-side code
- Never expose secrets to client except NEXT_PUBLIC_ prefixed keys
- No `localStorage` or `sessionStorage` anywhere in the codebase (except preview bubble position)
- All Polar webhook payloads verified via signature before processing

## Error Handling
- Never show generic browser errors
- Follow error states defined in product brief exactly
- Rate limit hit → open ExportSheet in upsell mode, never show 429
- Network offline → disable export button with tooltip, editor keeps working
- Empty document → disable export button with "Add some content first" tooltip
