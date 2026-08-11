import Link from "next/link";
import { dictionaries } from "@/app/_locale/dictionaries";
import { locales, pathTo, type Locale, type RouteKey } from "@/app/_locale/routes";

/**
 * The site header, which for now holds only the language switch.
 *
 * The switch takes the route it is sitting on rather than reading the URL, so
 * it resolves the equivalent page in each locale at build time and the site
 * ships no JavaScript to work out where a Reader currently is. It is a pair of
 * ordinary links, so it is reachable by tab and its targets are visible in the
 * status bar before a Reader commits to one.
 */

/**
 * Language names are written in their own language, never translated: a Czech
 * Reader landing on the English page scans for "Čeština", not for "Czech".
 */
const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  cs: "Čeština",
};

export function SiteHeader({ locale, route }: { locale: Locale; route: RouteKey }) {
  return (
    <header className="mx-auto max-w-page px-6 py-8">
      <nav
        aria-label={dictionaries[locale].languageSwitch.label}
        className="flex justify-end"
      >
        <ul className="flex gap-6 font-mono text-meta uppercase">
          {locales.map((candidate) => {
            const isCurrent = candidate === locale;
            return (
              <li key={candidate}>
                {/* The active language is ink and unadorned; the other carries
                    the site's link treatment. Two channels, colour and
                    underline, so the active one is not signalled by colour
                    alone. `aria-current` says the same thing to a screen
                    reader, which sees neither. */}
                <Link
                  href={pathTo(candidate, route)}
                  hrefLang={candidate}
                  lang={candidate}
                  aria-current={isCurrent ? "page" : undefined}
                  className={isCurrent ? "text-ink" : "link"}
                >
                  {LANGUAGE_NAMES[candidate]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
