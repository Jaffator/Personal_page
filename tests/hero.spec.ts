import { expect, test, type Locator, type Page } from "@playwright/test";
import { DEAD_LINK_SELECTOR, GOOGLE_PLAY_HOST, SOURCE_URL } from "./proof";
import { equivalentOf, routes, type Route } from "./routes";
import { visitRoute } from "./visit";

/**
 * The hero, asserted through the built site: the first thing a Reader sees, and
 * the statement everything below it is graded against.
 *
 * Two of these checks are accuracy checks rather than structural ones, and they
 * are the reason this file exists separately from the design-system and
 * accessibility scans. A Google Play claim with no listing behind it, or a
 * React Native claim over a Capacitor application, would both be caught by the
 * Reader this site is written for — so they are caught here first. They are
 * asserted against the rendered text of the whole page, because it does not
 * matter which component would have introduced them.
 *
 * Everything else is asserted by structure and by role rather than by wording,
 * so ticket 14 can rewrite every sentence without touching this file.
 */

const HOME = routes.filter((route) => route.key === "home");

/**
 * Words that would put a level on the author that the work is meant to set.
 * Czech included, because the Czech page is not a translation check away from
 * the English one — it is written separately and can drift on its own.
 */
const LEVEL_LABELS =
  /\b(junior|jr\.?|entry[- ]level|first role|first job|aspiring|seeking my first|začínající|junior[íý]|hled[áa]m\s+(?:svou\s+)?prvn[íi])\b/i;

/** A claim of React Native, which BikeCheck is not built in. */
const REACT_NATIVE = /react[\s-]*native/i;

/**
 * The hero, found by the heading that names it: the one region of `main`
 * labelled by the page's level-1 heading.
 *
 * Deliberately not "the first region in `main`" — that matches Selected Work
 * on a page with no hero at all, and every check below would then pass against
 * the section underneath. Being labelled by the `h1` is what makes this the
 * hero and not some other section, and it is also the thing that makes the
 * hero a landmark a screen-reader Reader can return to.
 */
function hero(page: Page): Locator {
  return page.getByRole("main").getByRole("region", { name: HERO_LABEL });
}

/**
 * What the hero's region is named by. It is the author's name, which is also
 * the `h1` — checked here rather than assumed, so a hero that lost its label
 * fails rather than silently matching the section below it.
 */
const HERO_LABEL = /jaroslav lufinka/i;

/** The page's own text, as a Reader reads it — no markup, no attributes. */
async function visibleText(page: Page, path: string): Promise<string> {
  await visitRoute(page, path);
  return (await page.getByRole("main").innerText()).trim();
}

test.describe("what the hero states", () => {
  for (const route of HOME) {
    test(`${route.path} opens with the hero as a named landmark`, async ({ page }) => {
      await visitRoute(page, route.path);

      await expect(
        hero(page),
        `${route.path} has no hero — the opening statement a Reader grades everything below against is missing.`,
      ).toHaveCount(1);
    });

    test(`${route.path} opens with a single level-1 heading`, async ({ page }) => {
      await visitRoute(page, route.path);

      // `visitRoute` already asserts exactly one `h1` on the page. What matters
      // here is that it belongs to the hero and says something: an empty
      // display heading is a layout that renders and a page that states nothing.
      const heading = hero(page).getByRole("heading", { level: 1 });

      await expect(
        heading,
        `The level-1 heading on ${route.path} does not sit in the hero.`,
      ).toHaveCount(1);

      expect(
        (await heading.textContent())?.trim() ?? "",
        `The hero on ${route.path} has no heading text, so the page opens saying nothing.`,
      ).not.toBe("");
    });

    test(`${route.path} follows the heading with a positioning statement`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      const heading = (
        (await hero(page).getByRole("heading", { level: 1 }).textContent()) ?? ""
      ).trim();
      const text = (await hero(page).innerText()).trim();

      // A name and nothing else is a business card. The hero has to carry the
      // positioning as well, so there is more here than the heading.
      expect(
        text.length,
        `The hero on ${route.path} carries nothing but its heading, so a Reader learns nothing about what its author does.`,
      ).toBeGreaterThan(heading.length * 2);
    });

    test(`${route.path} names the stack in the hero`, async ({ page }) => {
      await visitRoute(page, route.path);

      const tags = hero(page).getByRole("listitem");

      expect(
        await tags.count(),
        `The hero on ${route.path} names no technologies, so a Reader matching it against an open role has nothing to match.`,
      ).toBeGreaterThan(0);

      for (const tag of await tags.all()) {
        expect(
          (await tag.textContent())?.trim() ?? "",
          `A stack tag in the hero on ${route.path} is empty.`,
        ).not.toBe("");
      }
    });
  }
});

test.describe("what the hero must not claim", () => {
  for (const route of HOME) {
    test(`${route.path} claims no Google Play listing`, async ({ page }) => {
      await visitRoute(page, route.path);

      // The Proof Link is modelled and has no value. An absent one renders
      // nothing at all — a dead link, an empty slot or a "coming soon" would
      // each be a claim the site cannot support.
      await expect(
        page.locator(`a[href*="${GOOGLE_PLAY_HOST}"]`),
        `${route.path} links to Google Play, but BikeCheck is not published there — a Reader following it finds nothing.`,
      ).toHaveCount(0);

      await expect(
        page.getByRole("main").locator(DEAD_LINK_SELECTOR),
        `${route.path} renders a link with nowhere to go, so a Proof Link with no value left an empty slot behind.`,
      ).toHaveCount(0);
    });

    test(`${route.path} describes the technology as Capacitor, not React Native`, async ({
      page,
    }) => {
      const text = await visibleText(page, route.path);

      expect(
        REACT_NATIVE.test(text),
        `${route.path} claims React Native. BikeCheck is built with Capacitor — a different technology, and a claim a Reader would check.`,
      ).toBe(false);

      expect(
        /capacitor/i.test(text),
        `${route.path} never names Capacitor, so the one technology claim the hero has to get right is missing.`,
      ).toBe(true);
    });

    test(`${route.path} puts no junior or first-role label on its author`, async ({
      page,
    }) => {
      const text = await visibleText(page, route.path);
      const found = text.match(LEVEL_LABELS);

      expect(
        found?.[0] ?? null,
        `${route.path} labels its author's level. The work is meant to set that, not the copy.`,
      ).toBeNull();
    });
  }
});

