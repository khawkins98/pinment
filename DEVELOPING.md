# Developing Pinment

Use the [README](README.md#start-a-review) for the reviewer workflow. This guide
owns contributor commands, source layout and state details. Use Node.js 24 and
Yarn 1.22, as in [CI](.github/workflows/ci.yml).

## Run, test and build

```sh
yarn install --frozen-lockfile
yarn dev                 # Vite serves /pinment/ on its printed local origin
yarn test                # Vitest + jsdom
yarn build               # Site and standalone bookmarklet in dist/
yarn build:bookmarklet   # Standalone bookmarklet bundle only
```

Vite's base path is `/pinment/`. The landing page sets its bookmarklet loader URL
from the current origin and that base. During local work, install the local
**Pinment (Dev)** bookmarklet rather than the hosted production bookmarklet.
The production build and extension output are ignored build artifacts.

## Build the extension

```sh
yarn build
yarn build:extension
```

The packager uses an existing `dist/pinment-bookmarklet.js`, or builds one if
absent. Build the site/bookmarklet first after source changes so the extension
cannot reuse an old bundle. It writes `dist/extension/` with the manifest,
background worker, icons and bundled annotation script.

In Chromium, open `chrome://extensions`, enable Developer mode, choose **Load
unpacked**, and select `dist/extension/`. Use its toolbar action on the target
page. The source uses MV3 `activeTab`/`scripting` and `chrome.scripting.executeScript`;
it skips `chrome:`, `edge:`, `about:` and `chrome-extension:` pages. This guide
does not establish Firefox extension compatibility or a signed/store package.
Extension injection does not guarantee that CDN-loaded PDF export can pass a
page's own CSP.

## Project structure

```
src/state.js                  State schema v2, serialization, compression, import/export
src/selector.js               CSS selector generation, environment detection
src/version.js                Version and release date constants
src/bookmarklet/index.js      Bookmarklet entry point (IIFE)
src/bookmarklet/ui.js         Module re-export facade
src/bookmarklet/draft.js      Local draft auto-save and recovery
src/bookmarklet/styles.js     Injected CSS styles, SVG icons, and CSS reset
src/bookmarklet/pins.js       Pin DOM elements, drag positioning, target highlighting
src/bookmarklet/panel.js      Collapsible sidebar panel, pin listing, filter/sort
src/bookmarklet/modals.js     Dialogs: welcome, share/export, exit confirm, device warning
src/bookmarklet/pdf-export.js PDF export (html2canvas + jsPDF, CDN-loaded)
extension/                    Manifest V3 browser extension source & icons
js/app.js                     Hub site logic (viewer, import)
css/style.css                 Hub site styles
index.html                    Landing page and annotation viewer
tests/                        Vitest + jsdom tests
scripts/build-bookmarklet.js  Standalone bookmarklet build (esbuild)
scripts/build-extension.js    Extension packager (esbuild bundle + manifest)
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
| Bookmarklet vs. extension | Bookmarklet primary, MV3 extension optional | Bookmarklet installs as a browser bookmark; the MV3 action injects a bundled script when page CSP blocks the loader |
| Inline vs. dynamic loading | Dynamic `<script>` loader | Keeps the saved bookmark small; the full script is fetched from the host when activated |
| Live page vs. screenshot | Live page | Pins bind to DOM elements; screenshot export has its own cross-origin limits |
| URL hash vs. backend | URL hash (lz-string) | No annotation backend; the complete compressed URL must survive the sharing channel |
| Element selectors vs. pixel coords | Element selectors + pixel fallback | Relative offsets when selectors resolve; pixel fallback after DOM changes |
| CSS isolation | `all: initial` reset on root containers + scoped classes | Reduces interference from host-page typography and box-sizing rules while preserving light-DOM DOM queries and html2canvas screenshot support |

## Draft persistence

Drafts live in the target page origin's localStorage. Keys combine origin and
pathname, excluding query and fragment, so two URLs differing only by those
parts can offer the same draft. Recovery rejects drafts older than seven days
when they are read. Storage errors are ignored and sharing/import paths can clear
the draft; use JSON export for a lasting copy.

## Check the affected behavior

Run `yarn test` and `yarn build` before a PR. They exercise jsdom behavior and
production bundling; neither proves real-browser CSP, bookmarklet installation,
third-party layout resilience or PDF screenshot quality. For state/selector/loader
changes, follow [the risky-change checklist](CONTRIBUTING.md#testing-checklist-for-risky-changes)
and state which browser/page/CSP checks you actually ran.

## Maintaining documentation

Keep the complete reviewer/share workflow and adoption limits in README. Put
schema, source ownership and command details here; update the relevant home
instead of adding the same account to both pages. Check labels against the live
UI/source and preserve credits, PRD and dated CHANGELOG/LEARNINGS records. Prefer
specific limits to “works anywhere” or unlimited-capacity promises.
