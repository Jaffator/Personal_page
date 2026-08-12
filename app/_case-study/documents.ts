import type { ComponentType } from "react";
import type { Localised } from "@/app/_content/localised";
import type { Locale } from "@/app/_locale/routes";
import type { DeepDiveParts } from "./deep-dive";

/**
 * Which prose documents a Case Study is made of, and the types that make a
 * missing one a failed build.
 *
 * The guarantee the ticket asks for — a Case Study document missing in one
 * locale fails the build rather than producing a broken page — is bought here,
 * by `Localised<T>` being `Record<Locale, T>` rather than a partial map, and by
 * every part being required. A Czech Deep Dive left unwritten is not a gap a
 * Reader finds; it is `npm run typecheck`, and therefore `next build`, refusing
 * to produce the page at all.
 *
 * A document is a compiled MDX module's default export: a component taking no
 * props. It is imported statically, not read from disk at request time, because
 * the site is a static export (ADR 0001) and a dynamic import keyed by locale
 * would defeat exactly the check this file exists to provide — a path that
 * resolves at runtime cannot fail a build.
 */

/** A compiled MDX document. */
export type ProseDocument = ComponentType;

/** One Deep Dive's four moves, each its own document. */
export type DeepDiveDocuments = {
  /** Titles the Deep Dive. Prose, so it is localised. */
  title: string;
} & Record<keyof DeepDiveParts, ProseDocument>;

/**
 * Everything a Case Study needs in one locale.
 *
 * The Walkthrough is absent: it is a recording, not prose, and the same file
 * serves both locales because it is silent (see CONTEXT.md).
 */
export type CaseStudyDocuments = {
  opening: ProseDocument;
  architecture: ProseDocument;
  featureTour: ProseDocument;
  /**
   * Two or three, in reading order. A Deep Dive is the repeatable unit, so the
   * count lives in content rather than in the type — but see
   * `assertDeepDiveParity`: the two locales must tell the same story.
   */
  deepDives: readonly DeepDiveDocuments[];
  retrospective: ProseDocument;
};

/** A Case Study, written in every locale. Partial does not typecheck. */
export type LocalisedCaseStudy = Localised<CaseStudyDocuments>;

/**
 * Fails when the locales disagree about how many Deep Dives there are.
 *
 * The type system makes every *named* part total, but `deepDives` is a list and
 * a list's length is not a type. Without this, English could carry three Deep
 * Dives and Czech two, and the Czech Reader would simply never learn the third
 * problem was solved — a silent content gap of exactly the kind the rest of
 * this file rules out. Called at module scope in `bikecheck.ts`, so it throws
 * during the build rather than in front of a Reader.
 */
export function assertDeepDiveParity(
  slug: string,
  study: LocalisedCaseStudy,
  locales: readonly Locale[],
): void {
  const counts = locales.map((locale) => ({
    locale,
    count: study[locale].deepDives.length,
  }));

  const [first, ...rest] = counts;
  const mismatch = rest.find((entry) => entry.count !== first.count);

  if (mismatch) {
    throw new Error(
      `The "${slug}" Case Study has ${first.count} Deep Dive(s) in ${first.locale} but ` +
        `${mismatch.count} in ${mismatch.locale}. Every Deep Dive must be written in ` +
        `every locale — a Reader in one language would otherwise never learn the ` +
        `problem was solved.`,
    );
  }
}
