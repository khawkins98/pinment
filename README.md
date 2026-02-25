# Pinment

Pin comments to any live webpage. Share the annotations as a single URL. No backend, no accounts, no database.

**Try it:** [khawkins98.github.io/pinment](https://khawkins98.github.io/pinment/) | **Source:** [github.com/khawkins98/pinment](https://github.com/khawkins98/pinment)

## How it works

1. **Add the bookmarklet** -- drag the Pinment button to your bookmarks bar
2. **Navigate to any page** -- published, staging, localhost, or behind auth
3. **Drop pins & comment** -- click anywhere to place numbered pins with comments
4. **Share the URL** -- hit Share to copy a link that reconstructs the full annotated view

The URL *is* the review. Recipients open it, visit the page, click the bookmarklet, and see every pin right where you left it.

## Features

| Feature | Description |
|---|---|
| Pin comments | Drop numbered pins on any live webpage and attach comments |
| Share as URL | All annotations compress into a single link via lz-string |
| Element anchoring | Pins attach to DOM elements via CSS selectors, repositioning live on browser resize |
| Element highlight | Hovering a pin or panel comment outlines the anchored DOM element |
| Import & export JSON | Save annotation sessions as JSON files; import them back anytime |
| Drag to reposition | Move pins after placing them -- no delete and re-create |
| Thread replies | Reply to any pin to create a conversation thread |
| Categories & status | Label pins (text, layout, missing, question) and mark as resolved |
| Dynamic loading | Bookmarklet is a tiny loader (~200 chars) that fetches the full script from the host site, staying well under browser URL limits |
| Version display | Panel footer shows current version and release date |
| Filter & sort | Filter pins by category, status, or author; sort by pin number, category, or status |
| Mobile warning | Warns mobile users that Pinment is desktop-optimized; option to continue anyway |
| Works anywhere | Bookmarklet runs on any page you can visit |

## Quick start

```bash
npm install
npm run dev        # local dev server
npm test           # run tests (vitest)
npm run build      # production build (vite + esbuild bookmarklet)
```

## Project structure

```
src/state.js                  State schema v2, serialization, compression, import/export
src/selector.js               CSS selector generation, environment detection
src/version.js                Version and release date constants
src/bookmarklet/index.js      Bookmarklet entry point (IIFE)
src/bookmarklet/ui.js         Pin elements, comment panel, modals, styles
js/app.js                     Hub site logic (viewer, import)
css/style.css                 Hub site styles
index.html                    Landing page and annotation viewer
tests/                        Vitest + jsdom tests
scripts/build-bookmarklet.js  Standalone bookmarklet build (esbuild)
vite.config.js                Vite config with bookmarklet build plugin
.github/workflows/ci.yml      CI/CD: test, build, deploy to GitHub Pages
```

## State schema (v2)

```json
{
  "v": 2,
  "url": "https://example.com/page",
  "viewport": 1440,
  "env": { "ua": "C/130", "vp": [1440, 900], "dt": "d" },
  "pins": [
    {
      "id": 1,
      "s": "#main>p:nth-of-type(3)",
      "ox": 0.45, "oy": 0.3,
      "fx": 648, "fy": 832,
      "author": "FL",
      "text": "This heading is wrong",
      "c": "text",
      "resolved": false,
      "replies": [
        { "author": "KH", "text": "Fixed in latest push" }
      ]
    }
  ]
}
```

Pins anchor to DOM elements via CSS selectors (`s`) with offset ratios (`ox`/`oy`) within the element's bounding box. Pixel coordinates (`fx`/`fy`) serve as fallback when the selector can't resolve.

## Technical decisions

| Decision | Choice | Rationale |
|---|---|---|
| Bookmarklet vs. extension | Bookmarklet | No install process, works cross-browser, no store approval |
| Inline vs. dynamic loading | Dynamic `<script>` loader | Inline `javascript:` URI hit Firefox's ~65KB bookmark limit; a tiny loader fetches the full script from the host site, enabling instant updates without re-installing |
| Live page vs. screenshot | Live page | Pins bind to real DOM elements; no CORS issues with screenshots |
| URL hash vs. backend | URL hash (lz-string) | Zero infrastructure; shareable via any channel |
| Element selectors vs. pixel coords | Element selectors + pixel fallback | Resilient to viewport changes; fallback if DOM changes |
| Namespaced CSS vs. shadow DOM | Namespaced (`pinment-*`) | Simpler event handling, sufficient isolation for a bookmarklet |

## Limitations

- **URL size**: ~8KB practical limit supports roughly 50 annotations depending on comment length
- **CSP**: Pages with strict Content Security Policy may block the bookmarklet
- **DOM changes**: If the page DOM changes significantly, selectors may not resolve (falls back to pixel coordinates with a warning badge)
- **Mobile devices**: Bookmarklet runs on mobile but is optimized for desktop; a warning modal informs users of this limitation
- **No real-time collaboration**: Users share URLs sequentially via chat/email

## Background & inspiration

Pinment grew out of frustration with existing webpage feedback tools -- they're either paid services requiring accounts and logins, or heavyweight browser extensions. I wanted something free, simple, and stateless: drop pins on a page, share a URL, done.

Inspired by:

- The URL-as-state pattern from [Ahmad El-Alfy](https://alfy.blog/2025/10/31/your-url-is-your-state.html) -- the idea that the URL can be the entire persistence layer
- [Buffertab](https://github.com/AlexW00/Buffertab) -- using compressed URL fragments to store structured data without a backend
- [Inkash](https://github.com/taqui-786/inkash) -- bookmarklet-driven page annotation
- [Hypothesis](https://web.hypothes.is/) -- open web annotation as a concept

## License

[MIT](LICENSE) -- Copyright (c) 2026 Ken Hawkins
