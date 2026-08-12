import Link from "next/link";
import type { Project } from "@/app/_content/projects";
import { dictionaries } from "@/app/_locale/dictionaries";
import { pathTo, type Locale } from "@/app/_locale/routes";
import { ProofLinks } from "./proof-links";

/**
 * One Project in Selected Work.
 *
 * A full-width row rather than a card in a grid, which is what lets the
 * section read as deliberate holding a single Project: a row is complete on
 * its own, where one card in a three-column grid is visibly two short. The
 * hairline above it belongs to the row, so a second Project arriving separates
 * itself without the section changing.
 *
 * It is an `article` because it is a self-contained piece about one subject,
 * and it is titled by its own heading — a screen-reader Reader listing the
 * page's articles hears the Project names.
 */
export function ProjectRow({ project, locale }: { project: Project; locale: Locale }) {
  const strings = dictionaries[locale];
  const titleId = `project-${project.slug}`;
  const caseStudyPath = pathTo(locale, project.caseStudy);

  return (
    <article aria-labelledby={titleId} className="reveal rule-draw rule-t py-10">
      <h3 id={titleId} className="text-title font-semibold text-ink">
        {/* The whole route into the Case Study is this one link. The visible
            text is the Project's name, so it reads as a title; the accessible
            name says what following it does, because "BikeCheck" alone tells a
            screen-reader Reader nothing about where the link goes. */}
        <Link
          href={caseStudyPath}
          aria-label={`${project.title} — ${strings.selectedWork.readCaseStudy}`}
          className="link link-sweep"
        >
          {project.title}
        </Link>
      </h3>

      <p className="mt-3 max-w-measure text-body text-muted">
        {project.description[locale]}
      </p>

      {/* Stack tags are metadata, so they take the monospace register. A list,
          because that is what they are — a screen reader announces how many
          technologies there are before reading them. */}
      <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-meta text-muted uppercase">
        {project.stack.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>

      {/* Only the Proof Links that point somewhere — see `ProofLinks`, which
          the hero shares, so an absent one renders nothing in both places. */}
      <ProofLinks project={project} locale={locale} spacing="mt-6" />
    </article>
  );
}
