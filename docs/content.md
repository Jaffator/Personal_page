# Content

Three mechanisms carry text on this site, with firm boundaries between them:

| Mechanism | Lives in | Holds |
| --------- | -------- | ----- |
| **Interface strings** | `app/_locale/en.ts`, `app/_locale/cs.ts` | Labels, headings, link text — the furniture around content |
| **Structured content** | `app/_content/` | Projects, their stack, their Proof Links |
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
  layout.tsx            the parts, in the order every Case Study makes its argument
  deep-dive.tsx         one hard problem: constraint, options, choice, cost
  figure.tsx            a figure with its caption attached
  walkthrough-slot.tsx  where the player lands (ticket 08); empty renders nothing
  documents.ts          the types that make a missing document a failed build
  bikecheck.ts          which document fills which part, per locale
  bikecheck/{en,cs}/    the prose itself
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
