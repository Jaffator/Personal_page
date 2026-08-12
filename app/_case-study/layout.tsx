import type { ReactNode } from "react";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";
import { WalkthroughSlot } from "./walkthrough-slot";

/**
 * The shape every Case Study has.
 *
 * One layout, composing named parts in a fixed order: the opening statement, the
 * Walkthrough, the architecture overview, the Feature Tour, the Deep Dives, and
 * the closing retrospective. A second Project's Case Study is a second set of
 * documents handed to this component — not a second component — which is what
 * the ticket means by adding documents rather than writing a page.
 *
 * The order is fixed here rather than assembled per Project on purpose. It is
 * the argument the page makes: what this is, then proof it runs, then how it is
 * built, then what it does, then the hard parts in depth, then an honest look
 * back. A Case Study that reordered those would be making a different argument,
 * and probably a worse one.
 *
 * ## Headings
 *
 * Every heading on the page is issued here or by a part this file renders, and
 * never by an MDX document. The outline is therefore fixed and unbreakable:
 *
 * - `h1` — the Project, once, in the header below
 * - `h2` — each part of the Case Study
 * - `h3` — each Deep Dive's title
 * - `h4` — the four moves within a Deep Dive
 *
 * That is why `mdx-components.tsx` maps no heading elements: a `##` typed into
 * a prose document would otherwise land at whatever level the author guessed
 * and put a hole in the outline a screen-reader Reader navigates by.
 */

/** The prose parts of a Case Study, each a compiled MDX document. */
export type CaseStudyParts = {
  /** What the Project is and why it exists. Sets up everything after it. */
  opening: ReactNode;
  /** How it is put together — the shape of the system, not a stack list. */
  architecture: ReactNode;
  /** What it does, covered briefly. Establishes scope; proves completeness. */
  featureTour: ReactNode;
  /**
   * The hard problems, in order. A list rather than named slots, because two
   * or three is the expected range and neither number is special — this is what
   * lets a Deep Dive be used three times without duplication.
   */
  deepDives: readonly ReactNode[];
  /** What was learned and what would be done differently. */
  retrospective: ReactNode;
  /** The Walkthrough player, once it exists. Absent renders nothing. */
  walkthrough?: ReactNode;
};

export function CaseStudyLayout({
  locale,
  title,
  lede,
  parts,
}: {
  locale: Locale;
  /** The Project's name. Not localised — it is the application's name. */
  title: string;
  /** The one-line description, under the title. */
  lede: string;
  parts: CaseStudyParts;
}) {
  const strings = dictionaries[locale].caseStudy;

  // Rendered from a list so every part gets the same heading level and the
  // same spacing, and so the order above is the only place it is decided.
  const sections: readonly { id: string; heading: string; body: ReactNode }[] = [
    { id: "architecture", heading: strings.architecture, body: parts.architecture },
    { id: "feature-tour", heading: strings.featureTour, body: parts.featureTour },
  ];

  return (
    <main className="mx-auto max-w-page px-6 pb-24 pt-8">
      <p className="font-mono text-meta text-muted uppercase">{strings.eyebrow}</p>

      <h1 className="mt-6 text-display font-semibold text-ink">{title}</h1>

      <p className="mt-8 max-w-measure text-lede text-muted">{lede}</p>

      {/* The opening statement carries no heading of its own: it reads directly
          on from the lede, and a heading between the two would announce a
          section break where the prose intends continuity. */}
      <div className="mt-12 max-w-measure">{parts.opening}</div>

      <WalkthroughSlot heading={strings.walkthrough}>{parts.walkthrough}</WalkthroughSlot>

      {sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="reveal mt-24">
          <h2 id={section.id} className="text-section font-semibold text-ink">
            {section.heading}
          </h2>
          <div className="mt-8 max-w-measure">{section.body}</div>
        </section>
      ))}

      <section aria-labelledby="deep-dives" className="reveal mt-24">
        <h2 id="deep-dives" className="text-section font-semibold text-ink">
          {strings.deepDives}
        </h2>

        {/* Each Deep Dive titles itself with an `h3` and carries its own rule,
            so the set reads as a sequence and adding a third changes nothing
            here. */}
        <div className="mt-8 flex flex-col gap-16">{parts.deepDives}</div>
      </section>

      <section aria-labelledby="retrospective" className="reveal mt-24">
        <h2 id="retrospective" className="text-section font-semibold text-ink">
          {strings.retrospective}
        </h2>
        <div className="mt-8 max-w-measure">{parts.retrospective}</div>
      </section>
    </main>
  );
}
