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

  /**
   * The hero: the opening statement everything below it is graded against.
   *
   * Three deliberate absences, each of which a Reader would otherwise catch or
   * hold against it. No level label — no "junior", no "looking for my first
   * role" — because the Case Study below is what sets the level, and a label
   * here decides the question before a Reader has read any of it. No claim of a
   * Google Play listing, because there is not one. And the technology is
   * Capacitor, never React Native: they are different, and it is the kind of
   * claim that gets checked.
   *
   * Everything here is interface by the test in docs/content.md: it is about
   * the author, not about a Project, so it would still be here with no
   * Projects at all. What BikeCheck *is* stays in `app/_content/projects.ts` —
   * the hero renders that Project's own description rather than restating it,
   * so the two cannot drift into two different accounts of one application.
   */
  hero: {
    /** The location, in the metadata register. Fact, not claim. */
    eyebrow: "Full-stack developer — Jablonec nad Nisou",
    name: "Jaroslav Lufinka",
    /**
     * The positioning. "From the job queue to the screen" is the specific form
     * of end-to-end being claimed, and it is the one the Case Study's Deep
     * Dives actually evidence.
     */
    positioning:
      "I build products end to end — from the job queue to the screen. Not one layer handed off to someone else.",
    /**
     * Frames the Project the claim rests on, and carries the one thing the
     * spec requires be said about authorship: he designed and built it. That
     * is a fact about the author, which is why it is here and not in the
     * Project's description. What the application *does* follows from content.
     */
    projectLead: "Designed and built by me:",
  },

  /**
   * The furniture around a Case Study: the headings naming each part, and the
   * labels for the four moves of a Deep Dive. The prose itself is not here and
   * must not migrate in — it lives in MDX per locale (ADR 0002).
   *
   * These are interface rather than content by the test in docs/content.md:
   * they would still be here with no Projects at all, because they name the
   * shape every Case Study has rather than describing any one Project.
   */
  caseStudy: {
    eyebrow: "Case Study",
    /** Titles the Walkthrough once ticket 08 lands. Unused while the slot is empty. */
    walkthrough: "Watch it run",
    architecture: "How it is built",
    featureTour: "What it does",
    deepDives: "The hard parts",
    retrospective: "Looking back",
    /**
     * The four moves of a Deep Dive, in the metadata register. They repeat for
     * every Deep Dive on the page, which is what makes the set read as one
     * kind of thing rather than three essays.
     */
    deepDive: {
      constraint: "The constraint",
      options: "Options weighed",
      choice: "The choice",
      cost: "What it cost",
    },
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