test.describe("the hero's Proof Links", () => {
  for (const route of HOME) {
    test(`${route.path} offers the source repository from the hero`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      await expect(
        hero(page).locator(`a[href^="${SOURCE_URL}"]`),
        `The hero on ${route.path} does not link out to the source repository, so a Reader cannot verify the Project independently of this site's own claims.`,
      ).not.toHaveCount(0);
    });

    test(`${route.path} qualifies the hero's source link with its note`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      const source = hero(page).locator(`a[href^="${SOURCE_URL}"]`).first();

      // The repository is actively in development, and a Reader must meet it
      // as that rather than as a finished release. The note has to reach a
      // screen-reader Reader too, so what is checked is what is announced.
      const announced = [
        (await source.textContent()) ?? "",
        (await source.getAttribute("aria-label")) ?? "",
        await source
          .locator("xpath=ancestor::*[self::li or self::p or self::div][1]")
          .innerText()
          .catch(() => ""),
      ]
        .join(" ")
        .trim();

      expect(
        announced.replace(/\s+/g, " ").length,
        `The source Proof Link in the hero on ${route.path} carries no qualifying note, so the repository is presented as more finished than it is.`,
      ).toBeGreaterThan(SOURCE_URL.length);
    });

    test(`${route.path} names each Proof Link's purpose in its own text`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      for (const link of await hero(page).getByRole("link").all()) {
        const name = ((await link.textContent()) ?? "").trim();

        // "Here", "this" and a bare URL each tell a Reader listing the page's
        // links nothing about where they lead.
        expect(
          name.length,
          `A link in the hero on ${route.path} has no text of its own, so its purpose is not clear from the link alone.`,
        ).toBeGreaterThan(3);

        expect(
          /^(here|this|link|více|zde|odkaz|https?:)/i.test(name),
          `A link in the hero on ${route.path} is named "${name}", which tells a Reader nothing about where it goes.`,
        ).toBe(false);
      }
    });

    test(`${route.path} groups its Proof Links as a list`, async ({ page }) => {
      await visitRoute(page, route.path);

      // A list, so a screen-reader Reader is told how many ways there are to
      // check the claim before hearing them. The floor is one, never an exact
      // count: publishing the Play listing is a content change, and a check
      // that pinned today's number would fail on the day the thing it exists
      // to allow finally happens.
      const list = hero(page)
        .getByRole("list")
        .filter({ has: page.locator(`a[href^="${SOURCE_URL}"]`) });

      await expect(
        list,
        `The source Proof Link in the hero on ${route.path} does not sit in a list, so the ways of checking the claim are not grouped as one.`,
      ).toHaveCount(1);

      expect(
        await list.getByRole("listitem").count(),
        `The hero's Proof Link list on ${route.path} is empty.`,
      ).toBeGreaterThan(0);
    });

    test(`${route.path} keeps the source Proof Link secondary to the heading`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      const heading = hero(page).getByRole("heading", { level: 1 });
      const source = hero(page).locator(`a[href^="${SOURCE_URL}"]`).first();

      // "Visually secondary" is a requirement a Reader would judge by eye, and
      // the nearest observable stand-in is relative size: the Proof Link must
      // not compete with the statement it exists to support. Read from what
      // the browser resolved rather than from the class names, so it holds
      // whatever the type scale is retuned to.
      const sizeOf = (locator: Locator): Promise<number> =>
        locator.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));

      const headingSize = await sizeOf(heading);
      const linkSize = await sizeOf(source);

      expect(
        linkSize,
        `The source Proof Link on ${route.path} is set at ${linkSize}px against a ${headingSize}px heading, so it competes with the statement it is meant to support.`,
      ).toBeLessThan(headingSize);
    });
  }
});

test.describe("the hero resolves per locale", () => {
  for (const route of HOME.filter((candidate) => candidate.locale === "en")) {
    const equivalent: Route = equivalentOf(route, "cs");

    test(`${equivalent.path} states the hero in Czech`, async ({ page }) => {
      const heroText = async (path: string): Promise<string> => {
        await visitRoute(page, path);
        return (await hero(page).innerText()).trim();
      };

      // Scoped to the hero, not to `main`: a Czech page whose hero fell back to
      // English would still differ overall, because Selected Work below it is
      // translated, and the comparison would pass while the hero was wrong.
      const english = await heroText(route.path);
      const czech = await heroText(equivalent.path);

      expect(
        czech,
        `The hero on ${equivalent.path} is identical to ${route.path}, so its text was written once rather than per locale.`,
      ).not.toBe(english);

      // Diacritics are what distinguish written Czech from an English string
      // left in place. The stack line is exempt by design — a technology's name
      // is the same in both languages — so this reads the prose above it.
      expect(
        /[áčďéěíňóřšťúůýž]/i.test(czech),
        `The hero on ${equivalent.path} carries no Czech diacritics, so it is very likely still showing English text.`,
      ).toBe(true);
    });
  }
});
