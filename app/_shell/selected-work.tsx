import { projects } from "@/app/_content/projects";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";
import { ProjectRow } from "./project-row";
import { SectionHeading } from "./section-heading";

/**
 * The home page section that lists Projects.
 *
 * It maps the collection rather than rendering BikeCheck, so adding lufihome
 * is an entry in `app/_content/projects.ts` and nothing here changes. It holds
 * one Project today and must not be built to look like a grid waiting for a
 * second — see `ProjectRow` for how that is held.
 *
 * A labelled `section` is a landmark, so a screen-reader Reader can jump
 * straight to the work rather than tabbing past the header to find it.
 */

const HEADING_ID = "selected-work";

export function SelectedWork({ locale }: { locale: Locale }) {
  const strings = dictionaries[locale].selectedWork;

  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID} index={strings.index}>
        {strings.heading}
      </SectionHeading>

      {projects.map((project) => (
        <ProjectRow key={project.slug} project={project} locale={locale} />
      ))}
    </section>
  );
}
