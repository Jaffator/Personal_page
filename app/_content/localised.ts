import type { Locale } from "@/app/_locale/routes";

/**
 * A content value written once per locale.
 *
 * `Record` over `Locale` rather than a partial map, so a Czech title left
 * unwritten fails the build exactly as a missing dictionary string does. It is
 * the same guarantee `app/_locale/cs.ts` gets, applied to content rather than
 * to interface strings.
 *
 * Only text takes this shape. A slug, a stack tag and an outbound URL are the
 * same in both languages, and wrapping them would invite a Reader-facing
 * difference where none should exist.
 */
export type Localised<T> = Record<Locale, T>;

/** The value for one locale. Components resolve, they never pick a language. */
export function resolve<T>(value: Localised<T>, locale: Locale): T {
  return value[locale];
}
