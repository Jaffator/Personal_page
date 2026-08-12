import type { ReactNode } from "react";

/**
 * One hard problem, opened up in full.
 *
 * This is the unit the Case Study is really made of, and the reason it is a
 * component rather than markup written fresh per topic: a Deep Dive is always
 * the same four moves — the constraint that forced a decision, the options
 * weighed, the choice made, and what it cost. A Case Study has two or three,
 * and they have to read as the same kind of thing, because what proves the
 * author reasons rather than assembles is the shape repeating, not the prose
 * being long.
 *
 * The four parts are required. That is deliberate: the one a tired author drops
 * is the cost, and a Deep Dive with no cost is a advertisement rather than an
 * account of a decision. Leaving it out fails the build.
 *
 * Heading levels are fixed here rather than chosen at the call site. The Deep
 * Dives sit inside a section titled by an `h2`, so a Deep Dive's own title is
 * an `h3` and the four moves are `h4`s under it. An author cannot break the
 * document outline from an MDX file, because the outline is not theirs to
 * write. See `layout.tsx`.
 */

/** The four moves, in the order a decision is actually made. */
export type DeepDiveParts = {
  /** What forced a decision. Without this the rest is preference. */
  constraint: ReactNode;
  /** What else was on the table, and why it was not chosen. */
  options: ReactNode;
  /** What was chosen. */
  choice: ReactNode;
  /** What it cost — the part that makes the rest credible. */
  cost: ReactNode;
};

export type DeepDiveLabels = {
  constraint: string;
  options: string;
  choice: string;
  cost: string;
};

export function DeepDive({
  id,
  index,
  title,
  labels,
  constraint,
  options,
  choice,
  cost,
}: {
  /** Anchors the section to its own title, making it a named landmark. */
  id: string;
  /** The ordinal a Reader sees — "01", "02" — in the metadata register. */
  index: string;
  title: string;
  labels: DeepDiveLabels;
} & DeepDiveParts) {
  const titleId = `${id}-title`;

  // Rendered from a list rather than written out four times, so the four moves
  // cannot drift apart in markup, ordering or heading level.
  const moves: readonly { key: keyof DeepDiveParts; body: ReactNode }[] = [
    { key: "constraint", body: constraint },
    { key: "options", body: options },
    { key: "choice", body: choice },
    { key: "cost", body: cost },
  ];

  return (
    <section id={id} aria-labelledby={titleId} className="reveal rule-draw rule-t pt-6">
      <p aria-hidden="true" className="font-mono text-meta text-muted uppercase">
        {index}
      </p>

      <h3 id={titleId} className="mt-4 text-title font-semibold text-ink">
        {title}
      </h3>

      {moves.map((move) => (
        <div key={move.key} className="mt-10">
          <h4 className="font-mono text-meta text-muted uppercase">{labels[move.key]}</h4>
          {/* A move's prose may carry a captioned figure of its own, placed
              beside the paragraph that refers to it — see `Figure` in
              mdx-components.tsx. */}
          <div className="max-w-measure">{move.body}</div>
        </div>
      ))}
    </section>
  );
}
