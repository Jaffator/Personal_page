import type { ReactNode } from "react";

/**
 * A pass-through, on purpose.
 *
 * `<html lang>` belongs to the document, and the two locales are not the same
 * language, so the document is rendered per locale — by `app/(en)/layout.tsx`
 * and `app/(cs)/layout.tsx`, both through `SiteDocument`. Next.js reaches that
 * arrangement by removing the root layout altogether, but the root layout is
 * also what wraps `app/not-found.tsx`: without one, the framework supplies its
 * own bare `<html>` shell, the site's 404 renders a second `<html>` inside it,
 * and the result is invalid markup with no language declared.
 *
 * So the file stays and renders nothing. Every child in the tree supplies the
 * document itself, which is what the built output shows: one `<html>` per page,
 * carrying that page's language.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
