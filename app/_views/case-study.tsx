import { bikecheckCaseStudy } from "@/app/_case-study/bikecheck";
import { CaseStudyLayout } from "@/app/_case-study/layout";
import { DeepDive } from "@/app/_case-study/deep-dive";
import { WalkthroughPlayer } from "@/app/_case-study/walkthrough-player";
import { projects } from "@/app/_content/projects";
import { bikecheckWalkthrough } from "@/app/_content/walkthrough";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale, RouteKey } from "@/app/_locale/routes";
import { SiteHeader } from "@/app/_shell/site-header";

/**
 * The Case Study — the page a Reader is sent to from a job application.
 *
 * This file binds one Project's documents to the shared layout and does
 * nothing else. That is the shape the ticket asks for: a second Project's Case
 * Study is another document set and another binding, not another page
 * component. The prose is MDX per locale (ADR 0002); the structure, the
 * headings and the register are `app/_case-study/`.
 *
 * The title comes from the content module rather than a dictionary, because a
 * Project's name is content and there is one place it is written down.
 */

const ROUTE: RouteKey = "caseStudy";

export function CaseStudyView({ locale }: { locale: Locale }) {
  const project = projects[0];
  const documents = bikecheckCaseStudy[locale];
  const labels = dictionaries[locale].caseStudy.deepDive;

  return (
    <>
      <SiteHeader locale={locale} route={ROUTE} />

      <CaseStudyLayout
        locale={locale}
        title={project.title}
        lede={project.description[locale]}
        parts={{
          opening: <documents.opening />,
          architecture: <documents.architecture />,
          featureTour: <documents.featureTour />,
          retrospective: <documents.retrospective />,

          // The same component three times, differing only in its documents —
          // which is the claim the ticket makes about a Deep Dive being a
          // repeatable unit rather than markup written per topic.
          deepDives: documents.deepDives.map((dive, index) => (
            <DeepDive
              key={dive.title}
              id={`deep-dive-${index + 1}`}
              index={String(index + 1).padStart(2, "0")}
              title={dive.title}
              labels={labels}
              constraint={<dive.constraint />}
              options={<dive.options />}
              choice={<dive.choice />}
              cost={<dive.cost />}
            />
          )),

          // The recording itself is still a placeholder — ticket 13 — but the
          // player is real, and swapping the files under it needs no change
          // here. See app/_content/walkthrough.ts.
          walkthrough: (
            <WalkthroughPlayer locale={locale} walkthrough={bikecheckWalkthrough} />
          ),
        }}
      />
    </>
  );
}
