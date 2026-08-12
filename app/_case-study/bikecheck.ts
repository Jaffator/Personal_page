import { locales } from "@/app/_locale/routes";
import { assertDeepDiveParity, type LocalisedCaseStudy } from "./documents";

import enOpening from "./bikecheck/en/opening.mdx";
import enArchitecture from "./bikecheck/en/architecture.mdx";
import enFeatureTour from "./bikecheck/en/feature-tour.mdx";
import enRetrospective from "./bikecheck/en/retrospective.mdx";
import enOfflineConstraint from "./bikecheck/en/deep-dive-1/constraint.mdx";
import enOfflineOptions from "./bikecheck/en/deep-dive-1/options.mdx";
import enOfflineChoice from "./bikecheck/en/deep-dive-1/choice.mdx";
import enOfflineCost from "./bikecheck/en/deep-dive-1/cost.mdx";
import enWearConstraint from "./bikecheck/en/deep-dive-2/constraint.mdx";
import enWearOptions from "./bikecheck/en/deep-dive-2/options.mdx";
import enWearChoice from "./bikecheck/en/deep-dive-2/choice.mdx";
import enWearCost from "./bikecheck/en/deep-dive-2/cost.mdx";
import enShellConstraint from "./bikecheck/en/deep-dive-3/constraint.mdx";
import enShellOptions from "./bikecheck/en/deep-dive-3/options.mdx";
import enShellChoice from "./bikecheck/en/deep-dive-3/choice.mdx";
import enShellCost from "./bikecheck/en/deep-dive-3/cost.mdx";

import csOpening from "./bikecheck/cs/opening.mdx";
import csArchitecture from "./bikecheck/cs/architecture.mdx";
import csFeatureTour from "./bikecheck/cs/feature-tour.mdx";
import csRetrospective from "./bikecheck/cs/retrospective.mdx";
import csOfflineConstraint from "./bikecheck/cs/deep-dive-1/constraint.mdx";
import csOfflineOptions from "./bikecheck/cs/deep-dive-1/options.mdx";
import csOfflineChoice from "./bikecheck/cs/deep-dive-1/choice.mdx";
import csOfflineCost from "./bikecheck/cs/deep-dive-1/cost.mdx";
import csWearConstraint from "./bikecheck/cs/deep-dive-2/constraint.mdx";
import csWearOptions from "./bikecheck/cs/deep-dive-2/options.mdx";
import csWearChoice from "./bikecheck/cs/deep-dive-2/choice.mdx";
import csWearCost from "./bikecheck/cs/deep-dive-2/cost.mdx";
import csShellConstraint from "./bikecheck/cs/deep-dive-3/constraint.mdx";
import csShellOptions from "./bikecheck/cs/deep-dive-3/options.mdx";
import csShellChoice from "./bikecheck/cs/deep-dive-3/choice.mdx";
import csShellCost from "./bikecheck/cs/deep-dive-3/cost.mdx";

/**
 * BikeCheck's Case Study: which document fills which part, in each locale.
 *
 * This is the whole of what adding a Project's Case Study means — a file like
 * this one and the documents it names. No component is written, because
 * `CaseStudyLayout` already knows the shape and `DeepDive` already knows what a
 * hard problem looks like.
 *
 * The imports are static and the annotation is `LocalisedCaseStudy`, which is
 * what makes a missing document a build failure. A Czech Deep Dive that was
 * never written is an unresolved module — the build stops. One written but not
 * wired in here is a missing property — `npm run typecheck` stops, and
 * `next build` runs TypeScript. Neither reaches a Reader as a blank section.
 *
 * The Deep Dive titles are prose and therefore localised, but they are single
 * lines rather than documents: a heading is a heading, and giving it an MDX
 * file of its own would wrap one line of text in a paragraph the layout would
 * then have to unwrap.
 */
export const bikecheckCaseStudy: LocalisedCaseStudy = {
  en: {
    opening: enOpening,
    architecture: enArchitecture,
    featureTour: enFeatureTour,
    retrospective: enRetrospective,
    deepDives: [
      {
        title: "Logging a ride with no signal",
        constraint: enOfflineConstraint,
        options: enOfflineOptions,
        choice: enOfflineChoice,
        cost: enOfflineCost,
      },
      {
        title: "Wear that follows a component between bicycles",
        constraint: enWearConstraint,
        options: enWearOptions,
        choice: enWearChoice,
        cost: enWearCost,
      },
      {
        title: "Shipping to Android as one developer",
        constraint: enShellConstraint,
        options: enShellOptions,
        choice: enShellChoice,
        cost: enShellCost,
      },
    ],
  },

  cs: {
    opening: csOpening,
    architecture: csArchitecture,
    featureTour: csFeatureTour,
    retrospective: csRetrospective,
    deepDives: [
      {
        title: "Zápis jízdy bez signálu",
        constraint: csOfflineConstraint,
        options: csOfflineOptions,
        choice: csOfflineChoice,
        cost: csOfflineCost,
      },
      {
        title: "Opotřebení, které jde s komponentou mezi koly",
        constraint: csWearConstraint,
        options: csWearOptions,
        choice: csWearChoice,
        cost: csWearCost,
      },
      {
        title: "Vydat aplikaci na Android jako jednotlivec",
        constraint: csShellConstraint,
        options: csShellOptions,
        choice: csShellChoice,
        cost: csShellCost,
      },
    ],
  },
};

// Runs at module scope, so a locale left one Deep Dive short fails the build.
assertDeepDiveParity("bikecheck", bikecheckCaseStudy, locales);
