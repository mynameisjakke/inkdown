# Inkdown SEO & Domain Strategy

## Domain
**inkdown.app**

Why this domain:
- Brandable, memorable, tweetable
- 'Ink + Markdown' — clear product signal
- .app TLD signals real product, not content site
- Short enough to type, distinctive enough to remember

## Core SEO Strategy

### Primary Search Intent
**"Markdown to PDF"** — 10,000+ monthly searches

This is the money keyword. We own this intent by:
- H1 on homepage: "Markdown to PDF" (exact match, no cleverness)
- Homepage IS the app — Google rewards tools that deliver immediate value
- No separate marketing page vs product page split
- Users land and can export within 30 seconds

### Positioning Copy
**"Write in AI. Polish here. Export anywhere."**

This is the tagline that appears in meta descriptions, OG tags, and hero subheading.

### Technical SEO Foundations (Phase 1)
- Proper OG tags (og:title, og:description, og:image)
- JSON-LD structured data (WebApplication schema)
- sitemap.xml generated automatically
- Correct H1 hierarchy (only one H1 per page)
- Core Web Vitals optimized via Vercel + Next.js baseline
- LCP under 2.5s, CLS under 0.1, INP under 200ms

### Content Strategy (Phase 2+)
Blog posts targeting long-tail keywords:
- "How to convert Markdown to PDF"
- "Best Markdown PDF tools"
- "Export Claude/ChatGPT to PDF"
- "Markdown to PDF with custom themes"

These are easily ownable — low competition, high intent, natural fit for our product.

### App Structure Philosophy
Homepage IS the app. No landing page → sign up → app flow.
- Immediate value delivery
- No friction between discovery and usage
- Google rewards tools that work instantly
- Anonymous users can export on first visit

### Meta Tags Template
```html
<title>Markdown to PDF | Inkdown</title>
<meta name="description" content="Write in AI. Polish here. Export anywhere. Convert Markdown to beautifully formatted PDF with 5 premium themes." />
<meta property="og:title" content="Markdown to PDF | Inkdown" />
<meta property="og:description" content="Write in AI. Polish here. Export anywhere." />
<meta property="og:image" content="https://inkdown.app/og-image.png" />
<meta property="og:url" content="https://inkdown.app" />
<meta name="twitter:card" content="summary_large_image" />
```

### JSON-LD Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Inkdown",
  "description": "Markdown to PDF converter with premium themes",
  "url": "https://inkdown.app",
  "applicationCategory": "UtilityApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```
