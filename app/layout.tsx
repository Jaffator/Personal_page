import type { Metadata } from "next";
import { preload } from "react-dom";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jardalufi.cz"),
  title: "Jaroslav Lufinka",
  description:
    "Jaroslav Lufinka builds software. This site presents BikeCheck, an Android application built with Capacitor, in depth.",
};

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  // React's own preload API rather than rendered <link> tags: a rendered tag
  // is emitted once as itself and once as a hoisted resource hint, which the
  // browser reports as a duplicate request.
  for (const href of PRELOADED_FONTS) {
    // `crossOrigin` is required even same-origin, because fonts are fetched in
    // CORS mode and a preload without it is simply downloaded twice.
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
