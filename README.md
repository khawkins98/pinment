# Pinment

Pin comments to any webpage. Share the annotations as a single URL.

No backend. No accounts. The URL *is* the review.

## How it works

1. **Add the bookmarklet** -- Visit the [Pinment site](https://khawkins98.github.io/pinment/) and drag the Pinment button to your bookmarks bar. You only need to do this once.
2. **Navigate to any page** -- Go to the page you want to review -- published, staging, localhost, or behind auth. If you can see it, you can annotate it.
3. **Drop pins & comment** -- Click the bookmarklet, then click anywhere on the page to place a numbered pin. Add your comment and name in the panel that appears.
4. **Share the URL** -- Hit **Share** to copy a link. Your colleague opens it, visits the page, clicks the bookmarklet, and sees your pins right where you left them.

## Reviewing shared annotations

1. Open a Pinment share link -- the hub site shows annotation details and an **Open target page** button
2. Click **Copy share URL** then open the target page
3. Click the Pinment bookmarklet -- if the share URL is on your clipboard it will be pre-filled automatically
4. Click **Load** and pins appear in their original positions with comments in the panel

## Good to know

- Pins are anchored to DOM elements, so they stay in place across different viewport sizes and responsive layouts
- When loading shared annotations, you'll see the original reviewer's browser, viewport, and device type
- Pages with strict Content Security Policy (CSP) may block the bookmarklet
- The URL has a practical size limit of ~8KB; a capacity indicator in the panel shows usage

## Why it exists

Reviewing web content requires feedback that combines text with spatial context: *this* heading, *that* image, the gap between the nav and the hero. Current options are either expensive (Marker.io, Pastel), limited to text-only (Word track changes), or require screenshots that go stale the moment someone pastes them into a chat. Pinment is a free, zero-infrastructure tool that lets you pin comments to a live page and share via URL.

## Inspiration

The idea of encoding application state into the URL fragment -- shareable, bookmarkable, zero infrastructure -- comes from [URLs are the state management you should use](https://allaboutken.com/posts/20251226-url-state-management/), building on Ahmad El-Alfy's [Your URL is your state](https://alfy.blog/2025/10/31/your-url-is-your-state.html).

Two existing projects store full documents in the URL hash, well beyond config toggles:

- **[Buffertab](https://github.com/AlexW00/Buffertab)** (MIT) -- A markdown editor that lives entirely in the URL hash. Uses pako (zlib/deflate) for compression with a visual indicator of URL length usage. Pinment borrows its compression strategy and capacity indicator from Buffertab.
- **[Inkash](https://github.com/taqui-786/inkash)** -- Markdown editor and freehand canvas drawing, also URL-hash-only. Adds QR code sharing and export to PNG/SVG/HTML. Shows that canvas data can fit in a URL too.

Pinment extends this pattern from text/drawing to spatial annotation on live webpages. The element-based anchoring approach draws on techniques used by [Hypothesis](https://web.hypothes.is/) (open-source web annotation) and browser DevTools CSS selector generation.

---

## Technical details

### How state is stored

All annotation data (page URL, viewport width, pin positions, comments) is serialized to JSON and compressed with [lz-string](https://github.com/pieroxy/lz-string) into the URL hash (`#data=...`). There is no server or database -- the URL is the entire review.

### Pin anchoring

Pins are anchored to DOM elements rather than raw pixel coordinates. When a pin is placed, Pinment identifies the element under the click using `elementFromPoint`, generates a stable CSS selector for it, and stores the click position as offset ratios within the element's bounding box. This means pins stay in place across different viewport sizes and responsive layouts. Fallback pixel coordinates are also stored for cases where the element can't be found on restore.

The selector generation algorithm prefers stable identifiers: IDs, `data-testid` attributes, semantic class names, then `nth-of-type` as a last resort. Framework-generated class names and unstable IDs are filtered out.

Shared annotations also include compact browser/device metadata (browser name/version, viewport dimensions, device type) so recipients understand the original review context.

### Architecture

- **Bookmarklet** injects annotation UI directly into the target page using namespaced CSS classes (`pinment-*`) to avoid conflicts with host page styles
- **Hub site** hosted on GitHub Pages for bookmarklet installation and viewing shared annotation data
- **Build pipeline**: esbuild bundles the bookmarklet source into a `javascript:` URI; a Vite plugin injects the bundled bookmarklet into the hub site at build time
- **CI/CD**: GitHub Actions runs tests, builds, and deploys to GitHub Pages on merge to main

### Project structure

```
src/
  state.js                  # State schema v2, serialization/compression
  selector.js               # CSS selector generation, environment detection
  bookmarklet/
    index.js                # Bookmarklet entry point (bundled into javascript: URI)
    ui.js                   # Pin elements, comment panel, styles
js/
  app.js                    # Hub site logic (URL parsing, viewer rendering)
css/
  style.css                 # Hub site styles
tests/
  state.test.js             # State module tests
  selector.test.js          # Selector generation tests
  bookmarklet.test.js       # Bookmarklet UI tests
  hub.test.js               # Hub site tests
scripts/
  build-bookmarklet.js      # Standalone bookmarklet build script
.github/workflows/
  ci.yml                    # Test, build, deploy pipeline
index.html                  # Hub site
```

### Development

```sh
npm install
npm run dev           # Start Vite dev server
npm test              # Run tests (Vitest)
npm run test:watch    # Run tests in watch mode
npm run build         # Build hub site (includes bookmarklet bundling)
npm run build:bookmarklet  # Build bookmarklet only
```
