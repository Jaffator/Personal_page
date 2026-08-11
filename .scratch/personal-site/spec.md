---
title: Personal site — Jaroslav Lufinka
labels: [ready-for-agent]
status: ready
---

# Personal site

## Problem Statement

Jaroslav Lufinka is looking for his first developer role on the Czech market. He has taught himself to build software and has one substantial Project, BikeCheck, but nothing that lets a hiring engineer discover or evaluate that work. A CV alone cannot carry the argument: it asserts competence where the situation demands proof, and it gives a technical Reader nothing to click into.

The specific difficulty is that BikeCheck cannot be demonstrated the usual way. It is an Android application built with Capacitor, it is not published to Google Play, and its backend is not deployed anywhere a stranger can reach. So the site must convince a Reader that a real, working, non-trivial system exists without being able to hand them a link that runs it.

A second difficulty is calibration. Because Jaroslav has no commercial experience, a Reader's default assumption is that the work will be tutorial-grade. The site has to defeat that assumption early, with evidence rather than assertion, before the Reader has finished forming a view.

## Solution

A small, deliberately designed personal site at `jardalufi.cz` whose entire purpose is to make a technical Reader want to start a conversation.

It presents one Project in real depth rather than several in outline. A home page states who Jaroslav is and what he has built, then hands off to a Case Study at its own URL — a link that can be pasted directly into a job application. The Case Study establishes scope with a Feature Tour, then proves reasoning with three Deep Dives that each open up a single hard problem: the constraint, the options weighed, the choice made, and what it cost.

In place of a live demo, a Walkthrough — a silent screen recording of the real application running — carries the proof that the software works, supported by captioned stills throughout the Deep Dives. Proof Links point outward so the Reader can verify independently.

The site is bilingual, English at the root and Czech under a prefix, and is built to hold more than one Project so that lufihome can be added later as content rather than as a redesign.

The design is editorial and restrained: strong typographic hierarchy, generous whitespace, monospace reserved for metadata. The technical character comes from precision and from the quality of the artefact itself — a Reader who opens developer tools or runs Lighthouse should find the page as considered as the work it describes.

## User Stories

### Reader — forming a first impression

1. As a Reader, I want to understand within seconds what Jaroslav builds, so that I can decide whether to keep reading.
2. As a Reader, I want the opening statement to reference something he actually shipped, so that I am evaluating evidence rather than a self-description.
3. As a Reader, I want to see the technologies he works in without hunting, so that I can match him against an open role.
4. As a Reader, I want the stack presented as an honest grouped list with no proficiency bars or star ratings, so that I am not put off by a claim that cannot be true.
5. As a Reader, I want the page to load immediately, so that my impression of his craft starts well.
6. As a Reader arriving on a phone, I want the page to work properly at small widths, so that I can read it wherever I opened the link.

### Reader — evaluating the work

7. As a Reader, I want a single obvious route into the main Project, so that I do not have to choose between several equally weighted options.
8. As a Reader, I want to watch the application actually running, so that I can believe it exists and works.
9. As a Reader, I want the Walkthrough to start on my action rather than autoplay, so that the page does not surprise me.
10. As a Reader, I want the Walkthrough to show a real task from start to finish, so that I can judge the product rather than a montage of screens.
11. As a Reader, I want to see how the system is structured before reading detail, so that the Deep Dives have something to attach to.
12. As a Reader, I want a brief tour of what the Project does, so that I can judge whether it is a complete product or a demo.
13. As a Reader, I want the Feature Tour to stay short, so that it does not bury the reasoning that follows.
14. As a Reader, I want each Deep Dive to state the constraint before the solution, so that I can judge whether the solution was warranted.
15. As a Reader, I want to see which alternatives were considered and rejected, so that I can assess judgement rather than recall.
16. As a Reader, I want to know what each decision cost, so that I can tell whether the author understands trade-offs or only benefits.
17. As a Reader, I want to read what he would do differently with hindsight, so that I can gauge self-assessment — a strong signal in interview.
18. As a Reader, I want to see evidence of a domain modelled, got wrong, and corrected, so that I know the schema was reasoned about rather than guessed.
19. As a Reader, I want captioned screenshots inside the Deep Dives, so that the prose stays anchored to the real interface.
20. As a Reader interested in the AI aspects, I want to see AI used as a component of the system, so that I can distinguish engineering from a productivity claim.
21. As a Reader, I want to reach the source repository if I want it, so that I can look at the code on my own terms.
22. As a Reader, I want the maturity of the repository stated honestly, so that I judge it as work in progress rather than as a finished release.

