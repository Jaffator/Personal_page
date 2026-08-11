import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale, RouteKey } from "@/app/_locale/routes";
import { SiteHeader } from "@/app/_shell/site-header";

/**
 * Placeholder home page, rendered once and bound to a route in each locale.
 *
 * It exists so the verification suite has a real built route to crawl in both
 * locales, and so the design system is exercised by something rather than
 * asserted in the abstract; the hero, Selected Work and contact sections
 * replace it in later tickets.
 */

const ROUTE: RouteKey = "home";

export function HomeView({ locale }: { locale: Locale }) {
  const strings = dictionaries[locale].home;

  return (
    <>
      <SiteHeader locale={locale} route={ROUTE} />

      <main className="mx-auto max-w-page px-6 pb-24 pt-8">
        <p className="font-mono text-meta text-muted uppercase">{strings.eyebrow}</p>

        <h1 className="mt-6 text-display font-semibold text-ink">{strings.heading}</h1>

        <p className="mt-8 max-w-measure text-lede text-muted">{strings.lede}</p>

        <div className="rule-t mt-16 pt-8">
          <a className="link" href="https://github.com/Jaffator">
            {strings.source}
          </a>
        </div>
      </main>
    </>
  );
}
