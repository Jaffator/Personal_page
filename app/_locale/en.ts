import type { ProfileKey } from "@/app/_content/profile";
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

  siteLink: {
    /**
     * The wordmark's accessible name.
     *
     * It says where the link goes rather than what it shows: the visible mark
     * is a monogram and a name, which to a Reader listing the page's links
     * reads as an author rather than as a destination. The name is still in it
     * because that list is how a screen-reader Reader identifies whose site
     * this is.
     */
    label: "Home — Jaroslav Lufinka",
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
    /** Titles the Walkthrough, and names its player for a screen reader. */
    walkthrough: "Watch it run",
    /**
     * Names the caption track in the player's own captions menu. The recording
     * is silent, so this is the track carrying its content rather than a
     * transcription of speech — but "captions" is what the control is called
     * and renaming it would only make it harder to find.
     */
    walkthroughCaptions: "Captions",
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

  /**
   * The Stack section. The group names and the technologies under them are
   * content, in `app/_content/profile.ts`; what is here is the furniture.
   *
   * There is no string for a proficiency, a level or a year count, and that is
   * the design rather than an omission: a technical Reader treats "React 85%"
   * as a red flag, because the claim cannot be true. Nothing here gives a
   * component the vocabulary to make one.
   */
  stack: {
    heading: "Stack",
    index: "02",
  },

  /**
   * The About section: the self-taught story, told as fact.
   *
   * It is interface by the test in docs/content.md — every line is about the
   * author rather than about a Project, so it would still be here with no
   * Projects at all — and it is prose, so it is the longest thing the
   * dictionary carries. It stays here rather than moving to MDX because MDX on
   * this site is reserved for Case Study prose (ADR 0002), and About is three
   * paragraphs of interface rather than a document.
   *
   * The framing rule: what was built while learning, stated as fact. No
   * apology, no "only", no "despite having no commercial experience" — the
   * Case Study is what sets the level, and an apology here decides the question
   * before a Reader reaches it.
   */
  about: {
    heading: "About",
    index: "03",
    /**
     * The path, stated plainly. It names what was actually built, because a
     * Reader weighs the work rather than the route to it.
     */
    story:
      "I taught myself to build software, and I learned it the way it is actually done: by shipping something real and living with the decisions. BikeCheck is that project — a full application with a domain model, an API, a database and an Android build, not a tutorial followed to the end.",
    /**
     * What the learning consisted of, in the terms a Reader grades by. It
     * claims process rather than seniority: the thing being evidenced is that
     * he reasons about trade-offs, which the Case Study then demonstrates.
     */
    practice:
      "Along the way I picked up the parts nobody puts in a tutorial — modelling a domain before writing the schema, choosing where the complexity should live, and writing the tests that make a change safe. The Case Study above walks through three of those decisions in full, including what each one cost.",
    /**
     * The one line about AI tooling, and the only place on the site it appears.
     * Said once, plainly, and never again: a second mention reads as either a
     * defence or a selling point, and both undercut the first. What it claims
     * is the thing that actually matters to a Reader — that he can explain the
     * decisions, whatever helped him reach them.
     * `tests/home-sections.spec.ts` asserts the count on the page is exactly one.
     */
    tooling:
      "I build with AI tooling in the loop, the same as most working developers now, and I can explain every decision in this project and defend the trade-offs behind it.",
  },

  /**
   * The Contact section.
   *
   * There is no string for a form field, a submit button or a success message,
   * because there is no form: the site has no backend, and a form that silently
   * swallows a message during a job search is a catastrophic failure. The email
   * is shown as text a Reader can read and copy.
   */
  contact: {
    heading: "Contact",
    index: "04",
    /** Introduces the section. States availability rather than pleading for a reply. */
    lede: "I am looking for a developer role and I read everything that arrives.",
    /** Names the address for a screen reader, which does not get the visual grouping. */
    emailLabel: "Email",
    /**
     * The copy control's name. It names the object, not the gesture, so it is
     * clear when read out of context in a list of a page's controls.
     */
    copyEmail: "Copy email address",
    /**
     * Announced after a successful copy, through a live region. A screen-reader
     * Reader gets no confirmation from a button that merely changed colour.
     */
    copied: "Email address copied",
    /**
     * Announced when the clipboard is refused — an insecure origin, or a
     * browser that withholds permission. Saying so is what lets a Reader fall
     * back to selecting the address, which is visible precisely for this case.
     */
    copyFailed: "Could not copy — select the address to copy it manually",
    /** Where he is. A fact a Reader placing him against a role needs. */
    locationLabel: "Location",
    /** How he will work. Stated plainly rather than left to be asked. */
    availability: "Open to remote or hybrid work",
    /** Names each profile link. The name says where it goes, not "here". */
    profiles: {
      github: "GitHub profile",
      linkedin: "LinkedIn profile",
    } satisfies Record<ProfileKey, string>,
    /**
     * The CV link. It names the format, because a Reader deciding whether to
     * click wants to know a PDF is about to arrive.
     */
    cv: "Download CV (PDF)",
  },
};

/**
 * The shape every locale must fill. Derived rather than declared so there is
 * one place to add a string, not two.
 */
export type Dictionary = typeof en;