### Reader — Czech language

23. As a Czech-speaking Reader, I want the site available in Czech, so that I can read it in my first language.
24. As a Czech-speaking Reader, I want the language switch to be visible without hunting, so that I can change language on arrival.
25. As a Czech-speaking Reader, I want the switch to keep me on the page I was reading, so that I do not lose my place.
26. As a Reader, I want the language choice to feel complete rather than half-applied, so that the site does not appear unfinished.

### Recruiter and process

27. As a recruiter, I want a downloadable CV, so that I can attach it to an internal system.
28. As a recruiter, I want to know which city he is in and whether he is open to remote, so that I do not have to write and ask.
29. As a recruiter, I want his email visible as text, so that I can copy it without a form standing in the way.
30. As a recruiter, I want a one-click copy for the email, so that I do not mistype it.
31. As a recruiter, I want his LinkedIn and GitHub linked, so that I can carry out my usual checks.
32. As a recruiter, I want no cookie banner, so that the page does not obstruct a quick look.

### Reader — sharing and discovery

33. As a Reader, I want the Case Study to have its own URL, so that I can send it to a colleague without instructions.
34. As Jaroslav, I want the link to render as a designed card when pasted into email or a chat client, so that it looks considered wherever it travels.
35. As a Reader searching his name, I want the site to be findable, so that I reach it without being given the address.
36. As a Reader, I want each page to carry its own title and description, so that a tab or a search result tells me what it is.

### Accessibility and preferences

37. As a keyboard-only Reader, I want to reach every interactive element by tab, so that I can use the site without a mouse.
38. As a keyboard-only Reader, I want the focused element clearly marked, so that I always know where I am.
39. As a Reader using a screen reader, I want correct landmarks and heading order, so that I can navigate by structure.
40. As a Reader who prefers dark interfaces, I want the site to follow my system setting, so that it matches the rest of my environment.
41. As a Reader sensitive to motion, I want animation suppressed when I have asked the system to reduce it, so that the page is comfortable.
42. As a Reader, I want the Walkthrough to carry captions or an accompanying description, so that it communicates without sound.

### Jaroslav — maintenance and growth

43. As Jaroslav, I want to add lufihome later as content, so that a second Project does not require rebuilding the site.
44. As Jaroslav, I want Selected Work to look deliberate with a single Project, so that the site is not visibly waiting to be filled.
45. As Jaroslav, I want a place for the Google Play badge that stays hidden until the listing exists, so that publishing is a content change.
46. As Jaroslav, I want to write Case Study prose as prose rather than as string values, so that writing is not obstructed by the translation mechanism.
47. As Jaroslav, I want structured content typed, so that a missing field fails at build rather than in front of a Reader.
48. As Jaroslav, I want to know whether anyone reads the Case Study, so that I can tell whether the site is doing its job.
49. As Jaroslav, I want the site's own repository to be presentable, so that it stands as a second work sample.
50. As Jaroslav, I want the craft commitments checked automatically, so that they do not decay as I make changes.

## Implementation Decisions

### Framework and rendering

