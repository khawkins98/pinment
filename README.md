# Pinment

Pin comments to webpages you can access and share the annotations as a URL.
No Pinment backend or account is required.

[Open Pinment](https://www.allaboutken.com/pinment/) · [Introducing Pinment](https://www.allaboutken.com/posts/20260225-introducing-pinment/) · [Changelog](CHANGELOG.md)

## Start a review

1. Open Pinment and drag its **Pinment** button to your bookmarks bar.
2. Visit the page you want to review, then click that bookmarklet.
3. Choose **Start annotating on this page**, click a location and save your comment.
4. Choose **Share & Export**, then copy the share URL. If copying fails, select
   the displayed URL and copy it manually.

You can drag pins, reply to comments, assign categories, resolve items and filter
the list. Switch to **Browse (Esc)** to interact with the underlying page and
**Add pins (N)** to place more pins.

## Open a shared review

Open the shared URL to see the comment list. Choose **Open target page**, follow
**Open page →**, then activate Pinment on that page to load the pins. You still
need access to the target page; a review link does not bypass login or permissions.

If the pins do not load automatically, paste the original share URL into
**Paste a share URL to load annotations** in the bookmarklet's welcome dialog
and choose **Load**. Replies and edits need a newly shared URL; links are snapshots,
not a live collaboration session.

## Sharing and storage

Share links contain the target URL, comments, authors/replies and browser/viewport
metadata. Compression is not encryption: anyone with the complete link can read
that state. Check for sensitive comments or query-string tokens before sharing.

Use **Download JSON** in Share & Export to keep a portable copy or handle a review
that exceeds the app's 8,000-byte URL budget. JSON contains the same review data.
Drafts are stored in the reviewed page's origin in this browser. Recovery can
help after a reload, but storage can be blocked or cleared; it is not a backup.
[Draft behavior](DEVELOPING.md#draft-persistence) is documented for contributors.

**Download PDF** produces a screenshot/comment report and loads html2canvas and
jsPDF from a CDN on demand. It needs network access; CSP or cross-origin image
restrictions can prevent export or omit content.

## Limits and the extension

- Strict CSP can block the bookmarklet's external-script loader. The optional
  [unpacked Chromium extension](DEVELOPING.md#build-the-extension) injects its
  bundled script instead; browser-internal pages remain restricted.
- Changed DOM elements can make pins fall back to saved pixel coordinates.
  Check placement when revisiting a changed page or a different viewport.
- Share state omits the target page's original URL fragment. For hash-routed pages,
  navigate to the intended route separately before loading the review in Pinment.
- The interface is desktop-oriented. Mobile displays a warning and lets you continue.

## Develop locally

Use **Node.js 24** and **Yarn 1.22**, matching CI and the committed lockfile:

```sh
yarn install --frozen-lockfile
yarn dev
yarn test
```

[Developing Pinment](DEVELOPING.md) covers builds, the extension, source layout,
state encoding and validation. [Contributing](CONTRIBUTING.md) describes PRs.

## Background & inspiration

Pinment grew out of frustration with existing webpage feedback tools -- they're either paid services requiring accounts and logins, or heavyweight browser extensions. I wanted something free, simple, and stateless: drop pins on a page, share a URL, done.

Inspired by:

- The URL-as-state pattern from [Ahmad El-Alfy](https://alfy.blog/2025/10/31/your-url-is-your-state.html) -- the idea that the URL can be the entire persistence layer
- [Buffertab](https://github.com/AlexW00/Buffertab) -- using compressed URL fragments to store structured data without a backend
- [Inkash](https://github.com/taqui-786/inkash) -- bookmarklet-driven page annotation
- [Hypothesis](https://web.hypothes.is/) -- open web annotation as a concept

## License

[MIT](LICENSE) — Copyright (c) 2026 Ken Hawkins
