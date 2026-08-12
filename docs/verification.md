# Verification

`npm run verify` is the single gate. It runs, in order:

| Step               | What it proves                                                          |
| ------------------ | ----------------------------------------------------------------------- |
| `typecheck`        | No type errors in the site or the tests (`.ts`/`.tsx`; everything under `scripts/` is plain `.mjs` and is not typechecked). |
| `lint`             | No ESLint errors **or warnings** (`--max-warnings 0`).                   |
| `check:tokens`     | No raw colour, arbitrary value or inline style in component code, in `mdx-components.tsx`, or in a `.mdx` prose document — everything names a token. See [design-system.md](design-system.md). |
| `build`            | A production build completes with no errors and no warnings, into `out/`. |
| `validate:markup`  | Every built HTML file is valid markup.                                   |
| `test`             | The built site passes accessibility, design-system, keyboard, viewport, locale and audit checks, in every locale. |

Any step failing fails the whole command, so it is safe to run before every
commit. To wire it into git: `npm run hooks:install`.

## The seam

There is one seam: the built site. Nothing tests components or internals. The
suite serves `out/` over HTTP and drives a real browser against it, so it can
only assert what a Reader could observe. This is why the build runs before the
tests, and why `playwright.config.ts` refuses to start without `out/index.html`.

## The checks

Every route check goes through `visitRoute` first, which asserts a 200 and a
rendered `<h1>`. Without it the rest is worthless on a route that does not
exist: the static server answers an unknown path with a tidy error page that
passes accessibility, overflow and audit checks quite happily.

- **`tests/accessibility.spec.ts`** — axe-core against WCAG 2.1 A and AA, in
  both light and dark colour schemes. Any violation fails.
- **`tests/design-system.spec.ts`** — reads what the browser actually resolved:
  both themes carry the same token names and differ only in colour, the theme
  follows the system preference with no script deciding it, no request leaves
  the origin, both self-hosted faces finish loading, and the page records zero
  layout shift while they do.
- **`tests/keyboard.spec.ts`** — indexes every interactive element in DOM
  order, tabs through the page, and asserts focus visits each one exactly once
  in that order with a computed style that visibly changes on focus. An
  `outline: none` with no replacement fails here.
- **`tests/viewport.spec.ts`** — 360px wide viewport; fails if the document
  scrolls sideways, naming the offending elements.
- **`tests/locale.spec.ts`** — each page declares its own language, its own
  title and description, a canonical URL pointing at itself, and the language
  it shares under; the language switch offers every locale, marks the active
  one by more than colour, and lands on the equivalent page rather than the
  home page; and both versions declare each other with reciprocal `hreflang`.
  See [locale.md](locale.md).
- **`tests/hero.spec.ts`** — the hero is a named landmark carrying the page's
  level-1 heading, a positioning statement and the stack; it makes no Google
  Play claim while that Proof Link has no value; it names Capacitor and never
  React Native; it puts no junior or first-role label on its author; its Proof
  Links come from content rather than being placed by hand, are named clearly
  enough to be understood from the link alone, and stay visually secondary to
  the heading; and the Czech hero is written rather than left in English. The
  accuracy checks read the whole of `main`, because it does not matter which
  component would have introduced a false claim. See [content.md](content.md).
- **`tests/selected-work.spec.ts`** — Selected Work is a named landmark
  listing at least one Project; every Project carries a title, a description,
  stack tags and a link through to its Case Study in the same locale; the
  source Proof Link is present and qualified by its note; and a Proof Link with
  no value renders nothing — no Google Play link, no empty slot. Assertions are
  per rendered Project rather than about BikeCheck, so a second Project is held
  to the same bar without a line changing here. See [content.md](content.md).
- **`tests/home-sections.spec.ts`** — Stack, About and Contact are each named
  landmarks; the Stack is grouped rather than flat and carries no proficiency
  indicator in any form — text, meter, or a bar sized to a fraction of its track;
  About tells the story in prose without apologising for it, and mentions AI
  tooling exactly once across the whole page, in that section; the email is
  visible as text, copies to the clipboard by keyboard alone, and announces the
  result through a live region; Contact still shows the address and a `mailto:`
  link with JavaScript disabled; GitHub, LinkedIn, the city and the work
  preference are all present; the CV is served, is a real PDF and downloads
  under a name that identifies its author; and no form or third-party form
  service appears anywhere. The accuracy checks read the whole of `main`,
  because it does not matter which component would have introduced a false
  claim. Two checks run under both colour schemes rather than relying on the
  axe scan: the proficiency-bar detector reads a resolved `background-color`,
  and the copy confirmation is measured for contrast against whatever it
  actually sits on — both are questions a theme can answer differently. See
  [content.md](content.md).
- **`tests/case-study.spec.ts`** — the Case Study renders at its own URL in both
  locales and composes its parts in order; the Deep Dive repeats three times as
  one unit, each making all four moves under the same labels; a captioned figure
  sits inside a Deep Dive with its caption attached by `figcaption`; the
  Walkthrough slot renders nothing at all while empty; the heading outline skips
  no level; and the two locales are not the same text. Assertions are by
  structure rather than by wording, so ticket 14 can rewrite every word without
  touching this file. See [content.md](content.md).
- **`tests/social-preview.spec.ts`** — every route declares a social preview
  image at an absolute URL, states its width and height, and asks to be
  rendered as a large card rather than a thumbnail; the declared URL is fetched
  and what comes back is a PNG of 1200×630 with something actually drawn on it;
  no two routes share one card; and each locale's card is drawn from its own
  title rather than reusing the English one. It reads the tags and follows the
  URL exactly as a crawler would, so it knows nothing about how the image was
  produced. See [social-preview.md](social-preview.md).
- **`tests/not-found.spec.ts`** — an unknown path answers 404 with the site's
  own page, not the framework's, and is scanned by axe in both themes. It sits
  outside `routes.ts` because it is the one page that must not return 200.
- **`tests/lighthouse.spec.ts`** — performance, accessibility, best-practices
  and SEO must each score 95 or above. The audit itself runs in
  `scripts/lighthouse-run.mjs`, a plain Node process, because Lighthouse's
  dependency tree does not survive Playwright's TypeScript transform.

The suite runs single-worker with no retries: audit scores are sensitive to
machine load, and a retry would mask a real regression.

## Adding a route

Add one entry per locale to `tests/routes.ts` — the same `key`, one `path`
each. Every check iterates that list, so two lines bring a new route under the
full bar in both languages, and the shared `key` is what the language-switch
checks use to know where the switch should land.

That inventory is written out by hand rather than imported from
`app/_locale/routes.ts`, on purpose. The suite's value is that it asserts the
built site from the outside; a suite that derived the Czech path from the same
function the site uses would agree with a bug in that function.

The route also needs somewhere to put its social preview card — one entry per
locale in `IMAGE_DIRECTORIES` in `scripts/build-og-images.mjs`, naming the
directory that holds that route's `page.tsx`. The card itself is drawn without
further help. Forgetting this fails the build rather than shipping a route
whose link renders as a bare URL; see [social-preview.md](social-preview.md).
