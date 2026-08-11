# 01 — Scaffold and verification harness

**What to build:** A working site that serves one placeholder page, together with the automated checks that prove any page meets the craft bar. After this ticket, a single command builds the site for production and reports whether the output is accessible, fast, correctly sized on a small phone, and free of markup problems. Every later ticket is verified through this same harness, so it exists first rather than being retrofitted.

The seam is the built site — not components, not internals. Tests drive a real browser against production output and assert only what a Reader could observe.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A production build completes without errors or warnings
- [ ] One placeholder route renders and is served from the build output
- [ ] A single command runs the whole verification suite against the built site
- [ ] Accessibility scanning runs against built pages and reports violations as failures
- [ ] Performance, accessibility, best-practices and SEO audits run and fail below a threshold of 95
- [ ] A check fails when the page overflows horizontally at 360 pixels wide
- [ ] Every interactive element is reachable by keyboard, in order, with a visible focus indicator — asserted, not assumed
- [ ] The suite fails loudly when a check regresses, and is suitable for running before every commit
