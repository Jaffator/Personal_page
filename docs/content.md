# Content

Three mechanisms carry text on this site, with firm boundaries between them:

| Mechanism | Lives in | Holds |
| --------- | -------- | ----- |
| **Interface strings** | `app/_locale/en.ts`, `app/_locale/cs.ts` | Labels, headings, link text — the furniture around content, plus the About prose |
| **Structured content** | `app/_content/` | Projects, their stack, their Proof Links; the Walkthrough recording; the author's Stack groups and contact details |
| **Case Study prose** | `app/_case-study/<slug>/<locale>/*.mdx` | Long-form writing, per [ADR 0002](adr/0002-mdx-per-locale-for-case-studies.md) |

Do not migrate one into the other. The test for which a piece of text is: if it
would still be there with no Projects at all, it is interface; if it describes a
Project, it is content; if it is more than a line or two of prose, it is MDX.

## Projects

`app/_content/projects.ts` holds a **collection**, and holds one entry. That is
deliberate — adding lufihome must be an entry in that array and nothing else.
`SelectedWork` maps the collection, so nothing downstream may assume the length
is one.

A Project's `title` and its `stack` tags are not localised: an application's
name and a technology's name are the same in both languages, and translating
them would make them unrecognisable to a Reader matching against an open role.
Everything else Reader-facing is.

## The hero

The hero's copy is **interface**, in `app/_locale/{en,cs}.ts` under `hero`, and
it stays on the right side of the boundary by the test above: every string
there is about the author, so it would still be there with no Projects at all.

What BikeCheck *is* does **not** live in the dictionary. The hero renders the
Project's own `title` and `description` from `app/_content/projects.ts`, framed
by one interface string (`projectLead`). Writing the description a second time
in the dictionary would put two accounts of one application in two files, free
to drift — and the hero is the first thing a Reader reads, so it is the worse
of the two to have go stale.

Three things the hero must not do, each enforced by `tests/hero.spec.ts`:

- **No Google Play claim** while that Proof Link has no value.
- **Capacitor, never React Native.** Different technologies, and the kind of
  claim a Reader checks.
- **No level label.** No "junior", no "looking for my first role". The Case
  Study is what sets the level, and a label in the hero decides the question
  before a Reader has read any of it.

The Czech hero is written as Czech rather than translated from the English —
"full-stack vývojář" is what a Czech job advert says. The test asserts the two
differ and that the Czech carries diacritics; whether it *reads* well is a
human check.

## The Stack, About and Contact

The rest of the home page below Selected Work. The split follows the same test
as everywhere else, and lands in two places:

- **`app/_content/profile.ts`** — the Stack groups, the email, the city, the
  profile URLs and the CV. These describe a particular person and would not
  survive being rewritten for someone else, so they are content.
- **`app/_locale/{en,cs}.ts`** — the headings, the labels, the copy control's
  strings, and the About prose. Every one is about the author rather than about
  a Project, so it would still be there with no Projects at all.

About is the one stretch of prose in the dictionary rather than in MDX. MDX on
this site is reserved for Case Study prose (ADR 0002); About is three paragraphs
of interface, and moving it would make the boundary a matter of length rather
than of kind.

### The Stack states no proficiency

No bars, no star ratings, no percentages, no year counts. A technical Reader
treats "React 85%" as a red flag, because the claim cannot be true — 85% of
what, measured by whom — and the one entry that provokes the question costs more
than the whole section gains. `StackGroup` gives a component nowhere to put a
rating, and `tests/home-sections.spec.ts` asserts the absence three ways,
because a rating can be drawn as text, as a widget, or as a bar.

### About says one line about AI tooling

Once, in About, and nowhere else on the site. Said twice it reads as a defence;
said as a feature it reads as a selling point; and both undercut the honest
version. What the line claims is the part a Reader is actually weighing — that
he can explain the decisions and defend the trade-offs. The test counts mentions
across the whole of `main` and requires exactly one, in that section.

The same framing rule governs the rest of About: the self-taught story is stated
as fact, with no apology and no level label. The Case Study is what sets the
level, and an apology here overwrites a Reader's own conclusion with a worse one.

