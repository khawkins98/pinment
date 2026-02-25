# Pinment -- Product Requirements Document

---

## Problem

Reviewing webpage content -- especially unpublished or staging pages -- requires giving feedback that combines text comments with spatial context (where on the page the issue is). Current approaches are either expensive/proprietary (Marker.io, Pastel), limited to text-only review (Word track changes), or require screenshots that quickly go stale. There is no free, zero-infrastructure tool that lets a reviewer pin comments directly on a live webpage and share the annotated state via a single URL.

## Proposed solution

Pinment is a bookmarklet-driven annotation tool backed by a static hub site hosted on GitHub Pages. A reviewer activates the bookmarklet on any page they can view in their browser -- published, staging, localhost, behind auth -- and drops numbered pins with comments directly on the live page. The tool serializes all annotations (page URL, viewport width, pin coordinates, comments) into a compressed URL fragment. A recipient opens the share link, navigates to the same page, activates the bookmarklet, and sees the pins overlaid in place. No backend, no accounts, no database.

## Core workflow

1. **Activate** -- Reviewer navigates to the page under review and clicks the Pinment bookmarklet; the annotation UI injects into the page
2. **Annotate** -- Reviewer clicks anywhere on the page to drop a numbered pin and add a comment
3. **Share** -- The bookmarklet serializes all annotations into a compressed Pinment URL; the reviewer copies and sends the link
4. **Review** -- Recipient opens the Pinment link, which shows the annotation data with action buttons; they click "Copy share URL", open the target page, click the bookmarklet (share URL is pre-filled from clipboard), and the saved pins appear in place

## Design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Element-anchored pins vs. pixel coordinates | DOM element selectors + offset ratios | Resilient to viewport changes and responsive layouts; pins stay on the correct element regardless of window size; fallback pixel coordinates stored for robustness |
| Injection method | Bookmarklet | Works on any page the user can already see (localhost, staging, authenticated pages); no extension store approval; no CORS issues since JS runs in the page's own context |
| Storage | URL hash (compressed) | Zero infrastructure; shareable via any channel (Teams, email, chat) |
| Hosting (hub site) | GitHub Pages | Free, no server to maintain |
| Auth | None | Simplicity; feedback links are obscure URLs (security through obscurity is acceptable for non-sensitive content review) |

## Functional requirements

### Must have (MVP) -- all complete

- [x] **FR-01** Bookmarklet activation: a single bookmarklet click injects the Pinment annotation UI into the current page
- [x] **FR-02** Pin placement: click anywhere on the page to place a numbered marker at that position
- [x] **FR-03** Comment entry: each pin has an editable text comment and an optional author name
- [x] **FR-04** Comment panel: an overlay panel listing all comments by pin number, injected into the page by the bookmarklet
- [x] **FR-05** Share URL generation: serialize all state (target page URL, viewport width, pin coordinates, comments) into a compressed URL fragment
- [x] **FR-06** Annotation restore: when the bookmarklet is activated on the target page, the welcome modal attempts to pre-fill the share URL from the clipboard; the user can also paste manually. Valid URLs reconstruct all pins in their original positions.
- [x] **FR-07** Pin visibility toggle: show/hide all pins to see the page without annotation clutter
- [x] **FR-08** Hub site: a static GitHub Pages site where users can install the bookmarklet (drag to bookmarks bar), view annotation data from a share URL (with "Open target page" and "Copy share URL" action buttons), and show a clear error message when share data is corrupted or incomplete
- [x] **FR-09** URL capacity enforcement: the Share button is disabled when annotations exceed the ~8KB URL limit; the capacity indicator shows "over limit" with the actual size
- [x] **FR-10** Pin deletion confirmation: deleting a pin requires explicit confirmation to prevent accidental data loss

### Should have (v1.1)

