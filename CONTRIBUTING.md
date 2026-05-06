# Contributing

Thanks for your interest in Pinment. Contributions are welcome — this is a small project, so the process is light.

## Filing issues

Open an issue at https://github.com/khawkins98/pinment/issues. Useful detail:

- Browser + OS
- The page you tried to annotate (or a publicly reachable equivalent)
- Whether the page sets a strict CSP (the bookmarklet silently fails on some)
- A short repro

Security-sensitive reports: see `SECURITY.md` if present, otherwise email the maintainer directly rather than filing publicly.

## Proposing changes

1. Fork the repo and branch off `main`.
2. Run `npm install`, then `npm run dev` for the local site and `npm test` for the Vitest suite.
3. Open a pull request as a **draft** while you iterate, then mark ready for review.

If your change touches the URL-state encoding, the lz-string compression boundary, or the bookmarklet loader, please call that out in the PR body — those areas are XSS-sensitive and benefit from extra review.

## Branch and commit style

- Branches: descriptive, e.g. `feat/pdf-export`, `fix/mobile-warn`.
- Commits: short, imperative. Recent history mixes plain summaries and Conventional Commits — match what's nearby.

## Local development

The full quick-start lives in the [README](README.md#quick-start). In short: `npm install && npm run dev`. Tests are Vitest (`npm test`). Build is Vite.

## Testing checklist for risky changes

When touching URL state, selectors, or anything that runs on a live page:

- Test on at least one real third-party site (long URL, varied DOM)
- Check that the share URL round-trips losslessly
- Verify behaviour on a CSP-strict page (or note that you couldn't)

## Review

Best-effort, no SLA — usually within a week. Draft PRs are fine for early feedback.

## License

MIT. See [LICENSE](LICENSE).
