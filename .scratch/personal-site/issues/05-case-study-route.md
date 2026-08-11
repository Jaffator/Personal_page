# 05 — Case Study route

**What to build:** The Case Study — the most important page on the site — at its own URL, so it can be pasted directly into a job application.

Prose lives in one MDX document per locale, rendered through a single shared layout, per ADR 0002. Interface strings stay in dictionaries; Case Study prose does not. Keep that boundary — long prose trapped in string values cannot be formatted, escapes badly and produces unreadable diffs, and this is the most important writing on the site.

The layout composes named parts in order: an opening statement, a slot for the Walkthrough, an architecture overview, a Feature Tour, an ordered set of Deep Dives, and a closing retrospective. A Deep Dive is a repeatable unit — constraint, options weighed, choice made, what it cost — not bespoke markup written fresh per topic. Captioned figures can be placed within any Deep Dive.

Build against placeholder prose. Real copy is ticket 14; the Walkthrough player is ticket 08 and only its slot is needed here.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] The Case Study renders at its own URL, in both locales
- [ ] Prose is authored as MDX, one document per locale, through one shared layout
- [ ] Adding a Project's Case Study means adding documents, not writing a new component
- [ ] A Deep Dive is a repeatable unit that can be used three times without duplication
- [ ] Captioned figures can be placed inside a Deep Dive and are correctly associated with their caption
- [ ] The Walkthrough slot exists and renders nothing harmful when empty
- [ ] Heading order is correct and unbroken for screen-reader navigation
- [ ] A Case Study document missing in one locale fails the build rather than producing a broken page
- [ ] The page passes the verification suite in both locales and both themes
