# Pinment

Pin comments to a live webpage. Share the annotations as a single URL. No backend, no accounts, no database.

## What it does

Pinment is a bookmarklet that lets you annotate any webpage you can see in your browser. Navigate to the page -- published, staging, localhost, behind auth -- click the bookmarklet, and drop numbered pins with comments directly on the live page. Hit share, and the entire annotation state (page URL, viewport, pin positions, comments) gets compressed into a URL fragment. Send that link to a colleague: they visit the page, click the same bookmarklet, and your pins appear right where you placed them.

## Why it exists

Reviewing unpublished web content requires feedback that combines text with spatial context: *this* heading, *that* image, the gap between the nav and the hero. Current options are either expensive (Marker.io, Pastel), limited to text-only (Word track changes), or require screenshots that go stale the moment someone pastes them into a chat. There's no free, zero-infrastructure tool that lets you pin comments to a live page and share via URL.

## How it works

1. **Activate** -- Navigate to the page you want to review and click the Pinment bookmarklet
2. **Annotate** -- Click anywhere on the page to drop a numbered pin and add a comment
3. **Share** -- Pinment serializes all state into a compressed URL fragment (lz-string)
4. **Review** -- Recipient opens the link, visits the target page, clicks the bookmarklet, and pins appear in place

No server. No login. The URL *is* the review.

## Inspiration

The idea of encoding application state into the URL fragment -- shareable, bookmarkable, zero infrastructure -- comes from [URLs are the state management you should use](https://allaboutken.com/posts/20251226-url-state-management/), building on Ahmad El-Alfy's [Your URL is your state](https://alfy.blog/2025/10/31/your-url-is-your-state.html).

Two existing projects prove this pattern works for real content, not just configuration toggles:

- **[Buffertab](https://github.com/AlexW00/Buffertab)** (MIT) -- A markdown editor that lives entirely in the URL hash. Uses pako (zlib/deflate) for compression with a visual indicator of URL length usage. The compression approach and URL capacity management directly inform Pinment's design.
- **[Inkash](https://github.com/taqui-786/inkash)** -- Markdown editor and freehand canvas drawing, also URL-hash-only. Adds QR code sharing and export to PNG/SVG/HTML. Demonstrates that even canvas-based content can fit in a URL.

Pinment extends this pattern from text/drawing to spatial annotation on live webpages.

## Technical approach

- Bookmarklet injects annotation UI directly into the target page
- Static hub site hosted on GitHub Pages (install bookmarklet, view annotation data)
- State compression via lz-string into the URL hash
- Pin coordinates stored as x-ratio (0--1) relative to viewport width + y-offset in pixels from document top, with viewport width recorded for context
- Local dev with Node.js + Vite; tests via Vitest

## Development

```sh
npm install
npm run dev
```

## Status

Early development. See [PRD.md](PRD.md) for full requirements and design decisions.
