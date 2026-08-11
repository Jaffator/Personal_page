import { expect, test, type Locator, type Page } from "@playwright/test";
import { equivalentOf, routes, type Locale, type Route } from "./routes";
import { visitRoute } from "./visit";

/**
 * Selected Work, asserted through the built site: what a Reader scanning the
 * home page for evidence actually finds there.
 *
 * The section is found by its accessible name rather than by a test hook, so
 * these checks also prove it is a labelled landmark a screen-reader Reader can
 * jump to. What each Project must carry — a title, a one-line description,
 * stack tags and a way through to its Case Study — is asserted per entry rather
 * than for BikeCheck specifically, because the point of the collection is that
 * a second Project arrives as content and is held to the same bar without a
 * line changing here.
 */

const HOME = routes.filter((route) => route.key === "home");

/**
 * The Project's own repository. Written out rather than imported from the
 * content module for the same reason `routes.ts` is written out by hand: a
 * check that read the URL from the source it is checking would agree with a
 * typo in it, and this is a link a Reader follows off the site.
 */
const SOURCE_URL = "https://github.com/Jaffator/BikeCheck";

/** Every host a Google Play listing could be published under. */
const GOOGLE_PLAY_HOST = "play.google.com";

function selectedWork(page: Page): Locator {
  return page.getByRole("region", { name: /selected work|vybran/i });
}

/** One entry in the section — an article, which is what a Project row is. */
function projects(page: Page): Locator {
  return selectedWork(page).getByRole("article");
}

/** The home page in the other locale, for the per-locale copy checks. */
function otherLocaleHome(route: Route, locale: Locale): Route {
  return equivalentOf(route, locale);
}

test.describe("the section", () => {
  for (const route of HOME) {
    test(`${route.path} presents Selected Work as a named section`, async ({ page }) => {
      await visitRoute(page, route.path);

      await expect(
        selectedWork(page),
        `${route.path} has no Selected Work section a Reader could find or a screen reader could jump to.`,
      ).toHaveCount(1);

      await expect(
        selectedWork(page).getByRole("heading"),
        `Selected Work on ${route.path} is a region with no heading, so it announces itself as a landmark with nothing to say.`,
      ).not.toHaveCount(0);
    });

    test(`${route.path} lists at least one Project`, async ({ page }) => {
      await visitRoute(page, route.path);

      // The floor is one, not exactly one. A section that broke the moment
      // lufihome was added would be the structural coupling this ticket exists
      // to avoid.
      expect(
        await projects(page).count(),
        `Selected Work on ${route.path} renders no Projects, so the section a Reader came for is empty.`,
      ).toBeGreaterThan(0);
    });
  }
});

test.describe("every Project", () => {
  for (const route of HOME) {
    test(`${route.path} gives each Project a title and a description`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      for (const project of await projects(page).all()) {
        const title = project.getByRole("heading").first();

        expect(
          (await title.textContent())?.trim() ?? "",
          `A Project on ${route.path} has no title, so a Reader cannot tell what it is.`,
        ).not.toBe("");

        const text = (await project.innerText()).trim();
        expect(
          text.length,
          `A Project on ${route.path} carries nothing but a title, so a Reader learns nothing about it.`,
        ).toBeGreaterThan(((await title.textContent()) ?? "").trim().length);
      }
    });

    test(`${route.path} names each Project's stack`, async ({ page }) => {
      await visitRoute(page, route.path);

      for (const project of await projects(page).all()) {
        const tags = project.getByRole("listitem");

        expect(
          await tags.count(),
          `A Project on ${route.path} lists no stack tags, so a Reader cannot match it against an open role.`,
        ).toBeGreaterThan(0);

        for (const tag of await tags.all()) {
          expect(
            (await tag.textContent())?.trim() ?? "",
            `A stack tag on ${route.path} is empty.`,
          ).not.toBe("");
        }
      }
    });

    test(`${route.path} leads each Project through to its Case Study`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      for (const project of await projects(page).all()) {
        // An internal link: the route into the Case Study, not one of the
        // outbound Proof Links.
        const intoCaseStudy = project.locator('a[href^="/"]');

        expect(
          await intoCaseStudy.count(),
          `A Project on ${route.path} offers no way through to its Case Study, so the main route into the work is missing.`,
        ).toBeGreaterThan(0);

        const href = await intoCaseStudy.first().getAttribute("href");
        const target = routes.find((candidate) => candidate.path === href);

        expect(
          target,
          `A Project on ${route.path} links to ${href}, which is not a route this site serves.`,
        ).toBeDefined();

        expect(
          target!.locale,
          `A Project on ${route.path} links through to its Case Study in ${target!.locale}, sending a Reader out of the language they are reading in.`,
        ).toBe(route.locale);
      }
    });
  }
});

test.describe("Proof Links", () => {
  for (const route of HOME) {
    test(`${route.path} links out to the source repository`, async ({ page }) => {
      await visitRoute(page, route.path);

      await expect(
        selectedWork(page).locator(`a[href^="${SOURCE_URL}"]`),
        `Selected Work on ${route.path} does not link out to the source repository, so a Reader cannot verify the Project exists independently of this site's own claims.`,
      ).not.toHaveCount(0);
    });

    test(`${route.path} claims no Google Play listing`, async ({ page }) => {
      await visitRoute(page, route.path);

      // The listing is modelled and has no value yet. An absent Proof Link
      // must render nothing at all — an empty slot, a dead link or a "coming
      // soon" would each be a claim the site cannot support.
      await expect(
        page.locator(`a[href*="${GOOGLE_PLAY_HOST}"]`),
        `${route.path} links to Google Play, but BikeCheck is not published there — a Reader following it finds nothing.`,
      ).toHaveCount(0);

      await expect(
        selectedWork(page).locator("a:not([href]), a[href=''], a[href='#']"),
        `Selected Work on ${route.path} renders a link with nowhere to go, so a Proof Link with no value left an empty slot behind.`,
      ).toHaveCount(0);
    });

    test(`${route.path} qualifies the source repository with its note`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      const source = selectedWork(page).locator(`a[href^="${SOURCE_URL}"]`).first();

      // The note is the honesty the spec asks for: the repository is actively
      // in development, and a Reader must meet it as that rather than as a
      // finished release. It has to reach a screen reader too, so the
      // accessible name is what is read, not the visible text alone.
      const announced = [
        (await source.textContent()) ?? "",
        (await source.getAttribute("aria-label")) ?? "",
        (await source.getAttribute("title")) ?? "",
        await source
          .locator("xpath=ancestor::*[self::li or self::p or self::div][1]")
          .innerText()
          .catch(() => ""),
      ]
        .join(" ")
        .trim();

      expect(
        announced.length,
        `The source Proof Link on ${route.path} carries no qualifying note, so the repository is presented as more finished than it is.`,
      ).toBeGreaterThan(SOURCE_URL.length);
    });
  }
});

test.describe("Project text resolves per locale", () => {
  for (const route of HOME.filter((candidate) => candidate.locale === "en")) {
    for (const target of ["cs"] as const) {
      const equivalent = otherLocaleHome(route, target);

      test(`${equivalent.path} describes its Projects in ${target}`, async ({
        page,
      }) => {
        const describe = async (path: string): Promise<string> => {
          await visitRoute(page, path);
          return (await selectedWork(page).innerText()).trim();
        };

        const english = await describe(route.path);
        const translated = await describe(equivalent.path);

        expect(
          translated,
          `Selected Work on ${equivalent.path} is identical to ${route.path}, so its Project text was written once rather than per locale.`,
        ).not.toBe(english);
      });
    }
  }
});
