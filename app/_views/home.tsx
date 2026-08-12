import { firstProject } from "@/app/_content/projects";
import type { Locale, RouteKey } from "@/app/_locale/routes";
import { About } from "@/app/_shell/about";
import { Contact } from "@/app/_shell/contact";
import { Hero } from "@/app/_shell/hero";
import { SelectedWork } from "@/app/_shell/selected-work";
import { SiteHeader } from "@/app/_shell/site-header";
import { Stack } from "@/app/_shell/stack";

/**
 * The home page, rendered once and bound to a route in each locale.
 *
 * The order is the argument the page makes. The claim first, then the work that
 * evidences it, then what it is built with, then who built it, and only then
 * how to get hold of him — a Reader convinced by Selected Work has already
 * decided by the time Contact arrives, and one who was not is not going to be
 * persuaded by a list of technologies. Contact sits last because it is what a
 * Reader goes looking for once they have made up their mind, and the end of the
 * page is where they look.
 */

const ROUTE: RouteKey = "home";

/** The gap between sections. One value, so the page has one rhythm. */
const SECTION_SPACING = "mt-24";

export function HomeView({ locale }: { locale: Locale }) {
  return (
    <>
      <SiteHeader locale={locale} route={ROUTE} />

      <main className="mx-auto max-w-page px-6 pb-24 pt-8">
        <Hero project={firstProject()} locale={locale} />

        <div className={SECTION_SPACING}>
          <SelectedWork locale={locale} />
        </div>

        <div className={SECTION_SPACING}>
          <Stack locale={locale} />
        </div>

        <div className={SECTION_SPACING}>
          <About locale={locale} />
        </div>

        <div className={SECTION_SPACING}>
          <Contact locale={locale} />
        </div>
      </main>
    </>
  );
}