- Next.js with the App Router, statically generated. Recorded with its justification in ADR 0001 — the choice is deliberately not the lightest tool for the content, and should not be "corrected" to Astro or plain HTML without revisiting that ADR.
- No runtime server behaviour and no runtime data fetching. If a requirement ever demands one, the rationale for Next.js weakens and the ADR must be revisited rather than quietly amended.

### Locale handling

- Two locales, English and Czech. English is served from the root and Czech from a prefix, per ADR 0003. The asymmetry is intentional so the English URL — the one pasted into applications and indexed by search — stays clean.
- The default locale requires special-casing in routing and in the language switch. This is accepted.
- The language switch preserves the current route, resolving to the equivalent page in the other locale rather than returning to the home page.
- Both locales declare `hreflang` and a canonical URL so neither is treated as duplicate content.

### Content

- Two content mechanisms with a firm boundary, per ADR 0002. Interface strings live in typed per-locale dictionaries; Case Study prose lives in one MDX document per locale rendered through a single shared layout. Do not migrate one into the other.
- Structured content — the Project list, stack groupings, contact details, Proof Links — lives in a typed module so that a missing or malformed field fails the build.
- The Project list is modelled as a collection from the outset and rendered as such, even while it holds one entry. Adding lufihome must be a content change, not a structural one.
- The Case Study composes from named parts: an opening statement, the Walkthrough, an architecture overview, a Feature Tour, an ordered set of Deep Dives, and a closing retrospective. A Deep Dive is a repeatable unit, not bespoke markup per topic.
- Proof Links are data on a Project, each carrying its own kind and optional qualifying note. A Play Store listing is modelled but absent, so that publishing later adds a value rather than changing a component. The source Proof Link carries a note marking the repository as actively in development.

### Design system

- Design tokens are defined as CSS custom properties before any component is written: colour, type scale, spacing, rules and focus treatment. Light is the default and dark is derived from the same token names, following the system preference. Components reference tokens only, never raw values, so the dark theme is never a second implementation.
- Tailwind v4 with its theme bound to those tokens. No component library — neither Mantine nor shadcn/ui. Every component is hand-built. The component inventory is small and deliberately closed: navigation with language switch, hero, project row, section heading with index, stack group, walkthrough player, figure with caption, deep dive block, contact block, footer.
- Editorial register: strong typographic hierarchy, generous whitespace, hairline rules, a single accent colour. Monospace is reserved for metadata — section indices, stack tags, dates — and never used for running prose.
- A modern grotesk paired with a monospace, both self-hosted through the framework's font pipeline so there is no third-party request and no layout shift on load.

### Motion

- CSS-first. A restrained baseline of scroll-reveal, hover transitions and focus treatment, plus two or three deliberate signature moments. No animation library unless a specific moment cannot be expressed in CSS.
- All motion is suppressed under a reduced-motion preference, including the scroll-reveal baseline, which must therefore never be the mechanism that makes content visible.

### Walkthrough and imagery

- The Walkthrough is a self-hosted video with a poster image, played on the Reader's action rather than autoplaying. It must not become the largest contentful paint element or block interaction.
- The Walkthrough is silent, so its content is conveyed by captions or an accompanying textual description rather than by audio.
- Screenshots are captioned and paired with the Deep Dive they illustrate. Images are sized and formatted so that the performance budget holds.

### Metadata and sharing

- Every route declares its own title, description, canonical URL and social metadata in both locales.
- Social preview images are generated at build time from the same design tokens, so a shared link renders as a designed card rather than a bare URL.

### Contact, CV and analytics

- Contact is presented as visible text with a copy action, alongside links to GitHub and LinkedIn and a stated location and work preference. No contact form and therefore no backend, no external form service, and no failure mode in which a message is silently lost.
- The CV is a static PDF asset served from the site and versioned alongside it, so it cannot drift from what is deployed.
- Cookieless analytics only, so that no consent banner is required.

### Deployment

- Deployed to Vercel and served from the registered domain `jardalufi.cz`.
- The site's own repository is public, with a README that treats it as a work sample.

