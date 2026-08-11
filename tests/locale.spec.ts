import { expect, test, type Locator, type Page } from "@playwright/test";
import { equivalentOf, locales, routes, type Locale, type Route } from "./routes";
import { visitRoute } from "./visit";

/**
 * The locale shell, asserted the way a Reader and a crawler meet it: the
 * language a page declares, the switch that moves between languages, and the
 * head links that stop the two versions being read as duplicates of each other.
 *
 * The production origin is written out rather than taken from the site, because
 * these URLs are what appears in a search index and in a pasted link — a
 * canonical that agreed with a mistake in the site's own base URL would be
 * exactly the bug worth catching.
 */
const SITE_ORIGIN = "https://jardalufi.cz";

function expectedUrl(path: string): string {
  return withoutTrailingSlash(new URL(path, SITE_ORIGIN).toString());
}

/** `/` resolves to an origin with a trailing slash; the built canonical has none. */
function withoutTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * The switch is found by what it is rather than by a test hook: the navigation
 * whose links declare the language of what they point at.
 */
function languageSwitch(page: Page): Locator {
  return page.locator("nav").filter({ has: page.locator("a[hreflang]") });
}

function switchLink(page: Page, locale: Locale): Locator {
  return languageSwitch(page).locator(`a[hreflang="${locale}"]`);
}

/** Every `hreflang` the page declares in its head, keyed by language. */
async function readAlternates(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() =>
    Object.fromEntries(
      Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]'),
      ).map((link) => [link.getAttribute("hreflang")!, link.href.replace(/\/$/, "")]),
    ),
  );
}

/** What every version of a route should declare, whichever version is asked. */
function expectedAlternates(route: Route): Record<string, string> {
  const declared: Record<string, string> = {
    "x-default": expectedUrl(equivalentOf(route, "en").path),
  };
  for (const locale of locales) {
    declared[locale] = expectedUrl(equivalentOf(route, locale).path);
  }
  return declared;
}

test.describe("the page declares its language", () => {
  for (const route of routes) {
    test(`${route.path} is served as ${route.locale}`, async ({ page }) => {
      await visitRoute(page, route.path);

      await expect(
        page.locator("html"),
        `${route.path} does not declare lang="${route.locale}", so a screen reader pronounces it in the wrong language and a crawler indexes it as the wrong one.`,
      ).toHaveAttribute("lang", route.locale);
    });
  }
});

test.describe("the language switch", () => {
  for (const route of routes) {
    test(`${route.path} offers every locale and marks the active one`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      await expect(
        languageSwitch(page),
        `${route.path} has no language switch — a Reader cannot change language from here.`,
      ).toHaveCount(1);

      await expect(
        languageSwitch(page).locator("a[hreflang]"),
        `${route.path} does not offer all of ${locales.join(", ")}.`,
      ).toHaveCount(locales.length);

      await expect(
        languageSwitch(page).locator("a[aria-current]"),
        `${route.path} marks no single language as the active one, so a screen reader cannot tell which language is being read.`,
      ).toHaveCount(1);

      await expect(
        switchLink(page, route.locale),
        `${route.path} is a ${route.locale} page but does not mark ${route.locale} as active.`,
      ).toHaveAttribute("aria-current", "page");
    });

    test(`${route.path} marks the active language by more than colour`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      // Colour alone does not distinguish anything for a Reader who cannot
      // separate the two hues, so the active language must differ in some
      // other resolved property as well.
      const shape = (locale: Locale): Promise<string[]> =>
        switchLink(page, locale).evaluate((element) => {
          const computed = getComputedStyle(element);
          return [
            computed.textDecorationLine,
            computed.fontWeight,
            computed.fontStyle,
            computed.borderBottomStyle,
            computed.outlineStyle,
          ];
        });

      const active = await shape(route.locale);
      const others = locales.filter((locale) => locale !== route.locale);

      for (const other of others) {
        expect(
          await shape(other),
          `On ${route.path} the active language differs from ${other} only in colour, so which one is active is invisible to some Readers.`,
        ).not.toEqual(active);
      }
    });

    for (const target of locales.filter((locale) => locale !== route.locale)) {
      const equivalent = equivalentOf(route, target);

      test(`${route.path} switches to ${target} without losing the page`, async ({
        page,
      }) => {
        await visitRoute(page, route.path);
        await switchLink(page, target).click();
        await page.waitForURL(`**${equivalent.path}`);

        expect(
          new URL(page.url()).pathname,
          `Switching to ${target} from ${route.path} did not land on the equivalent page — a Reader changing language loses their place.`,
        ).toBe(equivalent.path);

        await expect(
          page.locator("html"),
          `Switching to ${target} from ${route.path} arrived at a page still declaring another language.`,
        ).toHaveAttribute("lang", target);
      });
    }
  }
});

