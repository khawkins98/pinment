# Pinment

Pin comments to a screenshot. Share the annotated view as a single URL. No backend, no accounts, no database.

## What it does

Pinment is a static, client-side web tool for reviewing webpage drafts and designs. You upload or paste a screenshot, click anywhere on it to drop numbered pins with comments, and hit share. The entire annotated state -- image reference, pin coordinates, comments -- gets compressed into a URL fragment. Anyone who opens that link sees exactly what you see.

## Why it exists

Reviewing unpublished web content requires feedback that combines text with spatial context: *this* heading, *that* image, the gap between the nav and the hero. Current options are either expensive (Marker.io, Pastel), limited to text-only (Word track changes), or require screenshots that go stale the moment someone pastes them into a chat. There's no free, zero-infrastructure tool that lets you pin comments to a visual snapshot and share via URL.

## How it works

1. **Capture** -- Upload a screenshot (PNG/JPG), paste from clipboard, or provide an image URL
2. **Annotate** -- Click anywhere on the image to drop a numbered pin and add a comment
3. **Share** -- Pinment serializes all state into a compressed URL fragment (lz-string)
4. **Review** -- Recipient opens the link; full annotated view reconstructs automatically

No server. No login. The URL *is* the document.

## Technical approach

- Static site hosted on GitHub Pages
- Vanilla JS or lightweight framework (Preact/Alpine.js) -- small bundle
- HTML Canvas for pin overlay
- State compression via lz-string into the URL hash
- Coordinates stored as ratios (0--1) relative to image dimensions, so pins are resolution-independent

## Status

Early development. See [PRD.md](PRD.md) for full requirements and design decisions.
