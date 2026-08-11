import { firstProject } from "@/app/_content/projects";
import type { Locale, RouteKey } from "@/app/_locale/routes";
import { Hero } from "@/app/_shell/hero";
import { SelectedWork } from "@/app/_shell/selected-work";
import { SiteHeader } from "@/app/_shell/site-header";

/**
 * The home page, rendered once and bound to a route in each locale.
 *
 * The hero and Selected Work are real. The contact section follows in 07.
 */

const ROUTE: RouteKey = "home";

export function HomeView({ locale }: { locale: Locale }) {
  return (
    <>
      <SiteHeader locale={locale} route={ROUTE} />

      <main className="mx-auto max-w-page px-6 pb-24 pt-8">
        <Hero project={firstProject()} locale={locale} />

        <div className="mt-24">
          <SelectedWork locale={locale} />
        </div>
      </main>
    </>
  );
}