- [x] **FR-11** Pin categories: label pins by type (text issue, layout issue, missing content, question)
- [x] **FR-12** Pin status: mark individual comments as resolved/open
- [x] **FR-13** Export: download annotations as a JSON file for archival or import
- ~~**FR-14** Multiple viewports: store annotations per viewport width so desktop and mobile reviews stay separate~~ — Addressed by element-based anchoring (pins stay on their target element across viewport sizes) and browser/device metadata (recipients see the original reviewer's viewport context)

### Could have (future)

- **FR-15** Browser extension: a more integrated version of the bookmarklet with toolbar icon and persistent state
- **FR-16** Integration with GitHub Issues: export pins as issues with coordinate and page context
- **FR-17** Comparison mode: view annotations from two reviewers side-by-side on the same page

## Non-functional requirements

- **NFR-01** No backend dependencies; entire tool runs client-side (bookmarklet + hub site)
- **NFR-02** URL state should support at least ~50 annotations before hitting browser URL limits (annotations without embedded images are much smaller)
- **NFR-03** Bookmarklet injection should complete in under 1 second
- **NFR-04** Works in Chrome, Firefox, Edge (latest versions)
- **NFR-05** Accessible: keyboard-navigable comment panel, sufficient colour contrast on pins
- **NFR-06** Bookmarklet must not break the host page's layout or functionality when deactivated

## Inspiration and prior art

The URL-as-state pattern at the heart of Pinment was prompted by Ahmad El-Alfy's [Your URL is your state](https://alfy.blog/2025/10/31/your-url-is-your-state.html) and explored further in [URLs are the state management you should use](https://allaboutken.com/posts/20251226-url-state-management/).

Two open-source projects store full documents in the URL hash, well beyond simple config toggles:

- **[Buffertab](https://github.com/AlexW00/Buffertab)** (MIT license) -- A markdown editor where the document lives entirely in the URL hash. Uses **pako** (zlib/deflate) for compression with a visual indicator showing how much URL capacity remains. Pinment borrows its compression strategy and capacity indicator from Buffertab. As an MIT-licensed project, its implementation can be referenced and adapted.
- **[Inkash](https://github.com/taqui-786/inkash)** (no license specified) -- Markdown editor plus freehand canvas drawing, also URL-hash-only. Adds QR code generation for sharing and export to PNG/SVG/HTML. Shows that canvas data can also fit in a URL.

Pinment extends this pattern from text and drawing to spatial annotation on live webpages: instead of encoding a document, we encode a set of positioned comments anchored to DOM elements on a page.

The element-based anchoring approach draws on techniques from:

- **[Hypothesis](https://web.hypothes.is/)** -- An open-source web annotation tool that pioneered element-anchored annotations on arbitrary webpages. Hypothesis uses XPath and text-based anchoring; Pinment uses CSS selectors with offset ratios for a more compact URL representation.
- **Browser DevTools** -- Chrome, Firefox, and Edge all implement CSS selector generation (used in "Copy selector") with similar strategies of preferring IDs and stable attributes over positional selectors.

## Technical approach

- **Bookmarklet:** Self-contained JS payload that injects the annotation UI (pin overlay, comment panel, share controls) into the host page; must be careful to scope CSS and avoid polluting the host page's global namespace
- **Hub site framework:** Vanilla JS or lightweight (Preact/Alpine.js) -- keep bundle small
- **State compression:** lz-string (browser-compatible, good compression for JSON text)
- **Hosting:** GitHub Pages from a public repo (also serves as the project's codebase)
- **URL structure:** `https://{org}.github.io/pinment/#data={compressed-base64-state}`
- **Local development:** Node.js with package.json for dependency management; Vite as the dev server and build tool; Vitest (or similar) for unit and integration testing
- **Bookmarklet build:** The bookmarklet source lives in the repo as a standard JS module; a build step bundles and minifies it into the `javascript:` URI format for installation

## Pin anchoring system

Pins are anchored to DOM elements rather than raw pixel coordinates. When a user clicks to place a pin, Pinment:

1. Uses `elementFromPoint` (with the click overlay temporarily hidden via `pointer-events: none`) to identify the DOM element under the click
2. Generates a stable CSS selector for that element, preferring stable identifiers: `id` > `data-testid` > semantic class names > `nth-of-type`
3. Stores the click position as offset ratios (0--1) within the element's bounding box
4. Also stores absolute pixel coordinates as a fallback

On restore, Pinment finds the element by its CSS selector and computes the pin position from the element's current bounding rect + stored offset ratios. This means pins stay in place across different viewport sizes and responsive layouts.

Shared annotations also include compact browser/device metadata so recipients see the reviewer's browser, viewport dimensions, and device type.

This approach draws on techniques used by [Hypothesis](https://web.hypothes.is/) (open-source web annotation tool that pioneered element-anchored web annotations) and browser DevTools CSS selector generation. The selector algorithm filters out framework-generated class names (CSS-in-JS hashes, state classes) and unstable IDs (hex hashes, pure numbers) to produce selectors that are stable across page loads.

## URL state schema (v2)

```json
{
  "v": 2,
  "url": "https://staging.example.com/about",
  "viewport": 1440,
  "env": {
    "ua": "C/130",
    "vp": [1440, 900],
    "dt": "d"
  },
  "pins": [
    {
      "id": 1,
      "s": "#main-content>article>h2:nth-of-type(1)",
      "ox": 0.45,
      "oy": 0.3,
      "fx": 648,
      "fy": 832,
      "author": "FL",
      "text": "This heading doesn't match the agreed title",
      "c": "text",
      "resolved": false
    }
  ]
}
```

Pin fields `c` (category) and `resolved` (status) are optional. Valid categories: `text`, `layout`, `missing`, `question`. When `resolved` is `true`, the pin is visually marked as resolved in both the bookmarklet panel and the hub site viewer.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| URL length limits in older browsers/tools | Annotations truncated or link fails | Compress aggressively; capacity indicator warns as usage grows; Share button disabled when over ~8KB limit with clear messaging; offer fallback export as JSON file (v1.1) |
| Bookmarklet blocked by CSP | Bookmarklet won't inject on pages with strict Content Security Policy | Document the limitation; most internal/staging sites have relaxed CSP; provide fallback instructions for adding Pinment as a local dev tool |
| Page layout changes between annotation and review | Pins drift from their intended positions | Pins are anchored to DOM elements via CSS selectors, making them resilient to viewport changes and responsive layouts; fallback pixel coordinates used when element can't be found; browser/device metadata shown so reviewer context is clear |
| No real-time collaboration | Users can't annotate simultaneously | Out of scope for MVP; share sequential URLs via chat |
| Recipient needs access to the target page | Can't view pins if page is behind auth or offline | Hub site shows annotations as a text list with coordinates, plus "Open target page" and "Copy share URL" buttons; bookmarklet overlay is the enhanced experience, not the only one |

## Success criteria

- A reviewer can annotate a live webpage and share the annotations via URL in under 2 minutes
- A recipient can view annotation data without installing anything or creating an account (via the hub site)
- A recipient with access to the target page can see pins overlaid in their original positions via the bookmarklet
- The tool is maintainable with zero ongoing cost

## Decisions made

| Question | Decision | Rationale |
|---|---|---|
| Bookmarklet scoping strategy (Q5) | Namespaced CSS classes (`pinment-*`) | Simpler than shadow DOM; avoids event-handling trade-offs; sufficient isolation for MVP; can upgrade to shadow DOM later if needed |
| Annotation restore trigger (Q6) | Clipboard pre-fill with manual paste fallback | Attempts `navigator.clipboard.readText()` to pre-fill the share URL; falls back to manual paste if clipboard access is denied; avoids needing the share hash in the target page's URL |
| Build pipeline | esbuild bundles bookmarklet into `javascript:` URI; Vite plugin injects into hub site HTML | Maintainable source code with proper modules; single minified output for the bookmarklet |
| CI/CD | GitHub Actions | Runs tests and builds on PRs; deploys to GitHub Pages on merge to main |
| Testing | Vitest with jsdom | TDD approach; fast test execution; compatible with Vite ecosystem |

## Open questions

1. Should we explore the W3C Web Annotation Data Model for the schema to align with Hypothesis and other tools?
2. Worth integrating with Teams (e.g. a Teams tab or bot that generates the link)?
