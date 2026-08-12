import type { MDXComponents } from "mdx/types";
import { CaseStudyFigure } from "@/app/_case-study/figure";

/**
 * How prose written in MDX is rendered.
 *
 * Next.js looks for this file by name at the project root; it is the one place
 * an element authored as Markdown is bound to a component. Without it MDX emits
 * bare `<p>`, `<a>` and `<ul>` with no classes, which would put Case Study
 * prose outside the design system — unmeasured, unstyled and, in the case of a
 * link, without the accent-and-underline treatment every other link on the site
 * carries.
 *
 * Only the elements the prose is allowed to use are mapped. Headings are
 * deliberately absent: a Case Study's structure is the layout's, not the
 * author's, so `##` in a document has no styling here and the layout parts own
 * every heading level on the page. See `app/_case-study/layout.tsx`.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    p: ({ children }) => <p className="mt-6 text-body text-muted">{children}</p>,

    /**
     * Prose links are the same accent-and-underline treatment as everywhere
     * else. `rel` matches `ProjectRow`: prose can point off-site, and an
     * outbound link should not hand the destination a referrer it can use.
     */
    a: ({ href, children }) => (
      <a className="link" href={href} rel="noreferrer">
        {children}
      </a>
    ),

    ul: ({ children }) => (
      <ul className="mt-6 flex flex-col gap-2 text-body text-muted">{children}</ul>
    ),

    /**
     * A list marker, since Tailwind's preflight removes it and a list of
     * options weighed reads as a run of fragments without one. `aria-hidden`
     * because a screen reader already announces the list and its length.
     */
    li: ({ children }) => (
      <li className="flex gap-3">
        <span aria-hidden="true" className="text-rule">
          —
        </span>
        <span>{children}</span>
      </li>
    ),

    strong: ({ children }) => (
      <strong className="font-semibold text-ink">{children}</strong>
    ),

    /**
     * A preformatted block — a diagram or a fragment of schema. It scrolls
     * rather than wrapping, because wrapping a diagram destroys it, and the
     * scroll is on the block itself so the page never scrolls sideways with
     * it: `tests/viewport.spec.ts` fails the build if it does.
     */
    pre: ({ children }) => (
      <pre className="mt-6 overflow-x-auto rule-t rule-b py-6 font-mono text-small text-muted">
        {children}
      </pre>
    ),

    /**
     * `<Figure caption="…">` is available to any prose document without an
     * import, which is what lets a captioned figure be placed inside a Deep
     * Dive — beside the paragraph that refers to it, where an author would
     * naturally put it, rather than being passed in from the view and landing
     * somewhere the prose does not expect.
     */
    Figure: CaseStudyFigure,

    ...components,
  };
}
