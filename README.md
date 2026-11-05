# Pinment

Pin comments to webpages you can access and share the annotations as a URL.
No Pinment backend or account is required.

[Open Pinment](https://www.allaboutken.com/pinment/) · [Introducing Pinment](https://www.allaboutken.com/posts/20260225-introducing-pinment/) · [Changelog](CHANGELOG.md)

## Start a review

1. Open Pinment and drag its **Pinment** button to your bookmarks bar.
2. Visit the page you want to review, then click that bookmarklet.
3. Choose **Start annotating on this page**, click a location and save your comment.
4. Choose **Share & Export**, then **Copy**. If copying fails, select
   the displayed URL and copy it manually.

You can drag pins, reply to comments, assign categories, resolve items and filter
the list. Switch to **Browse (Esc)** to interact with the underlying page and
**Add pins (N)** to place more pins.

## Open a shared review

Open the shared URL to see the comment list. If you have not installed Pinment,
drag the hub's **Pinment** button to your bookmarks bar first. Choose **Open target
page**, follow **Open page →**, then click your Pinment bookmark on that page to
load the pins. You still need access to the target page, including any login.

If the pins do not load automatically, paste the original share URL into
**Paste a share URL to load annotations** in the bookmarklet's welcome dialog
and choose **Load**. Replies and edits need a newly shared URL; links are snapshots,
not a live collaboration session.

## Restore a JSON review

Use **Download JSON** in Share & Export to keep a portable copy or send a review
that exceeds the app's 8,000-byte URL budget. JSON contains the same review data.
[Install Pinment](#start-a-review) and visit the target URL recorded in the file.
If you need to find that URL, the hub's **Import JSON** displays it.

On the reviewed page, activate Pinment and select **Choose JSON file…** in its
welcome dialog. An active session also has **Import from JSON**; it asks before
replacing existing pins. Import large reviews directly on the target page: the
hub's **Open target page** puts the data back into a URL.

Send the JSON file itself to share an imported review. The hub's **Copy share URL**
copies its address; importing a file does not add that review to the address.

## Sharing and storage

Share links contain the target URL, comments, authors/replies and browser/viewport
metadata. Compression is not encryption: anyone with the complete link can read
that state. Check for sensitive comments or query-string tokens before sharing.

Drafts are stored in the reviewed page's origin in this browser. Recovery can
help after a reload, but storage can be blocked or cleared; it is not a backup.
Scripts on that page can read its localStorage and the injected review UI.
[Draft behavior](DEVELOPING.md#draft-persistence) is documented for contributors.

**Download PDF** produces a screenshot/comment report and loads html2canvas and
jsPDF from a CDN on demand. It needs network access; CSP or cross-origin image
restrictions can prevent export or omit content.
Review the PDF before sharing: its screenshot can include page content beyond
the comments.

## Limits and the extension

- Strict CSP can block the bookmarklet's external-script loader. The optional
  [unpacked Chromium extension](DEVELOPING.md#build-the-extension) injects its
  bundled script instead; browser-internal pages remain restricted.
- Changed DOM elements can make pins fall back to saved pixel coordinates.
  Check placement when revisiting a changed page or a different viewport.
- Share state omits the target page's original URL fragment. For hash-routed pages,
  navigate to the intended route yourself, activate Pinment, then paste the share
  URL into its welcome dialog and choose **Load**. Check placement on that route.
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
