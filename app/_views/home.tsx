import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale, RouteKey } from "@/app/_locale/routes";
import { SelectedWork } from "@/app/_shell/selected-work";
import { SiteHeader } from "@/app/_shell/site-header";

/**
 * The home page, rendered once and bound to a route in each locale.
 *
 * Selected Work is real; what sits above it is still the placeholder opening,
 * which the hero replaces in ticket 06. The contact section follows in 07.
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

        <div className="mt-24">
          <SelectedWork locale={locale} />
        </div>
      </main>
    </>
  );
}
