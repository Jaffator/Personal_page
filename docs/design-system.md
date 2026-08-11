# Design system

Every colour, size, rule weight and focus treatment on the site is declared once, in `app/globals.css`. Component code names tokens and never values.

Two things hold that line. Tailwind's own palette, type scale, containers and font stacks are **cleared** (`--color-*: initial` and friends), so `text-gray-500`, `text-4xl` and `max-w-2xl` are not classes that exist — the table below is the whole vocabulary. And `npm run check:tokens` fails the build if a component writes a hex colour, a palette colour, an arbitrary value or an inline style.

## The tokens

Declared in the `@theme` block, so Tailwind generates a utility for each.

| Namespace     | Tokens                                                                        | Utilities            |
| ------------- | ----------------------------------------------------------------------------- | -------------------- |
| `--color-*`   | `page`, `ink`, `muted`, `rule`, `accent`, `focus`                              | `bg-page`, `text-ink`, `text-muted`, `text-accent` |
| `--font-*`    | `sans` (Inter), `mono` (JetBrains Mono)                                         | `font-sans`, `font-mono` |
| `--text-*`    | `meta`, `small`, `body`, `lede`, `title`, `section`, `display`                  | `text-body`, `text-display`, … |
| `--spacing`   | the 0.25rem step every gap is a multiple of                                     | `mt-8`, `py-24`, …   |
| `--container-*` | `measure` (prose width), `page` (page frame)                                  | `max-w-measure`, `max-w-page` |
| `--rule-hairline` | the one rule weight                                                         | `rule-t`, `rule-b`   |
| `--underline-offset` | how far a link's underline clears its descenders                     | `link`               |
| `--focus-*`   | `width`, `offset`                                                               | applied globally     |

Each `--text-*` size carries its own line height, and `meta` and `display` carry letter spacing, so choosing a size chooses a whole setting rather than one number. The scale has more steps than the site currently uses; that is what a scale is.

Rules and links get named utilities (`rule-t`, `rule-b`, `link`) because Tailwind has no token namespace for a border-plus-colour or an underline treatment, and spelling them out at each call site puts raw numbers back in components.

## The register

Editorial: strong hierarchy, generous whitespace, hairline rules, one accent colour. The monospace is reserved for metadata — section indices, stack tags, dates, and the language switch — and never sets running prose.

## Themes

Light is the default. Dark is the same token names resolved to different values inside a `prefers-color-scheme` media query, and nothing but colour changes: type scale, spacing and rule weights are one set of decisions, not two. No script is involved, so the browser paints the correct theme first rather than correcting it afterwards. There is no theme toggle; the Reader's system preference is the whole input.

## Focus

`:focus-visible` is styled once, globally, for every element. A component does not opt in, and must not opt out — `tests/keyboard.spec.ts` asserts a visible change on focus for every interactive element on every route.

## Typefaces

Self-hosted Inter and JetBrains Mono, split into latin and latin-ext subsets by `unicode-range`. See [ADR 0004](adr/0004-self-hosted-font-subsets-with-optional-display.md).

## Adding a token

Add it to the `@theme` block. If it is a colour, add its dark value to the media query in the same file — the token-parity check in `tests/design-system.spec.ts` fails if a theme carries a name the other does not. Tailwind emits only the tokens something references, so a token nothing uses yet will not appear in the built CSS, and the parity check will not see it either.
