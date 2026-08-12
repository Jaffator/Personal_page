# Social preview images

A link to this site pasted into an application email, a chat client or a post
renders as a designed card rather than as a bare URL. It matters most for the
Case Study, which is the link sent deliberately.

Every route has its own card, in every locale.

## Where they come from

`scripts/build-og-images.mjs` draws them, and `npm run build` runs it before
`next build`. They are not committed — `.gitignore` excludes them — because a
committed card is a stale second copy of something the build already produces.

Everything on a card comes from the site's own sources:

| On the card          | Read from                                                  |
| -------------------- | ---------------------------------------------------------- |
| Colours, type stack  | the tokens and `@font-face` rules in `app/globals.css`      |
| Title, description   | the same `meta` dictionary entry the page's `<title>` uses  |
| The URL at the foot  | the site's own `pathTo`, under its own `SITE_URL`           |

Nothing is restated. A token changed in `globals.css` or a title rewritten in a
dictionary changes the cards on the next build, so a card cannot drift from the
page it represents. The script imports those modules for real, through the
resolve hook in `scripts/resolve-site-modules.mjs` — that is what
`scripts/site-source.mjs` exists to set up.

The dark values are used rather than the light ones. A card is seen against a
feed or a mail client rather than against a page, and the dark card reads as
deliberate in both; a white rectangle in a dark timeline reads as a screenshot
of something else.

## Why a browser draws them

The site's typeface is self-hosted as woff2. `next/og` is backed by satori,
which cannot read woff2 — so a card drawn that way would be set in a fallback
face and would not look like the site. Chromium reads woff2 natively, from the
very files the site serves, and Playwright is already a dependency of the
verification suite. `scripts/build-walkthrough-placeholder.mjs` reaches for
Chromium for the same kind of reason.

## How the metadata gets written

It is not written. Each card is saved as `opengraph-image.png` in the directory
holding that route's `page.tsx`, which is the file convention Next.js looks for.
The framework then emits `og:image`, its type, its width and height, and the
`twitter:card` asking for a large card, for every page under that directory.

`metadataBase` is declared on the root layout in `app/layout.tsx`, because an
image URL is resolved against the base. Without it — including on `/_not-found`,
which the framework generates and which never sees a `metadata` export of
ours — a card is announced under `localhost`.

## Adding a route or a Project

The set of cards is the site's own `locales` crossed with its own `routeKeys`,
so a new locale or a new Project's Case Study produces its cards with no change
to the drawing code. The one thing to add is where the file belongs: an entry in
`IMAGE_DIRECTORIES` in `scripts/build-og-images.mjs`, naming the directory that
holds that route's `page.tsx`.

That is a fact about the App Router's directory layout — route groups contribute
no path segment — rather than about the site's URLs, which is why it cannot be
derived from `pathTo`.

The entry is checked rather than trusted. Before anything is drawn, each one
must name a directory that holds a `page.tsx`, and that directory's own path —
route groups discounted — must be the path `pathTo` gives for the route it is
claimed to serve. All three failures stop the build, naming the route and what
to do about it:

- no entry at all;
- an entry naming a directory with no page in it;
- an entry naming a real page, but the wrong one.

The last is the one worth the machinery. A card written into a directory that
is not the route's does not go missing — the route quietly inherits whichever
card sits above it, and ships a preview for a different page. Nothing looks
broken, which is why it has to fail here.