## Testing Decisions

### What makes a good test here

A good test asserts what a Reader can observe in the built site. It does not reach into components, assert on class names, or restate the content. The failure modes worth catching are not logic errors — they are a missing Czech page, a broken `hreflang`, a heading order that breaks screen-reader navigation, a hero that scrolls sideways on a phone, and a performance budget that quietly erodes. All of these are visible in the built output and nowhere earlier.

### The seam

One seam: the built site. Tests run against the output of a production build, driven by a browser automation tool, with an accessibility engine and a performance auditor invoked against the same pages. There is deliberately no second seam over the content module — a missing translation surfaces as a missing or broken page in the crawl, and a second seam would duplicate that coverage for faster error messages alone.

### What is covered

- Every route renders in both locales.
- The language switch from any page arrives at the equivalent page in the other locale.
- Each page declares its own title, description, canonical URL and social metadata; `hreflang` is present and reciprocal.
- Accessibility scanning reports no violations on any page, in both locales and in both colour themes.
- Every interactive element is reachable by keyboard, in a sensible order, with a visible focus indicator.
- No horizontal overflow at 360 pixels wide.
- Performance, accessibility, best-practices and SEO audits each meet the agreed threshold of 95.
- With a reduced-motion preference set, content that is normally revealed on scroll is present and visible.
- The Walkthrough does not autoplay and is operable by keyboard.

### What is not covered

Whether the design is good and whether the prose is persuasive are human judgements and are not automated. Correct translation is likewise a human check; the tests confirm that Czech content exists and renders, not that it reads well.

### Prior art

None — this is a greenfield repository, so this spec establishes the pattern rather than following one.

## Out of Scope

- Secondary Projects. lufihome is expected later and the structure accommodates it, but no second Project is built or written now.
- A blog, a writing section, and a learning timeline. All three were considered and cut.
- A contact form and any backend, database or authenticated area.
- Deploying BikeCheck's backend or shipping a live web build of the application.
- Publishing BikeCheck to Google Play. The badge slot exists; the listing is not part of this work.
- Any change to the BikeCheck repository, including the committed database password and the test-fixture default in the webhook processor. Both were raised and deliberately left as they are.
- A headless CMS.
- An HTML CV page. The CV is a PDF only.
- iOS. BikeCheck is Android.

## Further Notes

### Non-code blockers

Two deliverables are required for launch but are not code, and will not fit an implementation ticket. They should be tracked separately and started early:

- **The Walkthrough.** With no live demo and no store listing, this is the only proof that the application runs. It is on the critical path — the site cannot launch without it.
- **The copy, in both languages.** Including the Case Study with three Deep Dives. This is the largest single body of work in the project and the part that most determines whether it succeeds.

### Content that must be accurate

The hero must not claim a Google Play listing, because there is not one yet. BikeCheck is described as an Android application built with Capacitor — not React Native, which is a different technology and a claim that would be caught immediately.

### The three Deep Dives

1. **From webhook to wear.** Why the Strava integration is a separate service, the two-stage queue and the handoff between them, database-per-service and the shared contracts library, and how failures are handled.
2. **Auth on native and web.** One identity across two platforms, Google sign-in on each, and token storage and refresh.
3. **Getting bike data.** No suitable API existed, so the data is scraped — its shape, validation and testing.

The Gemini queue processor and the i18n audit agent appear within the architecture overview as evidence of AI used as a system component, not as a separate section and not as a productivity claim.

### Known facts

Name: Jaroslav Lufinka. Domain: `jardalufi.cz`, already registered. Email: `jardalufi@gmail.com`. GitHub: `Jaffator`. LinkedIn: `jaroslav-lufinka-5a975751`. Location: Jablonec nad Nisou.

### Sequencing note

Design tokens and the locale routing shell should exist before any component is written. Both are expensive to retrofit — the dark theme in particular becomes a second implementation if components are built against raw values first.