test.describe("the page describes itself", () => {
  for (const route of routes) {
    test(`${route.path} declares a title and a description`, async ({ page }) => {
      await visitRoute(page, route.path);

      expect(
        (await page.title()).trim(),
        `${route.path} has no title, so a tab and a search result say nothing about it.`,
      ).not.toBe("");

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");

      expect(
        description?.trim() ?? "",
        `${route.path} has no description, so a search result shows whatever text the crawler picked.`,
      ).not.toBe("");
    });
  }

  for (const route of routes) {
    test(`${route.path} tells a social client which language it is`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      const contents = (property: string): Promise<(string | null)[]> =>
        page
          .locator(`meta[property="${property}"]`)
          .evaluateAll((tags) => tags.map((tag) => tag.getAttribute("content")));

      // Open Graph wants a language and a territory, so only the language
      // subtag is asserted — the territory is a copy decision, not a routing
      // one, and pinning it here would just restate the site's own constant.
      const [declared] = await contents("og:locale");
      expect(
        declared?.split("_")[0],
        `A link to ${route.path} pasted into a chat client is announced as ${declared ?? "no language at all"}.`,
      ).toBe(route.locale);

      const alternates = await contents("og:locale:alternate");
      expect(
        alternates.map((value) => value?.split("_")[0]).sort(),
        `${route.path} does not name its other language versions to a social client.`,
      ).toEqual(locales.filter((locale) => locale !== route.locale).sort());

      expect(
        withoutTrailingSlash((await contents("og:url"))[0] ?? ""),
        `${route.path} shares itself under a different URL than its canonical one.`,
      ).toBe(expectedUrl(route.path));
    });
  }

  for (const locale of locales.filter((candidate) => candidate !== "en")) {
    for (const route of routes.filter((candidate) => candidate.locale === "en")) {
      const equivalent = equivalentOf(route, locale);

      test(`${equivalent.path} describes itself in ${locale}, not in English`, async ({
        page,
      }) => {
        const describe = async (path: string): Promise<string | null> => {
          await visitRoute(page, path);
          return page.locator('meta[name="description"]').getAttribute("content");
        };

        const english = await describe(route.path);
        const translated = await describe(equivalent.path);

        expect(
          translated,
          `${equivalent.path} carries the same description as ${route.path}, so the metadata was written once rather than per locale.`,
        ).not.toBe(english);
      });
    }
  }
});

test.describe("the two versions cross-declare each other", () => {
  for (const route of routes) {
    test(`${route.path} declares its own canonical URL`, async ({ page }) => {
      await visitRoute(page, route.path);

      const canonical = page.locator('link[rel="canonical"]');

      await expect(
        canonical,
        `${route.path} declares ${await canonical.count()} canonical URLs; it must declare exactly one.`,
      ).toHaveCount(1);

      expect(
        withoutTrailingSlash((await canonical.getAttribute("href")) ?? ""),
        `${route.path} points its canonical URL somewhere other than at itself.`,
      ).toBe(expectedUrl(route.path));
    });

    test(`${route.path} links every alternate language`, async ({ page }) => {
      await visitRoute(page, route.path);

      expect(
        await readAlternates(page),
        `${route.path} does not declare an hreflang for every locale, so the versions are read as duplicates of each other rather than as translations.`,
      ).toEqual(expectedAlternates(route));
    });

    for (const target of locales.filter((locale) => locale !== route.locale)) {
      const equivalent = equivalentOf(route, target);

      test(`${equivalent.path} declares ${route.path} back`, async ({ page }) => {
        await visitRoute(page, equivalent.path);
        const alternates = await readAlternates(page);

        expect(
          alternates[route.locale],
          `${equivalent.path} does not name ${route.path} as its ${route.locale} version, so the declaration is one-way and neither version is credited with the other.`,
        ).toBe(expectedUrl(route.path));
      });
    }
  }
});
