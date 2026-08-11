# Content

Three mechanisms carry text on this site, with firm boundaries between them:

| Mechanism | Lives in | Holds |
| --------- | -------- | ----- |
| **Interface strings** | `app/_locale/en.ts`, `app/_locale/cs.ts` | Labels, headings, link text — the furniture around content |
| **Structured content** | `app/_content/` | Projects, their stack, their Proof Links |
| **Case Study prose** | MDX per locale (ticket 05) | Long-form writing, per [ADR 0002](adr/0002-mdx-per-locale-for-case-studies.md) |

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
`ProjectRow` renders only those. An absent Proof Link renders **nothing at
all**: not an empty slot, not a disabled control, and not a "coming soon",
each of which would be a claim the site cannot support.
`tests/selected-work.spec.ts` asserts the home page links nowhere near
`play.google.com`.

`note` is what keeps the site honest. The source Proof Link carries one marking
the repository as actively in development, so a Reader judges it as work in
progress rather than as a finished release.

## Adding a Project

1. Add an entry to `projects` in `app/_content/projects.ts`. The types make
   every required field, in every locale, a build failure until it is written.
2. Add its Case Study route — see [locale.md](locale.md).
3. Nothing in `app/_shell/` changes.
