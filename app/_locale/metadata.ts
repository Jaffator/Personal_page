import type { Metadata } from "next";
import { dictionaries } from "./dictionaries";
import { defaultLocale, locales, pathTo, type Locale, type RouteKey } from "./routes";

/** The origin every canonical and alternate URL is resolved against. */
const SITE_URL = new URL("https://jardalufi.cz");

/** Open Graph wants a language and a territory, unlike `hreflang`. */
const OPEN_GRAPH_LOCALES: Record<Locale, string> = { en: "en_GB", cs: "cs_CZ" };

/**
 * The metadata for one page in one locale.
 *
 * Both locales of a route publish the same alternates map. That is what makes
 * the declaration reciprocal — each version points at the other and at itself,
 * so neither is read as a duplicate of the other. `x-default` names English,
 * which is the version pasted into applications and the one to rank.
 */
export function pageMetadata(locale: Locale, route: RouteKey): Metadata {
  const { title, description } = dictionaries[locale].meta[route];
  const path = pathTo(locale, route);

  const languages: Record<string, string> = {};
  for (const alternate of locales) {
    languages[alternate] = pathTo(alternate, route);
  }
  languages["x-default"] = languages[defaultLocale];

  return {
    metadataBase: SITE_URL,
    title,
    description,
    alternates: { canonical: path, languages },
    openGraph: {
      type: "website",
      siteName: "Jaroslav Lufinka",
      title,
      description,
      url: path,
      locale: OPEN_GRAPH_LOCALES[locale],
      alternateLocale: locales
        .filter((alternate) => alternate !== locale)
        .map((alternate) => OPEN_GRAPH_LOCALES[alternate]),
    },
  };
}
