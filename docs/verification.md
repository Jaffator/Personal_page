# Verification

`npm run verify` is the single gate. It runs, in order:

| Step               | What it proves                                                          |
| ------------------ | ----------------------------------------------------------------------- |
| `typecheck`        | No type errors in the site or the tests (`.ts`/`.tsx`; the two harness scripts are plain `.mjs` and are not typechecked). |
| `lint`             | No ESLint errors **or warnings** (`--max-warnings 0`).                   |
| `build`            | A production build completes with no errors and no warnings, into `out/`. |
| `validate:markup`  | Every built HTML file is valid markup.                                   |
| `test`             | The built site passes accessibility, keyboard, viewport and audit checks. |

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
- **`tests/keyboard.spec.ts`** — indexes every interactive element in DOM
  order, tabs through the page, and asserts focus visits each one exactly once
  in that order with a computed style that visibly changes on focus. An
  `outline: none` with no replacement fails here.
- **`tests/viewport.spec.ts`** — 360px wide viewport; fails if the document
  scrolls sideways, naming the offending elements.
- **`tests/not-found.spec.ts`** — an unknown path answers 404 with the site's
  own page, not the framework's. It sits outside `routes.ts` because it is the
  one page that must not return 200.
- **`tests/lighthouse.spec.ts`** — performance, accessibility, best-practices
  and SEO must each score 95 or above. The audit itself runs in
  `scripts/lighthouse-run.mjs`, a plain Node process, because Lighthouse's
  dependency tree does not survive Playwright's TypeScript transform.

The suite runs single-worker with no retries: audit scores are sensitive to
machine load, and a retry would mask a real regression.

## Adding a route

Add its path to `tests/routes.ts`. Every check iterates that list, so one line
brings a new route under the full bar.
