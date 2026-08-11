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
  } satisfies Record<RouteKey, { title: string; description: string }>,

  home: {
    eyebrow: "In progress",
    heading: "Jaroslav Lufinka",
    lede: "This site is under construction. It will present BikeCheck — an Android application built with Capacitor — as a Case Study.",
    source: "Source on GitHub",
  },
};

/**
 * The shape every locale must fill. Derived rather than declared so there is
 * one place to add a string, not two.
 */
export type Dictionary = typeof en;
