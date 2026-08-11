import { projects } from "@/app/_content/projects";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale, RouteKey } from "@/app/_locale/routes";
import { SiteHeader } from "@/app/_shell/site-header";

/**
 * The Case Study, as a placeholder.
 *
 * The route exists now because Selected Work links into it, and a link a
 * Reader can follow to a 404 is worse than no link at all. What it renders is
 * deliberately thin: ticket 05 builds the real page — MDX prose per locale
 * through one shared layout, per ADR 0002 — and replaces this body. The route
 * key, the metadata and the suite's coverage of it are already in place by
 * then.
 *
 * It reads its title from the content module rather than from a dictionary,
 * because a Project's name is content and there is exactly one place it is
 * written down.
 */

const ROUTE: RouteKey = "caseStudy";

export function CaseStudyView({ locale }: { locale: Locale }) {
  const project = projects[0];
  const strings = dictionaries[locale].home;

  return (
    <>
      <SiteHeader locale={locale} route={ROUTE} />

      <main className="mx-auto max-w-page px-6 pb-24 pt-8">
        <p className="font-mono text-meta text-muted uppercase">{strings.eyebrow}</p>

        <h1 className="mt-6 text-display font-semibold text-ink">{project.title}</h1>

        <p className="mt-8 max-w-measure text-lede text-muted">
          {project.description[locale]}
        </p>
      </main>
    </>
  );
}
