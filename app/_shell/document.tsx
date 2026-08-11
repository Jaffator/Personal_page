import type { ReactNode } from "react";
import { preload } from "react-dom";
import type { Locale } from "@/app/_locale/routes";
import "../globals.css";

/**
 * The document each locale's root layout renders.
 *
 * There is one root layout per locale rather than one for the site, because
 * `<html lang>` is set on the document and the two locales are not the same
 * language. Both trees hand off to this component so the head, the preloads
 * and the stylesheet are declared once. The not-found page renders it too: it
 * sits above both trees and so inherits neither layout.
 */

/**
 * The latin subsets carry every glyph the site paints before the Reader has
 * read a word, so they are preloaded: paired with `font-display: optional` in
 * globals.css, the face is in hand before the first paint and nothing swaps
 * afterwards. The latin-ext subsets stay on demand — only the Czech locale
 * reaches for them.
 */
const PRELOADED_FONTS = [
  "/fonts/inter-latin.woff2",
  "/fonts/jetbrains-mono-latin.woff2",
];

export function SiteDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  // React's own preload API rather than rendered <link> tags: a rendered tag
  // is emitted once as itself and once as a hoisted resource hint, which the
  // browser reports as a duplicate request.
  for (const href of PRELOADED_FONTS) {
    // `crossOrigin` is required even same-origin, because fonts are fetched in
    // CORS mode and a preload without it is simply downloaded twice.
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
