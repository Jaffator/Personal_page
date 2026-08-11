import type { Project } from "@/app/_content/projects";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";
import { ProofLinks } from "./proof-links";

/**
 * The first thing a Reader sees, and the statement that sets how everything
 * below it is graded.
 *
 * It positions Jaroslav as a developer who takes a product end to end, names
 * the stack, and puts BikeCheck's Proof Links within reach of the opening
 * claim — so a Reader who wants to check the claim before reading further can,
 * without scrolling to find the way out.
 *
 * What it deliberately does not do: label a level. No "junior", no "looking for
 * my first role". The Case Study below is what sets the level, and a label in
 * the hero would decide the question before a Reader had read any of it.
 *
 * A labelled `section` rather than a bare block, so the opening statement is a
 * landmark a screen-reader Reader can return to, and so the hero is findable as
 * itself rather than as "whatever comes before Selected Work".
 *
 * @param project The Project the hero's claim rests on, whose name, description
 * and Proof Links it carries. Passed in rather than reached for, so the hero
 * does not quietly depend on BikeCheck being first in the collection.
 */
export function Hero({ project, locale }: { project: Project; locale: Locale }) {
  const strings = dictionaries[locale].hero;
  const headingId = "hero-title";

  return (
    <section aria-labelledby={headingId}>
      <p className="font-mono text-meta text-muted uppercase">{strings.eyebrow}</p>

      <h1 id={headingId} className="mt-6 text-display font-semibold text-ink">
        {strings.name}
      </h1>

      {/* The positioning, at the largest size a Reader reads rather than scans.
          It is what the rest of the page is graded against, so it sits directly
          under the name with nothing between them. */}
      <p className="mt-8 max-w-measure text-lede text-ink">{strings.positioning}</p>

      {/* The Project the claim rests on. Its name and description come from
          content, not from the dictionary, so the hero and Selected Work
          cannot drift into two different accounts of one application. */}
      <p className="mt-6 max-w-measure text-body text-muted">
        {strings.projectLead}{" "}
        <strong className="font-semibold text-ink">{project.title}</strong> —{" "}
        {project.description[locale]}
      </p>

      {/* The stack, in the monospace register the design system reserves for
          metadata. A list, so a screen reader announces how many technologies
          there are before reading them. */}
      <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 font-mono text-meta text-muted uppercase">
        {project.stack.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>

      {/* Proof, one step below the claim it supports: `text-small` against a
          display heading, so it is reachable without competing with the
          statement it exists to back up. */}
      <ProofLinks project={project} locale={locale} spacing="mt-8" />
    </section>
  );
}
