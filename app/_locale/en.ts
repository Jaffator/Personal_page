import type { ProofLinkKind } from "@/app/_content/projects";
import type { RouteKey } from "./routes";

/**
 * The English dictionary, and the reference every other locale is measured
 * against: `Dictionary` below is derived from this object rather than declared
 * separately, so a string added here and forgotten in Czech stops the Czech
 * dictionary typechecking. `next build` runs TypeScript, so that is a failed
 * build rather than an English string appearing on a Czech page.
 *
 * Interface strings only. Case Study prose lives in MDX per locale (ADR 0002)
 * and must not migrate in here.
 */
export const en = {
  languageSwitch: {
    /** Names the switch for a screen reader, which has no visual context. */
    label: "Language",
  },

  /**
   * One title and description per route. Keyed by `RouteKey`, so adding a
   * route forces both to be written in every locale before the build passes.
   */
  meta: {
    home: {
      title: "Jaroslav Lufinka",
      description:
        "Jaroslav Lufinka builds software. This site presents BikeCheck, an Android application built with Capacitor, in depth.",
    },
    caseStudy: {
      title: "BikeCheck — Case Study",
      description:
        "How BikeCheck was built: an Android application for bicycle service history, from the domain model through to the decisions it cost.",
    },
  } satisfies Record<RouteKey, { title: string; description: string }>,

  home: {
    eyebrow: "In progress",
    heading: "Jaroslav Lufinka",
    lede: "This site is under construction. It will present BikeCheck — an Android application built with Capacitor — as a Case Study.",
  },

  /**
   * The Selected Work section. Project titles, descriptions and Proof Link
   * notes are not here — those are content, and live in `app/_content/`.
   * What is here is the furniture around them, which is interface.
   */
  selectedWork: {
    heading: "Selected Work",
    /** The section index, in the monospace register the design system reserves for metadata. */
    index: "01",
    /** Names the section for a screen reader jumping between landmarks. */
    label: "Selected Work",
    /** Reads after the Project's title: "Read the BikeCheck case study". */
    readCaseStudy: "Read the case study",
  },

  /**
   * What each kind of Proof Link is called. Keyed by `ProofLinkKind`, so a new
   * kind must be named in every locale before the build passes — including one
   * that carries no URL yet.
   */
  proofLinks: {
    source: "Source on GitHub",
    googlePlay: "Get it on Google Play",
  } satisfies Record<ProofLinkKind, string>,
};

/**
 * The shape every locale must fill. Derived rather than declared so there is
 * one place to add a string, not two.
 */
export type Dictionary = typeof en;
