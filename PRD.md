# Pinment -- Product Requirements Document

---

## Problem

Reviewing webpage content -- especially unpublished or staging pages -- requires giving feedback that combines text comments with spatial context (where on the page the issue is). Current approaches are either expensive/proprietary (Marker.io, Pastel), limited to text-only review (Word track changes), or require screenshots that quickly go stale. There is no free, zero-infrastructure tool that lets a reviewer pin comments to a visual snapshot of a webpage and share the annotated view via a single URL.

## Proposed solution

Pinment is a static, client-side-only web application hosted on GitHub Pages. It allows users to annotate a screenshot of any webpage with pinned comments, then share the entire annotated state as a single URL. No backend, no accounts, no database.

## Core workflow

1. **Capture** -- User provides a screenshot image (upload, paste, or URL) of the page to review
2. **Annotate** -- User clicks anywhere on the screenshot to drop a numbered pin and add a comment
3. **Share** -- The tool serializes all annotations into a compressed URL fragment; sharing the URL recreates the full annotated view
4. **Review** -- Recipient opens the link and sees the screenshot with all pinned comments; can toggle pins on/off for clarity

## Key design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Screenshot vs. live iframe | Screenshot | Avoids CORS/X-Frame-Options issues; freezes page state so feedback doesn't drift |
| Storage | URL hash (compressed) | Zero infrastructure; shareable via any channel (Teams, email, chat) |
| Hosting | GitHub Pages | Free, no server to maintain |
| Auth | None | Simplicity; feedback links are obscure URLs (security through obscurity is acceptable for non-sensitive content review) |

## Functional requirements

### Must have (MVP)

- **FR-01** Image input: upload a screenshot (PNG/JPG), paste from clipboard, or provide an image URL
- **FR-02** Pin placement: click on the image to place a numbered marker
- **FR-03** Comment entry: each pin has an editable text comment and an optional author name
- **FR-04** Comment panel: sidebar or overlay listing all comments by pin number
- **FR-05** Share URL generation: serialize all state (image reference, pin coordinates, comments) into a compressed URL fragment using lz-string or pako
- **FR-06** URL restore: opening a Pinment URL fully reconstructs the annotated view
- **FR-07** Pin visibility toggle: show/hide all pins to see the clean screenshot
- **FR-08** Responsive layout: usable on desktop browsers (mobile is secondary)

### Should have (v1.1)

- **FR-09** Pin categories: label pins by type (text issue, layout issue, missing content, question)
- **FR-10** Pin status: mark individual comments as resolved/open
- **FR-11** Export: download annotated screenshot as PNG with pins baked in
- **FR-12** Multiple pages: support tabbed annotation of several screenshots in one session/URL

### Could have (future)

- **FR-13** Proxy screenshot capture: optional serverless function (e.g. Cloudflare Worker) to auto-capture a screenshot from a URL
- **FR-14** Comparison mode: overlay two screenshots (before/after) with shared pin positions
- **FR-15** Integration with GitHub Issues: export pins as issues with screenshot context

## Non-functional requirements

- **NFR-01** No backend dependencies; entire app runs client-side
- **NFR-02** URL state should support at least ~30 annotations before hitting browser URL limits (~8KB compressed in the hash)
- **NFR-03** Load time under 2 seconds on standard connection
- **NFR-04** Works in Chrome, Firefox, Edge (latest versions)
- **NFR-05** Accessible: keyboard-navigable comment panel, sufficient colour contrast on pins

## Technical approach

- **Framework:** Vanilla JS or lightweight (Preact/Alpine.js) -- keep bundle small
- **Image rendering:** HTML Canvas for pin overlay on screenshot
- **State compression:** lz-string (browser-compatible, good compression for JSON text)
- **Hosting:** GitHub Pages from a public repo (also serves as the project's codebase)
- **URL structure:** `https://{org}.github.io/pinment/#data={compressed-base64-state}`

## URL state schema (draft)

```json
{
  "v": 1,
  "img": "https://example.com/screenshot.png",
  "pins": [
    {
      "id": 1,
      "x": 0.45,
      "y": 0.32,
      "author": "FL",
      "text": "This heading doesn't match the agreed title",
      "type": "text",
      "resolved": false
    }
  ]
}
```

Coordinates are stored as ratios (0--1) relative to image dimensions to remain resolution-independent.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| URL length limits in older browsers/tools | Annotations truncated or link fails | Compress aggressively; warn user when approaching limit; offer fallback export as JSON file |
| Image hosted externally goes offline | Annotated view breaks | Offer option to base64-encode small images directly into state (increases URL size) |
| No real-time collaboration | Users can't annotate simultaneously | Out of scope for MVP; share sequential URLs via chat |
| Screenshot capture is manual | Extra friction in workflow | Acceptable for MVP; serverless capture is a future enhancement |

## Success criteria

- A reviewer can annotate a webpage screenshot and share it via URL in under 2 minutes
- A recipient can view the annotated page without installing anything or creating an account
- The tool is maintainable with zero ongoing cost

## Open questions

1. Should we use the UNDRR GitHub org or a personal repo for hosting?
2. Is there appetite to add this to the team's standard review workflow, or is it a supplementary tool?
3. Should we explore the W3C Web Annotation Data Model for the schema to align with Hypothesis and other tools?
4. Worth integrating with Teams (e.g. a Teams tab or bot that generates the link)?
