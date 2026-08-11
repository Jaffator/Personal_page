# 02 — Design system: tokens, fonts, base typography

**What to build:** The visual foundation every component is built on. Colour, type scale, spacing, rule weights and focus treatment are defined once as named tokens. Light is the default; dark is the same token names resolved to different values, following the Reader's system preference, so the dark theme is never a second implementation. Typography is a modern grotesk paired with a monospace, both self-hosted so no third-party request is made and no layout shift occurs on load.

This is the editorial register made concrete: strong hierarchy, generous whitespace, hairline rules, one accent colour. Monospace is reserved for metadata — section indices, stack tags, dates — and is never used for running prose.

Tokens come before any component, deliberately. Building components against raw values first turns the dark theme into a rewrite.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Colour, type scale, spacing, rules and focus are defined as named tokens in one place
- [ ] Components can reference tokens only; raw colour and size values are not used in component code
- [ ] The site follows the Reader's system colour preference with no flash of the wrong theme on load
- [ ] Both themes resolve from the same token names
- [ ] Grotesk and monospace are self-hosted, with no external font request in the built output
- [ ] No layout shift attributable to font loading
- [ ] The placeholder page renders in the editorial register and passes the full verification suite in both themes
- [ ] Text contrast meets accessibility requirements in both themes
