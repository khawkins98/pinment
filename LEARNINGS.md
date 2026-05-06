# Learnings

Hard-won lessons from building and maintaining Pinment. Captured during the 2026-05 audit sweep — pull more in over time.

## URL is the database

Annotation state lives entirely in the URL fragment, compressed via lz-string and JSON-validated on read. That's the whole "no backend, no accounts" trick — but it has consequences:

- **URL length budget is real.** Browser address-bar limits, server log fields, chat-app previews, and email clients all truncate long URLs. Heavy sessions can bump up against that ceiling. Watch the share URL length when you add fields.
- **Referrer / log leakage.** Anything in the URL goes everywhere the URL goes — third-party referrer headers, server access logs, browser history. Don't put anything sensitive in pin text. Document this boldly.
- **lz-string + JSON-validate is the right input boundary.** Both the validation step and the `textContent`-everywhere render path together close the obvious XSS holes from URL-as-state. Don't bypass either when adding new fields.

## Bookmarklet loader pattern

The bookmarklet is intentionally a ~200-char loader that fetches the full script from the host site. This keeps the bookmarklet under browser URL limits (some browsers truncate long `javascript:` URIs aggressively) and means updates ship without users re-dragging the bookmark.

Tradeoff: the bookmarklet relies on the host site being reachable. Self-hosted forks must update the URL inside the loader before re-distributing.

## CSP is the silent killer

The bookmarklet silently fails on pages with a strict Content-Security-Policy that blocks injected scripts or inline event handlers. There's currently no user-facing fallback or feature-detection — the page just doesn't show any pinment UI. This bites on government, enterprise, and security-conscious sites.

A future improvement: detect the CSP failure mode and surface a one-line toast or open-in-new-tab fallback. Tracked in audit issue #13.

## Test surface is uneven

Selector generation, UI rendering, and drag-drop logic are not yet under unit test. The lz-string + JSON validation flow is the safest area; UI interaction tests are the gap. If you change DOM-attaching logic, expect manual cross-browser testing to catch the regressions automated tests miss.

## XSS surface stays small if you stay disciplined

The audit found the XSS surface "well-controlled" — `textContent` everywhere, no `innerHTML` on user data. That's fragile: one `innerHTML` slip on a pin comment field would undo it. Treat any new DOM-write as a code-review checkpoint.

---

Add new lessons as you find them. Cite a commit, PR, or upstream issue when possible.
