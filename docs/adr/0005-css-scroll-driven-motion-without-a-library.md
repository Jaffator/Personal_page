# Motion is CSS and scroll-driven, with no animation library

The site's motion layer — the reveal on scroll, the hover and focus transitions, and the three signature moments — is written in `app/globals.css` using CSS animations and `animation-timeline: view()`. No animation library is installed, and no JavaScript drives any of it.

## Considered Options

**An animation library** (Framer Motion, GSAP, or similar) was the obvious route and is what most sites reach for. Rejected on cost. The site ships no framework runtime today — `CopyEmail` is a few hundred bytes of inline script precisely so that one button does not pull React hydration onto the page (ADR 0001, and the note in `copy-email.tsx`). Framer Motion would make every animated component a client component and bring the whole runtime back, to do what forty lines of CSS already do. The performance budget the suite enforces is 95+ on four Lighthouse categories; spending it on a fade is not a trade worth making.

**An `IntersectionObserver` reveal** — the conventional no-library approach — was the fallback if CSS could not express it. Rejected because it is strictly worse than the CSS version where the CSS version works: it needs a script, it runs on the main thread, and it has to add and remove classes as elements cross the viewport. Its one advantage is browser support, and the reveal is a grace note whose absence costs a Reader nothing.

**Scroll-driven CSS animations** won. `animation-timeline: view()` is resolved by the browser off the main thread, needs no observer and no script, and degrades to nothing at all where it is unsupported — the element simply sits in its resting state, which is the finished page.

## Consequences

- **Motion never makes content visible, and this is load-bearing.** Every animated element is fully visible with no animation running; the reveal moves an element that is already there. This is what makes suppression safe: under `prefers-reduced-motion: reduce` the animation is cancelled and the page is complete. The usual scroll-reveal sets `opacity: 0` at rest and relies on the animation to undo it, which hides content permanently from the Readers who asked for less movement. `tests/motion.spec.ts` asserts the outcome on every route, with the preference both set and unset.
- **Nothing animates the opacity of text.** The first cut of the reveal rose *and* faded, which is the conventional gesture. It failed the site's own axe scan: any opacity below 1 lowers the text's contrast against the page, and `text-muted` has too little headroom over the AA threshold to give away, so the page was failing the contrast bar for as long as the animation ran. Lowering the fade to a floor did not fix it, because the fade was the problem. The movement alone reads better anyway. Held by a check in `tests/motion.spec.ts`.
- **Only `transform` and `opacity` are animated.** Both are composited, so a frame costs no layout and no paint, and neither can move anything else — which is what keeps the layout-shift score at zero while a Reader scrolls. Asserted per route.
- Browsers without scroll-driven animations get the resting page and no reveal. The `@supports` guard is what makes that the outcome rather than every element animating once on load.
- The stagger positions are enumerated as `.settle-1` … `.settle-5` rather than passed as a value, because `check:tokens` rejects both inline styles and arbitrary Tailwind values. This caps the hero sequence at five, which is a reasonable ceiling rather than a limitation — a sixth element is a prompt to ask whether it should be animating at all.
- If a future moment genuinely cannot be expressed in CSS, revisit this. Adding a library for a moment that *can* be is what this decision rules out.
