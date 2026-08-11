# 14 — Write the copy, English and Czech

**What to build:** Every word on the site, in both languages. This is the largest single body of work in the project and the part that most determines whether it succeeds — the design serves the writing, not the other way round.

The Case Study is the bulk of it: an opening, an architecture overview, a Feature Tour kept deliberately tight, three Deep Dives, and a closing retrospective. The Feature Tour must stay short — its job is to prove the Project is a complete product, and if it sprawls it buries the reasoning that follows.

The three Deep Dives:

1. **From webhook to wear** — why the Strava integration is a separate service, the two-stage queue and the handoff between them, database-per-service and the shared contracts library, and how failures are handled.
2. **Auth on native and web** — one identity across two platforms, Google sign-in on each, token storage and refresh.
3. **Getting bike data** — no suitable API existed, so the data is scraped: its shape, validation and testing.

Each Deep Dive states the constraint before the solution, weighs the alternatives that were genuinely considered, and says what the chosen approach cost. What it cost is the part most portfolios omit and the part a technical Reader is actually reading for.

The Gemini queue processor and the i18n audit agent belong inside the architecture overview as evidence of AI used as a component of the system — not as their own section, and never as a productivity claim.

Czech is written as Czech, not translated from the English. A stilted translation reads worse than no Czech at all.

Not agent work — only Jaroslav knows what these decisions actually cost.

**Blocked by:** None — can start immediately.

**Status:** ready-for-human

- [ ] Hero, About, stack groupings and contact copy written in both languages
- [ ] Case Study opening, architecture overview and retrospective written in both languages
- [ ] Feature Tour written and kept short enough not to bury the Deep Dives
- [ ] All three Deep Dives written, each stating constraint, alternatives considered, choice made and what it cost
- [ ] The retrospective says honestly what would be done differently
- [ ] The Gemini queue and i18n audit agent appear within the architecture overview, not as a separate section
- [ ] No Google Play claim anywhere until a listing exists
- [ ] BikeCheck described as Capacitor, never as React Native
- [ ] No junior or first-role self-label
- [ ] Czech reads as natural Czech rather than as a translation
- [ ] Figure captions written for every screenshot, in both languages
