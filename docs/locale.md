# Locale shell

The site is bilingual. English serves from the root and Czech from `/cs`, an asymmetry chosen so the English URL — the one pasted into job applications and the one to rank — stays clean. See [ADR 0003](adr/0003-english-at-root-czech-prefixed.md); do not "correct" it to symmetrical `/en` and `/cs` without revisiting that decision.

## Where a URL comes from

`app/_locale/routes.ts` is the whole address model: the locales, the route keys, and `pathTo(locale, route)`. Because the default locale contributes no path segment, a path cannot be built by concatenating a locale onto a route — so nothing writes a path out by hand. Everything that links, declares a canonical URL or switches language asks `pathTo`.

A route key is what the two versions of one page have in common. That is what the language switch preserves: it resolves `pathTo(otherLocale, thisRoute)` rather than sending a Reader back to the home page.

## The two documents

`<html lang>` belongs to the document, and Czech is not English, so the document is rendered per locale:

| File | Serves | Declares |
| ---- | ------ | -------- |
| `app/(en)/layout.tsx` | `/…` | `lang="en"` |
| `app/(cs)/layout.tsx` | `/cs/…` | `lang="cs"` |

Both hand off to `app/_shell/document.tsx`, so the head, the font preloads and the stylesheet are written once.

`app/layout.tsx` sits above both and renders nothing but its children. It looks removable and is not: Next.js wraps `app/not-found.tsx` in the root layout, and with no root layout at all the framework supplies a bare `<html>` of its own — the site's 404 then renders a second `<html>` inside it, producing invalid markup with no language declared. The pass-through keeps one `<html>` per page, carrying that page's language.

The 404 is the one page written in English only. A static export serves a single document for every unmatched path in either locale, so there is no Czech version of it for a Czech string to reach, and it carries no language switch because there would be nothing to switch to.

## Interface strings

Two mechanisms with a firm boundary, per [ADR 0002](adr/0002-mdx-per-locale-for-case-studies.md): **interface strings** live in typed per-locale dictionaries under `app/_locale/`; **Case Study prose** lives in MDX per locale. Do not migrate one into the other.

`app/_locale/en.ts` is the reference locale, and `Dictionary` is derived from it rather than declared separately. So a string added to English and forgotten in Czech stops `app/_locale/cs.ts` typechecking — and `next build` runs TypeScript, which makes it a failed build rather than an English string on a Czech page.

Components take a `Locale` prop and read `dictionaries[locale]`. None of them imports a language.

## Metadata

`pageMetadata(locale, route)` produces a page's title, description, canonical URL, `hreflang` alternates and Open Graph locale from one call, and every page binding uses it. Both locales of a route publish the same alternates map, which is what makes the declaration reciprocal — each version points at the other and at itself, so neither is read as a duplicate. `x-default` names English.

## Adding a route

1. Add its key to `routeKeys` and its segments to `ROUTE_SEGMENTS` in `app/_locale/routes.ts`.
2. Add its title and description to `meta` in `app/_locale/en.ts` and `app/_locale/cs.ts`. The `meta` map is keyed by `RouteKey`, so this fails the build until both are written.
3. Add the view under `app/_views/`, taking `locale` and passing the route key to `SiteHeader`.
4. Bind it in each tree — `app/(en)/…/page.tsx` and `app/(cs)/cs/…/page.tsx` — each exporting `pageMetadata(locale, route)` and rendering the view.
5. Add one line per locale to `tests/routes.ts`. See [verification.md](verification.md).
