import Link from "next/link";
import { NAME } from "@/app/_content/profile";
import { dictionaries } from "@/app/_locale/dictionaries";
import { locales, pathTo, type Locale, type RouteKey } from "@/app/_locale/routes";
import { SiteMark } from "./site-mark";

/**
 * The site header: the wordmark on the left, the language switch on the
 * right. Present on every route, which is what makes it the one way back to
 * the home page from the Case Study — a Reader arriving there straight from a
 * job application has never seen the home page and has no back-button history
 * to use instead.
 *
 * The switch takes the route it is sitting on rather than reading the URL, so
 * it resolves the equivalent page in each locale at build time and the site
 * ships no JavaScript to work out where a Reader currently is. It is a pair of
 * ordinary links, so it is reachable by tab and its targets are visible in the
 * status bar before a Reader commits to one.
 *
 * The wordmark link sits outside the `<nav>` and carries no `hrefLang`,
 * deliberately: `tests/locale.spec.ts` finds the language switch by looking
 * for the one `nav` containing an `a[hreflang]`, and a second such link here
 * would either break that count or be read as a third language.
 *
 * `sticky` rather than `fixed`: it stays in normal document flow, so no page
 * needs extra top padding to avoid content sliding under it, and it still
 * pins to the top once scrolled to — which is what actually matters for the
 * Case Study, whose content runs far longer than one screen. The outer element
 * carries the sticky position and a full-width background so scrolled-past
 * content never shows through; the inner one holds the page's usual max width.
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
  const strings = dictionaries[locale];
  const isHome = route === "home";

  return (
    <header className="sticky top-0 z-10 bg-page px-6 py-8">
      <div className="mx-auto flex max-w-page items-center justify-between gap-6">
        {/* The wordmark. On the home route it links to the page it is already
            on, matching how the switch beside it treats its own active state —
            `aria-current` says so to a screen reader, which sees no difference
            in the link's destination. */}
        <Link
          href={pathTo(locale, "home")}
          aria-label={strings.siteLink.label}
          aria-current={isHome ? "page" : undefined}
          className="link-sweep flex items-center gap-3 text-ink"
        >
          <SiteMark />
          <span className="font-mono text-meta uppercase">{NAME}</span>
        </Link>

        <nav aria-label={strings.languageSwitch.label} className="flex">
          <ul className="flex gap-6 font-mono text-meta uppercase">
            {locales.map((candidate) => {
              const isCurrent = candidate === locale;
              return (
                <li key={candidate}>
                  {/* The active language is ink and unadorned; the other
                      carries the site's link treatment. Two channels, colour
                      and underline, so the active one is not signalled by
                      colour alone. `aria-current` says the same thing to a
                      screen reader, which sees neither. */}
                  <Link
                    href={pathTo(candidate, route)}
                    hrefLang={candidate}
                    lang={candidate}
                    aria-current={isCurrent ? "page" : undefined}
                    className={isCurrent ? "text-ink" : "link link-sweep"}
                  >
                    {LANGUAGE_NAMES[candidate]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
