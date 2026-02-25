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
| Coordinates on live page vs. screenshot | Live page coordinates | Eliminates manual screenshot step; pins are placed in real spatial context; viewport width is stored so reviewer context is preserved |
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

- **FR-11** Pin categories: label pins by type (text issue, layout issue, missing content, question)
- **FR-12** Pin status: mark individual comments as resolved/open
- **FR-13** Export: download annotations as a JSON file for archival or import
- **FR-14** Multiple viewports: store annotations per viewport width so desktop and mobile reviews stay separate

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

Pinment extends this pattern from text and drawing to spatial annotation on live webpages: instead of encoding a document, we encode a set of positioned comments anchored to coordinates on a page.

The final product should include a visible acknowledgement of these projects and the URL-as-state concept (e.g. an "about" section or footer linking to Buffertab, Inkash, and the original blog posts).

## Technical approach

- **Bookmarklet:** Self-contained JS payload that injects the annotation UI (pin overlay, comment panel, share controls) into the host page; must be careful to scope CSS and avoid polluting the host page's global namespace
- **Hub site framework:** Vanilla JS or lightweight (Preact/Alpine.js) -- keep bundle small
- **State compression:** lz-string (browser-compatible, good compression for JSON text)
- **Hosting:** GitHub Pages from a public repo (also serves as the project's codebase)
- **URL structure:** `https://{org}.github.io/pinment/#data={compressed-base64-state}`
- **Local development:** Node.js with package.json for dependency management; Vite as the dev server and build tool; Vitest (or similar) for unit and integration testing
- **Bookmarklet build:** The bookmarklet source lives in the repo as a standard JS module; a build step bundles and minifies it into the `javascript:` URI format for installation

## Coordinate system

Pin positions are stored relative to the page so they can be reconstructed on the same page at any viewport size:

- **x** -- ratio (0--1) relative to the viewport width at time of annotation
- **y** -- pixel offset from the top of the document (absolute, not relative to viewport height, since pages scroll)
- **viewport** -- the viewport width in pixels when the annotation was created, so the recipient knows the context and pins can be scaled or flagged if the viewport differs significantly

This approach is simple and avoids fragile DOM-selector-based targeting. The trade-off is that pins may drift if the page layout changes between annotation and review -- but that's an acceptable limitation for a review tool (if the page changed, you probably want fresh annotations anyway).

## URL state schema

```json
{
  "v": 1,
  "url": "https://staging.example.com/about",
  "viewport": 1440,
  "pins": [
    {
      "id": 1,
      "x": 0.45,
      "y": 832,
      "author": "FL",
      "text": "This heading doesn't match the agreed title"
    }
  ]
}
```

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| URL length limits in older browsers/tools | Annotations truncated or link fails | Compress aggressively; capacity indicator warns as usage grows; Share button disabled when over ~8KB limit with clear messaging; offer fallback export as JSON file (v1.1) |
| Bookmarklet blocked by CSP | Bookmarklet won't inject on pages with strict Content Security Policy | Document the limitation; most internal/staging sites have relaxed CSP; provide fallback instructions for adding Pinment as a local dev tool |
| Page layout changes between annotation and review | Pins drift from their intended positions | Store viewport width; warn if recipient's viewport differs significantly; accept as a known limitation (changed page = fresh review) |
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
