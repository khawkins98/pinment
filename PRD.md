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

## Success criteria

- A reviewer can annotate a live webpage and share the review via URL in under 2 minutes
- A recipient can view annotations without installing anything or creating an account
- The tool is maintainable with zero ongoing cost

## Future ideas

- Browser extension to bypass CSP restrictions and enable richer UX
- GitHub Issues export: export pins directly as GitHub issues
- Multi-reviewer comparison: merge/diff annotations from multiple share URLs
