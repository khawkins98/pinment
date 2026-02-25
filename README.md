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

Two existing projects store full documents in the URL hash, well beyond config toggles:

- **[Buffertab](https://github.com/AlexW00/Buffertab)** (MIT) -- A markdown editor that lives entirely in the URL hash. Uses pako (zlib/deflate) for compression with a visual indicator of URL length usage. Pinment borrows its compression strategy and capacity indicator from Buffertab.
- **[Inkash](https://github.com/taqui-786/inkash)** -- Markdown editor and freehand canvas drawing, also URL-hash-only. Adds QR code sharing and export to PNG/SVG/HTML. Shows that canvas data can fit in a URL too.

Pinment extends this pattern from text/drawing to spatial annotation on live webpages.

## Usage

### Install the bookmarklet

Visit the hub site and drag the **Pinment** button to your browser's bookmarks bar. You only need to do this once.

### Annotate a page

1. Navigate to any page you want to review
2. Click the Pinment bookmarklet in your bookmarks bar
3. A welcome modal appears -- click **Start fresh** to begin a new review
4. Click anywhere on the page to drop a numbered pin
5. In the right-hand panel, add a comment and your name for each pin
6. Click **Share** to copy the compressed annotation URL to your clipboard
7. Send the link via chat, email, or wherever

### Review shared annotations

1. Open the Pinment share link -- the hub site shows annotation details as a text list
2. Click the target page link to visit the annotated page
3. Click the Pinment bookmarklet on that page
4. In the welcome modal, paste the share URL and click **Load annotations**
5. Pins appear in their original positions with comments in the panel

### Limitations

- Pins may drift if the page layout changes between annotation and review (a viewport mismatch warning is shown)
- Pages with strict Content Security Policy (CSP) may block the bookmarklet
- The URL has a practical size limit of ~8KB; a capacity indicator in the panel shows usage

## Technical approach

- **Bookmarklet** injects annotation UI directly into the target page using namespaced CSS classes (`pinment-*`) to avoid conflicts
- **Hub site** hosted on GitHub Pages for bookmarklet installation and viewing shared annotation data
- **State compression** via lz-string into the URL hash (`#data=...`)
- **Pin coordinates** stored as x-ratio (0--1) relative to viewport width + y-offset in pixels from document top, with viewport width recorded for context
- **Annotation restore**: bookmarklet prompts the user to paste a share URL when activated
- **Build pipeline**: esbuild bundles the bookmarklet source into a `javascript:` URI; Vite builds the hub site and injects the bundled bookmarklet
- **CI/CD**: GitHub Actions runs tests, builds, and deploys to GitHub Pages on merge to main

## Project structure

```
src/
  state.js                  # Shared state serialization/compression
  bookmarklet/
    index.js                # Bookmarklet entry point (bundled into javascript: URI)
    ui.js                   # Pin elements, comment panel, styles
js/
  app.js                    # Hub site logic (URL parsing, viewer rendering)
css/
  style.css                 # Hub site styles
tests/
  state.test.js             # State module tests
  bookmarklet.test.js       # Bookmarklet UI tests
  hub.test.js               # Hub site tests
scripts/
  build-bookmarklet.js      # Standalone bookmarklet build script
.github/workflows/
  ci.yml                    # Test, build, deploy pipeline
index.html                  # Hub site
```

## Development

```sh
npm install
npm run dev           # Start Vite dev server
npm test              # Run tests (Vitest)
npm run test:watch    # Run tests in watch mode
npm run build         # Build hub site (includes bookmarklet bundling)
npm run build:bookmarklet  # Build bookmarklet only
```

## Status

All MVP functional requirements (FR-01 through FR-08) are implemented and passing 86 tests. The hub site, bookmarklet, build pipeline, and CI/CD deployment to GitHub Pages are all in place. See [PRD.md](PRD.md) for full requirements, design decisions, and the v1.1 roadmap.
