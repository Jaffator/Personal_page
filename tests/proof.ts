/**
 * What the verification suite knows about BikeCheck's Proof Links, shared by
 * the checks that assert them in the hero and in Selected Work.
 *
 * These are written out by hand rather than imported from
 * `app/_content/projects.ts`, for the same reason `routes.ts` is: the suite's
 * value is that it asserts the built site from the outside, and a check that
 * read the URL from the source it is checking would agree with a typo in it.
 * They live here rather than being copied into each spec so that the two places
 * a Proof Link appears are held to one definition of what it points at.
 */

/** The Project's own repository — a link a Reader follows off the site. */
export const SOURCE_URL = "https://github.com/Jaffator/BikeCheck";

/** The host a Google Play listing would be published under. */
export const GOOGLE_PLAY_HOST = "play.google.com";

/**
 * Anchors that lead nowhere. A Proof Link with no value must render nothing at
 * all, so finding one of these means an absent link left an empty slot behind.
 */
export const DEAD_LINK_SELECTOR = "a:not([href]), a[href=''], a[href='#']";
