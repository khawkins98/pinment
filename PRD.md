# Pinment -- Product Requirements Document

## Problem

Reviewing webpage content -- especially unpublished or staging pages -- requires feedback that combines text comments with spatial context ("this heading", "that image", "the gap between the nav and the hero"). Current approaches are either expensive/proprietary (Marker.io, Pastel), limited to text-only review (Word track changes), or require screenshots that go stale the moment someone pastes them into a chat. There is no free, zero-infrastructure tool that lets a reviewer pin comments directly to a live webpage and share the annotated view via a single URL.

## Solution

Pinment is a client-side bookmarklet that injects an annotation UI onto any live webpage. Reviewers place numbered pins with comments, then share the entire annotated state as a compressed URL fragment. No backend, no accounts, no database. The URL is the review.

## Core workflow

1. **Install** -- Drag the Pinment bookmarklet to the bookmarks bar (one-time setup)
2. **Navigate** -- Go to the page to review (published, staging, localhost, or behind auth)
3. **Annotate** -- Click anywhere on the page to drop a numbered pin and add a comment
4. **Share** -- Hit Share to copy a link. Recipient opens the page, clicks the bookmarklet, and the share URL is pre-filled from their clipboard

## Key design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Bookmarklet vs. browser extension | Bookmarklet | No install/approval process; works cross-browser immediately |
| Live page vs. screenshot | Live page | Pins bind to real DOM elements; avoids CORS/X-Frame-Options issues; no screenshot capture needed |
| Element selectors vs. pixel coords | Element selectors + pixel fallback | Resilient to viewport/responsive changes; pixel fallback when DOM changes |
| Storage | URL hash (compressed) | Zero infrastructure; shareable via any channel (Teams, email, chat) |
| Compression | lz-string | Browser-compatible, good compression for JSON text, URL-safe encoding |
| Hosting | GitHub Pages | Free, no server to maintain, auto-deploys via GitHub Actions |
| CSS isolation | Namespaced classes (`pinment-*`) | Simpler event handling than shadow DOM; sufficient for bookmarklet use |
| Bookmarklet delivery | Dynamic `<script>` loader | Inline `javascript:` URI exceeded Firefox's ~65KB bookmark limit; loader is ~200 chars and fetches the full script from the host site |
| Auth | None | Simplicity; feedback links are obscure URLs (acceptable for non-sensitive content review) |

## Functional requirements

### Implemented

- **FR-01** Bookmarklet injection: inject annotation UI onto any page via a dynamically loaded script
- **FR-02** Pin placement: click on the page to place a numbered marker anchored to a DOM element
- **FR-03** Comment entry: each pin has an editable text comment and an optional author name
- **FR-04** Comment panel: fixed sidebar listing all comments by pin number
- **FR-05** Share URL generation: serialize state into a compressed URL fragment using lz-string
- **FR-06** URL restore: pasting a Pinment share URL in the welcome modal reconstructs all annotations
- **FR-07** Pin visibility toggle: show/hide all pins to see the clean page
- **FR-08** Responsive awareness: viewport/device metadata captured and shown to recipients
- **FR-09** Welcome modal: start fresh, load from share URL, or import from JSON
- **FR-10** Exit confirmation: warns about unsaved annotations with option to copy share URL
- **FR-11** Pin categories: label pins as text issue, layout issue, missing content, or question
- **FR-12** Pin status: mark individual pins as resolved/open
- **FR-13** JSON export: download annotation state as a JSON file
- **FR-14** JSON import: load annotations from a previously exported JSON file
- **FR-15** Pin drag-and-drop: reposition pins by dragging; recalculates element anchor on drop
- **FR-16** Thread replies: reply to any pin to create a conversation; replies persist in share URL
- **FR-17** Hub site viewer: web page that decodes share URLs and displays annotation summary
- **FR-18** Clipboard pre-fill: welcome modal detects share URL on clipboard and pre-fills
- **FR-19** Panel minimize/restore: collapse panel to a floating pill button
- **FR-20** URL capacity indicator: visual bar showing how close annotations are to the ~8KB limit
- **FR-21** Author persistence: author name saved to localStorage across sessions
- **FR-22** Dynamic bookmarklet loading: tiny `javascript:` loader (~200 chars) fetches the full script from the host site, removing browser bookmark URL size limits and enabling instant updates without re-installing
- **FR-23** Version display: panel footer shows current version and release date

### Future

- **FR-24** Browser extension: bypass CSP restrictions, enable richer UX
- **FR-25** GitHub Issues export: export pins directly as GitHub issues
- **FR-26** Multi-reviewer comparison: merge/diff annotations from multiple share URLs
- **FR-27** Keyboard shortcuts: Esc to cancel pin mode, N for new pin, arrows to navigate
- **FR-28** Filter/sort pins: by category, status, or author

## Non-functional requirements

- **NFR-01** No backend dependencies; entire app runs client-side
- **NFR-02** URL state supports ~50 annotations before hitting the ~8KB URL limit
- **NFR-03** Works in Chrome, Firefox, Edge (latest versions)
- **NFR-04** Bookmarklet CSS uses `pinment-*` namespace to avoid conflicts with host pages
- **NFR-05** Comprehensive test coverage (Vitest + jsdom)

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

### Pin fields

| Field | Type | Description |
|---|---|---|
| `id` | number | Unique pin identifier |
| `s` | string\|null | CSS selector for the anchored DOM element |
| `ox`, `oy` | number\|null | Offset ratios (0-1) within the element's bounding box |
| `fx`, `fy` | number | Absolute pixel coordinates (fallback) |
| `author` | string | Author name (optional) |
| `text` | string | Comment text |
| `c` | string | Category: `text`, `layout`, `missing`, or `question` (optional) |
| `resolved` | boolean | Whether the issue is resolved (optional) |
| `replies` | array | Reply objects with `author` (optional) and `text` (optional) |

### Selector algorithm

Priority: IDs > `data-testid` attributes > stable class names > `nth-of-type` chains. Selectors are generated at pin-placement time and stored in the URL. If a selector fails to resolve at view time, the pin falls back to pixel coordinates and shows a warning badge.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| URL length limits | Annotations truncated or link fails | Capacity indicator warns at 60%; share disabled at 100%; JSON export as fallback |
| CSP-blocked pages | Bookmarklet can't inject | Documented limitation; browser extension planned as future enhancement |
| DOM changes between annotation and viewing | Pins appear in wrong location | Element-based anchoring with pixel fallback; warning badge when selector fails |
| No real-time collaboration | Users can't annotate simultaneously | Sequential URL sharing via chat/email; multi-reviewer comparison planned |

## Success criteria

- A reviewer can annotate a live webpage and share the review via URL in under 2 minutes
- A recipient can view annotations without installing anything or creating an account
- The tool is maintainable with zero ongoing cost
