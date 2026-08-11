/**
 * The route inventory the verification suite crawls.
 *
 * Every check in this suite iterates over this list, so adding a route here is
 * the only step needed to bring it under accessibility, keyboard, viewport,
 * locale and audit coverage.
 *
 * It is written out by hand rather than imported from the site's own locale
 * module. The suite's whole value is that it asserts the built site from the
 * outside; if it derived the Czech path from the same function the site uses,
 * a bug in that function would produce a suite that agreed with it. `path` is
 * therefore what a Reader would type, and `key` is what the two locales of one
 * page have in common — which is what the language switch has to preserve.
 */

export const locales = ["en", "cs"] as const;
export type Locale = (typeof locales)[number];

/** Named so a typo in the inventory below is a typecheck failure, not a throw. */
export type RouteKey = "home";

export type Route = {
  /** Identifies the same page across locales. */
  key: RouteKey;
  locale: Locale;
  /** The path as it appears in the built site. */
  path: string;
};

export const routes: readonly Route[] = [
  { key: "home", locale: "en", path: "/" },
  { key: "home", locale: "cs", path: "/cs" },
];

/** The same page in another locale — what the language switch must land on. */
export function equivalentOf(route: Route, locale: Locale): Route {
  const match = routes.find(
    (candidate) => candidate.key === route.key && candidate.locale === locale,
  );
  if (!match) {
    throw new Error(
      `No ${locale} route for "${route.key}" — every route must exist in every locale.`,
    );
  }
  return match;
}