### Contact has no form, and the email is one constant

The site is statically exported and has no backend (ADR 0001). A form would
either post nowhere or post to a third-party service, and one that silently
swallows a message during a job search is the worst failure this site could
have. So the address is shown as text, as a `mailto:` link, and beside a control
that copies it — and `EMAIL` in `app/_content/profile.ts` is the single source
for all three. Written out three times, it would be three chances to ship a typo
in the one string on the site that has to be exactly right.

`app/_shell/copy-email.tsx` ships the **only script on the site**. Writing to the
clipboard has no declarative form, and the alternative is a Reader
hand-selecting an address, which is where a character gets dropped and a reply
never arrives.

It is deliberately **not** a React client component. One `"use client"` module
makes Next.js hydrate the whole page, and the measured cost was ~574 KB of
framework runtime for a button that writes an address to the clipboard — on a
site whose premise is that it ships no JavaScript. What ships instead is a few
hundred bytes of inline handler, attached by id, with no runtime and no
hydration. There are no client components in `app/`.

It is an enhancement and never the route itself: the address and the `mailto:`
link are server-rendered, so the section works whole with JavaScript disabled —
which is what makes shipping the script acceptable at all. The outcome is
announced through a live region that is always in the DOM, since a region added
at the moment it has something to say is frequently missed.

### The CV

A static PDF in `public/`, versioned with the site so it cannot drift from what
is deployed. It downloads under the author's name rather than `cv.pdf`, because
it lands in a folder among files from every other candidate. The test asserts
the file is served, begins with `%PDF-`, and is not empty — so an HTML error
page renamed `.pdf` fails the build rather than a Reader's download.

> **The committed PDF is a placeholder and must be replaced before deploy.**
> `scripts/build-cv.mjs` generates it from what this repository already states —
> the positioning, BikeCheck, the Stack, the contact facts — so every line in it
> is true. It is not a complete CV: it carries no employment history, no
> education and no dates, because the repository does not know them, and
> inventing them on a job-seeking document is worse than shipping nothing. It
> exists so the link, the filename and the content type are real and under test
> from the day the section ships. Replace it by filling in the script and
> re-running `node scripts/build-cv.mjs`, or by dropping a real PDF at the same
> path.

## Localised values

`Localised<T>` is `Record<Locale, T>` — a total map, not a partial one. So a
Czech description left unwritten fails `npm run typecheck` and therefore
`next build`, which is the same guarantee `app/_locale/cs.ts` gets from being
annotated with `Dictionary`. A missing field fails the build rather than
reaching a Reader.

## Proof Links

A Proof Link is data on a Project: a `kind`, an optional `href` and an optional
`note`.

`href` is optional because a Proof Link can be **modelled before it exists**.
BikeCheck carries a `googlePlay` link with no URL, because the application is
not published. Publishing means adding `href` to that entry — a content change,
not a component change.

`resolvedProofLinks` filters to the links that point somewhere, and
`app/_shell/proof-links.tsx` renders only those. An absent Proof Link renders
**nothing at all**: not an empty slot, not a disabled control, and not a
"coming soon", each of which would be a claim the site cannot support.
`tests/selected-work.spec.ts` and `tests/hero.spec.ts` both assert the home
page links nowhere near `play.google.com`.

There is **one** Proof Link component, and the hero and Selected Work both use
it. The guarantee that an absent link renders nothing has to hold everywhere it
is shown or it does not hold at all — a second inline copy is how one of them
ends up rendering an empty Google Play slot on the day the other stops.

`note` is what keeps the site honest. The source Proof Link carries one marking
the repository as actively in development, so a Reader judges it as work in
progress rather than as a finished release.

## The Case Study

A Case Study is prose documents plus one binding file. There is no per-Project
page component, and adding one would be the mistake this structure exists to
prevent.

```
app/_case-study/
  layout.tsx              the parts, in the order every Case Study makes its argument
  deep-dive.tsx           one hard problem: constraint, options, choice, cost
  figure.tsx              a figure with its caption attached
  walkthrough-slot.tsx    where the player lands; an absent Walkthrough renders nothing
  walkthrough-player.tsx  the player itself
  documents.ts            the types that make a missing document a failed build
  bikecheck.ts            which document fills which part, per locale
  bikecheck/{en,cs}/      the prose itself
```

