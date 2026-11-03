# Changelog

## Unreleased

- Point default share URL generation at canonical domain (`https://www.allaboutken.com/pinment/`)
- Preserve full path, query string, and `#data=` hash fragment during GitHub Pages redirects
- Normalize address bar by stripping `/index.html` via `history.replaceState` so copied links remain canonical
- Support `?data=` query parameter fallback when hash fragments are altered by external tools, auto-migrating them to the hash
- Make decompression resilient against spaces and `%20` character substitution
- Add `public/404.html` on GitHub Pages to forward broken routes to the canonical domain preserving annotations
- Add `<noscript>` meta refresh fallback on redirect pages

## 1.2.0 — 2026-02-26

- Unified **Share & Export modal** replaces scattered footer buttons — copy share URL, download JSON, and download PDF all in one place
- **URL limit tooltip** (hoverable "?" icon) explains why there is an ~8KB browser limit
- Panel layout improvements: mode bar stacks label above action buttons; Reply button grouped inline with Save/Resolve/Delete
- Improved contrast on capacity indicator text for accessibility
- Lightweight component helpers (`makeBtn`/`makeIconBtn`) for consistent button creation
- Vite dev server now **auto-rebuilds the bookmarklet** when source files change (no restart needed)
- Fixed silent failure when copying an over-limit share URL — now opens the Share & Export modal instead
- Fixed clipboard feedback styling not resetting after a previous error

## 1.1.0 — 2026-02-25

Initial public release.

- Bookmarklet-driven annotation tool — pin comments on any live webpage
- Element-based pin anchoring via CSS selectors with offset ratios
- Pin drag-and-drop with automatic selector recalculation
- Thread replies on pins
- Categories (text, layout, missing content, question) and resolved status
- Filter and sort pins by category, status, and author
- Share annotations as a compressed URL fragment (no backend needed)
- JSON import/export for offline sharing and backup
- PDF export with page screenshot and comment appendix
- Edit/browse mode toggle with keyboard shortcuts
- URL fragment auto-load for instant viewing of shared annotations
- Mobile device warning modal
- Dynamic bookmarklet loader that adapts to any host
- Hub site with feature overview, annotation viewer, and bookmarklet install
