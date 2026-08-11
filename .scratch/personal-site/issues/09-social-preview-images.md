# 09 — Social preview images

**What to build:** When a link to this site is pasted into an application email, a chat client or a social post, it should render as a designed card rather than a bare URL. This is disproportionately valuable for the Case Study, which is the link most likely to be shared deliberately.

Preview images are generated at build time from the same design tokens as the site, so they cannot drift from it visually. Each route gets its own, in each locale, reflecting that page's title.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Every route has its own social preview image, in both locales
- [ ] Images are generated at build time from the design tokens, not hand-exported
- [ ] Each image reflects the title of the page it belongs to
- [ ] Social metadata is complete enough for the major platforms to render a large card
- [ ] Images use the correct dimensions and render legibly at typical preview sizes
- [ ] Adding a Project produces its preview image without manual work
- [ ] The build fails if a route is missing its preview image