### Headings belong to the layout, not the prose

Every heading is issued by `layout.tsx` or by `DeepDive`: `h1` the Project, `h2`
each part, `h3` a Deep Dive, `h4` its four moves. `mdx-components.tsx`
deliberately maps **no** heading elements, so a `##` typed into a document is
not styled and does not enter the outline. That is what keeps heading order
unbroken for a screen-reader Reader no matter who writes the copy.

### What a document may use

Paragraphs, emphasis, links, lists, preformatted blocks, and `<Figure
caption="…">` — available without an import, so a captioned figure can sit
beside the paragraph that refers to it. `figure`/`figcaption` is what associates
a caption with its figure; positioning it underneath is not.

### The Walkthrough

The Walkthrough is the site's proof. With no live demo and no store listing, the
recording is the only evidence a Reader has that BikeCheck runs — so the player
has to work perfectly and cost nothing.

The recording is described in `app/_content/walkthrough.ts`: the video, the
poster, a caption track per locale, the frame's dimensions, and a prose
description of what it shows. It is content by the test above — every field
describes one Project's recording — and it is a module of its own because a
Case Study can exist before its recording does.

The video itself is **not** localised. It is silent (see CONTEXT.md), so one
file serves both languages; only the captions and the description differ.

`app/_case-study/walkthrough-player.tsx` renders a plain `<video controls>`.
That is the design, not a shortcut. A native player is already keyboard
operable, already labelled, and already offers fullscreen and playback rate —
all of which a custom player would have to rebuild, and `tests/keyboard.spec.ts`
would hold the rebuild to the same bar the native element clears for free. It is
also the only way to have a player at all without a client component: there are
none in `app/`, for the reason `copy-email.tsx` documents.

Four things hold the performance line, each asserted in `tests/case-study.spec.ts`:

- **`preload="none"`** — no video bytes are fetched until the Reader presses
  play. The recording is the largest file on the site and most Readers will
  never play it.
- **A poster** — so the player is not a black rectangle at rest, and the space
  is filled by an image measured in kilobytes.
- **It is never the largest contentful paint element.** The test reads the real
  LCP entry rather than reasoning about it; a large portrait poster near the top
  of a page is exactly the shape of thing that becomes LCP by accident.
- **It never autoplays** — no attribute, and no script that could call `play()`.
  Muted autoplay would still spend a Reader's bandwidth and move a page they are
  reading.

Because the recording carries no audio, its content is given twice: a WebVTT
caption track, and a description in a `figcaption` attached to the player, for
the Reader who will not play a video at all.

> **The committed recording is a placeholder and must be replaced before deploy.**
> `scripts/build-walkthrough-placeholder.mjs` writes a holding frame that
> genuinely plays, so the player, its poster, its captions and its byte budget
> are real and under test from the day the component ships. The real recording is
> ticket 13 and gates launch. Replacing it is a **file swap**: overwrite the four
> files in `public/walkthrough/`, keeping the names, and update `width`/`height`
> and `description` in `app/_content/walkthrough.ts` if the frame or the content
> differs. No component changes, and the generator script can then be deleted.

### A missing document fails the build

Two mechanisms, because neither covers the other:

- Documents are **statically imported** in `bikecheck.ts`, so a Czech file that
  was never written is an unresolved module and `next build` stops. TypeScript
  alone cannot catch this — `@types/mdx` declares a wildcard `*.mdx` module that
  matches any path, existent or not.
- `CaseStudyDocuments` requires every named part, and `assertDeepDiveParity`
  runs at module scope to reject one locale carrying more Deep Dives than the
  other — a list's length is not a type.

## Adding a Project

1. Add an entry to `projects` in `app/_content/projects.ts`. The types make
   every required field, in every locale, a build failure until it is written.
2. Add its Case Study route — see [locale.md](locale.md).
3. Write its prose documents, one set per locale, and a binding file beside
   `bikecheck.ts` naming them.
4. Nothing in `app/_shell/` or `app/_case-study/` changes.
