---
description: Visual language, design tokens, and component patterns for Inkdown
inclusion: auto
---

# Inkdown Design System

## Visual Language
- Dark mode is the hero — light mode is equally polished, dark is default
- Aesthetic reference: Notion calm + Apple visionOS finish + Linear speed
- Glassmorphism surfaces throughout
- Spring physics via Framer Motion only — things settle, never just stop
- Shadows are colored, never plain black

## Design Tokens

### Colors
```
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
```

## Layout Principles
- Full-screen writing mode is the DEFAULT view
- Split screen is a toggle, not the starting point
- Homepage IS the app — no separate marketing page
- Mobile: full-screen writing only, bottom sheet preview, thumb-zone export button

## Animation Guidelines
- Use Framer Motion spring physics exclusively
- No CSS transitions or keyframes
- Things should settle naturally, never just stop
- Export animation should feel theatrical and satisfying
- Micro-interactions on hover states (preview bubble expansion, button states)

## Component Patterns
- shadcn/ui components as base (zinc palette, dark mode: class)
- Lucide React for all icons
- Floating sheets slide up from bottom (ExportSheet, preview on mobile)
- Tooltips on disabled states explain why action is blocked
- Toast notifications for transient feedback (Paste & Clean, errors)
