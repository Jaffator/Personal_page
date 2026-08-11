/**
 * The locale and route model every URL on the site is derived from.
 *
 * English serves from the root and Czech from a prefix (ADR 0003), so a path
 * cannot be built by concatenating a locale onto a route — the default locale
 * contributes no segment at all. Everything that needs a URL asks `pathTo`
 * rather than writing one out. That is what lets the language switch resolve
 * the equivalent page in the other locale instead of returning to the home
 * page, and it is why adding a route means adding a key here rather than
 * threading a string through the components that link to it.
 */

export const locales = ["en", "cs"] as const;
export type Locale = (typeof locales)[number];

/** The locale served from the root, and the one `x-default` points at. */
export const defaultLocale: Locale = "en";

export const routeKeys = ["home", "caseStudy"] as const;
export type RouteKey = (typeof routeKeys)[number];

/**
 * Where each route sits inside a locale, as path segments and without the
 * locale prefix. The home page is the empty path, which is the only reason
 * this is a segment list rather than a string.
 *
 * The Case Study's segment is the Project's slug, and the same slug in both
 * locales: it is the URL pasted into a job application, so it stays stable and
 * recognisable rather than translating into a second address for one page.
 */
const ROUTE_SEGMENTS: Record<RouteKey, readonly string[]> = {
  home: [],
  caseStudy: ["bikecheck"],
};

/** The path a route occupies in a locale, as it appears in the built site. */
export function pathTo(locale: Locale, route: RouteKey): string {
  const prefix = locale === defaultLocale ? [] : [locale];
  return `/${[...prefix, ...ROUTE_SEGMENTS[route]].join("/")}`;
}
