# Design system

Every colour, size, rule weight and focus treatment on the site is declared once, in `app/globals.css`. Component code names tokens and never values.

Two things hold that line. Tailwind's own palette, type scale, containers and font stacks are **cleared** (`--color-*: initial` and friends), so `text-gray-500`, `text-4xl` and `max-w-2xl` are not classes that exist — the table below is the whole vocabulary. And `npm run check:tokens` fails the build if a component writes a hex colour, a palette colour, an arbitrary value or an inline style. It scans `app/`, `mdx-components.tsx` and every `.mdx` prose document, so Case Study prose is held to the same bar as the components around it.

Prose written in MDX is styled in one place — `mdx-components.tsx` — which binds each Markdown element to a token utility. A paragraph in a Case Study is therefore the same paragraph as anywhere else on the site, and no prose document sets its own type.

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
| `--walkthrough-height` | how tall the Walkthrough player may get                            | `walkthrough`        |
| `--focus-*`   | `width`, `offset`                                                               | applied globally     |
| `--motion-*`  | `quick`, `settle`, `reveal`, `ease`, `rise`, `stagger`                          | `reveal`, `settle`, `rule-draw`, `link-sweep` |

Each `--text-*` size carries its own line height, and `meta` and `display` carry letter spacing, so choosing a size chooses a whole setting rather than one number. The scale has more steps than the site currently uses; that is what a scale is.

Rules and links get named utilities (`rule-t`, `rule-b`, `link`) because Tailwind has no token namespace for a border-plus-colour or an underline treatment, and spelling them out at each call site puts raw numbers back in components. `walkthrough` is the same move for the Walkthrough player's frame: the height cap, the aspect-preserving width and the hairline around it are one decision — how a portrait recording sits in a page of prose — and splitting them puts a raw height back in a component.

## The register

Editorial: strong hierarchy, generous whitespace, hairline rules, one accent colour. The monospace is reserved for metadata — section indices, stack tags, dates, and the language switch — and never sets running prose.

## Themes

Light is the default. Dark is the same token names resolved to different values inside a `prefers-color-scheme` media query, and nothing but colour changes: type scale, spacing and rule weights are one set of decisions, not two. No script is involved, so the browser paints the correct theme first rather than correcting it afterwards. There is no theme toggle; the Reader's system preference is the whole input.

## Focus

`:focus-visible` is styled once, globally, for every element. A component does not opt in, and must not opt out — `tests/keyboard.spec.ts` asserts a visible change on focus for every interactive element on every route.

## Motion

Restrained by design, and CSS-only — no animation library, no JavaScript. See [ADR 0005](adr/0005-css-scroll-driven-motion-without-a-library.md).

The baseline is a short rise as a block enters the viewport, driven by `animation-timeline: view()`, plus transitions on hover and focus. On top of that sit three signature moments:

| Moment | Where | What it does |
| ------ | ----- | ------------ |
| **Hero stagger** | `Hero` | The hero's five parts settle in sequence on load, in the order of the argument they make. The one piece of motion that is not scroll-driven, because the hero is already in view. |
| **Rule draw** | `SectionHeading`, `ProjectRow`, `DeepDive` | A section's hairline draws itself from the left as the section arrives. The rules are the strongest part of the editorial register, so they get the deliberate moment. |
| **Underline sweep** | every `link` | An accent-weight line sweeps in beneath the resting underline on hover and on focus. The same gesture as the rule draw at the scale of one link. |

Three rules govern everything here, and all three are asserted in `tests/motion.spec.ts` on every route:

1. **Motion never makes content visible.** Animated elements are fully visible with no animation running; the reveal moves something already there. This is what makes reduced-motion suppression safe — cancel every animation and the page is complete. A reveal built the usual way, with `opacity: 0` at rest, hides content permanently from exactly the Readers who asked for less movement.
2. **Nothing animates the opacity of text.** Any opacity below 1 lowers contrast, and `text-muted` has no headroom to give away. The movement carries the reveal.
3. **Only `transform` and `opacity` are animated.** Composited, so a frame costs no layout and no paint, and the layout-shift score stays at zero while the Reader scrolls.

Adding motion to a component means using `reveal` (or `settle` in the hero) and nothing else. A `transition` written by hand in a component is not caught by `check:tokens` — it carries no colour and no arbitrary value — so the reduced-motion backstop at the foot of `globals.css` exists to catch it.

## Typefaces

Self-hosted Inter and JetBrains Mono, split into latin and latin-ext subsets by `unicode-range`. See [ADR 0004](adr/0004-self-hosted-font-subsets-with-optional-display.md).

## Adding a token

Add it to the `@theme` block. If it is a colour, add its dark value to the media query in the same file — the token-parity check in `tests/design-system.spec.ts` fails if a theme carries a name the other does not. Tailwind emits only the tokens something references, so a token nothing uses yet will not appear in the built CSS, and the parity check will not see it either.
