import type { RouteKey } from "@/app/_locale/routes";
import type { Localised } from "./localised";

/**
 * The Projects the site presents, and the types that make a malformed one a
 * failed build rather than a gap in front of a Reader.
 *
 * It is a collection holding one entry, and that is the point: BikeCheck is
 * the only Project today, lufihome is expected, and adding it must be an entry
 * in the array below rather than a component rewrite. Nothing downstream may
 * assume the length is one — Selected Work maps over this list.
 *
 * Small exercises and learning repositories are not Projects and do not belong
 * here; see CONTEXT.md.
 */

/**
 * What a Proof Link is evidence of.
 *
 * A closed union, so a kind cannot be invented at a call site and the label
 * for each is written in both locales before the build passes. `googlePlay` is
 * modelled while BikeCheck is unpublished: that is what lets publishing be a
 * URL added to the entry below rather than a change to a component.
 */
export type ProofLinkKind = "source" | "googlePlay";

/**
 * An outbound link that lets a Reader verify a Project exists independently of
 * this site's claims.
 *
 * `href` is optional because a Proof Link can be modelled before it exists. A
 * link with no `href` renders nothing at all — not an empty slot and not a
 * "coming soon", either of which would be a claim the site cannot support.
 *
 * `note` qualifies what the Reader will find. BikeCheck's repository carries
 * one saying it is actively in development, so a Reader judges it as work in
 * progress rather than as a finished release.
 */
export type ProofLink = {
  kind: ProofLinkKind;
  /** Absent until the thing being pointed at exists. */
  href?: string;
  note?: Localised<string>;
};

export type Project = {
  /** Identifies the Project in content and in test failures. */
  slug: string;
  /** Where its Case Study lives. Every Project has one. */
  caseStudy: RouteKey;
  title: string;
  /** One line. It sits under the title in Selected Work and must stay scannable. */
  description: Localised<string>;
  /**
   * The technologies the Project is built in, named as a Reader matching it
   * against an open role would search for them. Not localised: "TypeScript" is
   * "TypeScript" in both languages, and translating a technology name would
   * make it unrecognisable.
   */
  stack: readonly string[];
  proofLinks: readonly ProofLink[];
};

export const projects: readonly Project[] = [
  {
    slug: "bikecheck",
    caseStudy: "caseStudy",
    // Not localised: it is the application's name, not a description of it.
    title: "BikeCheck",
    description: {
      en: "An Android application for tracking bicycle service history and component wear, built with Capacitor.",
      cs: "Androidová aplikace pro sledování servisní historie kola a opotřebení komponent, postavená na Capacitoru.",
    },
    stack: ["TypeScript", "React", "Capacitor", "NestJS", "PostgreSQL", "Prisma"],
    proofLinks: [
      {
        kind: "source",
        href: "https://github.com/Jaffator/BikeCheck",
        note: {
          en: "Actively in development",
          cs: "Aktivně se vyvíjí",
        },
      },
      // Modelled, and deliberately without a URL: BikeCheck is not published.
      // Publishing means adding `href` here and nothing else.
      { kind: "googlePlay" },
    ],
  },
];

/** The Proof Links that actually point somewhere, in the order declared. */
export function resolvedProofLinks(project: Project): readonly ProofLink[] {
  return project.proofLinks.filter((link) => link.href !== undefined);
}
