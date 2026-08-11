/**
 * The route inventory the verification suite crawls.
 *
 * Every check in this suite iterates over this list, so adding a route here is
 * the only step needed to bring it under accessibility, keyboard, viewport and
 * audit coverage. Paths are written as they appear in the built site.
 */
export const routes: readonly string[] = ["/"];
