import { expect, test, type Locator, type Page } from "@playwright/test";
import { routes } from "./routes";
import { visitRoute } from "./visit";

/**
 * The Case Study, asserted through the built site: the structure a Reader
 * navigates and a screen reader announces.
 *
 * These checks are about shape rather than wording, because the prose is
 * placeholder until ticket 14 and the page has to hold its structure whatever
 * the copy says. What matters here is that the parts appear in order, that a
 * Deep Dive repeats as the same unit rather than as three hand-written
 * sections, that a figure's caption is attached to its figure, and that the
 * heading outline has no holes in it.
 */

const CASE_STUDIES = routes.filter((route) => route.key === "caseStudy");

/** The four moves every Deep Dive makes, in the order it makes them. */
const MOVES_PER_DEEP_DIVE = 4;

/** The Deep Dives, found by the section that titles them. */
function deepDives(page: Page): Locator {
  return page.locator("section[id^='deep-dive-']");
}

/** The document outline, as a screen reader would walk it. */
async function headingLevels(page: Page): Promise<number[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((heading) =>
      Number(heading.tagName.slice(1)),
    ),
  );
}

test.describe("the page", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} presents the Case Study at its own URL`, async ({ page }) => {
      // `visitRoute` already asserts a 200 and exactly one h1 — which together
      // are the claim this ticket makes about the URL being pasteable into a
      // job application and landing on a real page.
      await visitRoute(page, route.path);
    });

    test(`${route.path} composes the parts of a Case Study in order`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      // Found by id rather than by heading text, so the check survives ticket
      // 14 rewriting every word on the page.
      const parts = ["architecture", "feature-tour", "deep-dives", "retrospective"];

      for (const part of parts) {
        await expect(
          page.locator(`section[aria-labelledby="${part}"]`),
          `${route.path} is missing the "${part}" part, so the Case Study does not make its full argument.`,
        ).toHaveCount(1);
      }

      const positions = await page.evaluate(
        (ids) =>
          ids.map((id) => {
            const section = document.querySelector(`section[aria-labelledby="${id}"]`);
            return section ? section.getBoundingClientRect().top : Number.NaN;
          }),
        parts,
      );

      const ordered = [...positions].sort((a, b) => a - b);
      expect(
        positions,
        `${route.path} renders the parts of the Case Study out of order, so the argument arrives in the wrong sequence.`,
      ).toEqual(ordered);
    });
  }
});

test.describe("Deep Dives", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} repeats the Deep Dive as one unit`, async ({ page }) => {
      await visitRoute(page, route.path);

      const dives = deepDives(page);

      // Three, because the ticket asks that the unit be usable three times
      // without duplication and BikeCheck's Case Study exercises exactly that.
      expect(
        await dives.count(),
        `${route.path} renders a different number of Deep Dives than the content declares.`,
      ).toBe(3);

      for (const dive of await dives.all()) {
        await expect(
          dive.getByRole("heading", { level: 3 }),
          `A Deep Dive on ${route.path} has no title of its own.`,
        ).toHaveCount(1);

        // The four moves are what makes it the same unit each time. A Deep
        // Dive missing one — in practice, the cost — is the failure this
        // asserts against.
        await expect(
          dive.getByRole("heading", { level: 4 }),
          `A Deep Dive on ${route.path} does not make all four moves, so it is not the repeatable unit the Case Study is built from.`,
        ).toHaveCount(MOVES_PER_DEEP_DIVE);
      }
    });

    test(`${route.path} labels every Deep Dive the same way`, async ({ page }) => {
      await visitRoute(page, route.path);

      // The labels repeating verbatim is the evidence that one component
      // rendered all three, rather than three sections being written by hand
      // and drifting apart.
      const labelSets = await Promise.all(
        (await deepDives(page).all()).map(async (dive) =>
          (await dive.getByRole("heading", { level: 4 }).allInnerTexts()).map((text) =>
            text.trim(),
          ),
        ),
      );

      for (const labels of labelSets) {
        expect(
          labels,
          `The Deep Dives on ${route.path} do not carry the same four labels, so they read as three different kinds of thing.`,
        ).toEqual(labelSets[0]);
      }
    });
  }
});

test.describe("the Walkthrough slot", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} promises no Walkthrough it cannot show`, async ({ page }) => {
      await visitRoute(page, route.path);

      // The player is ticket 08. Until it exists the slot must render nothing
      // at all — an empty frame or a "coming soon" would be a promise the site
      // cannot keep, and an empty landmark would leave a hole in the outline.
      await expect(
        page.locator("#walkthrough"),
        `${route.path} renders a Walkthrough section with no Walkthrough in it.`,
      ).toHaveCount(0);

      await expect(
        page.locator("video, iframe"),
        `${route.path} embeds a player, but the Walkthrough has not been recorded yet.`,
      ).toHaveCount(0);
    });
  }
});

test.describe("figures", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} attaches every caption to its figure`, async ({ page }) => {
      await visitRoute(page, route.path);

      // A Deep Dive carries a figure in the placeholder prose precisely so
      // this is not a vacuous check: the ticket asks that a captioned figure
      // can be placed inside a Deep Dive, and an assertion that passed because
      // the page had no figures at all would not have shown that.
      const inDeepDive = deepDives(page).locator("figure");

      expect(
        await inDeepDive.count(),
        `${route.path} has no figure inside a Deep Dive, so the placement the Case Study needs is untested.`,
      ).toBeGreaterThan(0);

      // A caption has to be a `figcaption` inside its `figure`, because that
      // element pair is what associates the two for a screen reader.
      // Positioning alone does not.
      for (const figure of await page.locator("figure").all()) {
        await expect(
          figure.locator("figcaption"),
          `A figure on ${route.path} has no caption attached to it, so a screen-reader Reader meets an image with nothing explaining it.`,
        ).toHaveCount(1);

        expect(
          (await figure.locator("figcaption").innerText()).trim(),
          `A figure on ${route.path} has an empty caption.`,
        ).not.toBe("");
      }

      await expect(
        page.locator("figcaption:not(figure > figcaption)"),
        `${route.path} has a caption that sits outside a figure, so it is unattached small text rather than a caption.`,
      ).toHaveCount(0);
    });
  }
});

test.describe("the document outline", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} has an unbroken heading order`, async ({ page }) => {
      await visitRoute(page, route.path);

      const levels = await headingLevels(page);

      expect(
        levels[0],
        `${route.path} does not open with its level-1 heading.`,
      ).toBe(1);

      expect(
        levels.filter((level) => level === 1).length,
        `${route.path} has more than one level-1 heading, so a screen-reader Reader cannot tell what the page is about.`,
      ).toBe(1);

      // A jump — h2 straight to h4 — reads to a screen-reader Reader as a
      // missing section. This is the check that stops an MDX document being
      // allowed to write its own headings.
      levels.forEach((level, index) => {
        if (index === 0) return;
        expect(
          level - levels[index - 1],
          `${route.path} jumps from h${levels[index - 1]} to h${level}, skipping a level and leaving a hole in the outline a screen-reader Reader navigates by.`,
        ).toBeLessThanOrEqual(1);
      });
    });
  }
});

test.describe("prose resolves per locale", () => {
  test("the Case Study is written in each language, not once", async ({ page }) => {
    const read = async (path: string): Promise<string> => {
      await visitRoute(page, path);
      return (await page.locator("main").innerText()).trim();
    };

    const english = await read("/bikecheck");
    const czech = await read("/cs/bikecheck");

    expect(
      czech,
      "The Czech Case Study is identical to the English one, so its prose was written once rather than per locale.",
    ).not.toBe(english);

    // Both are substantial: a locale that resolved to an empty document would
    // otherwise pass the check above simply by differing.
    for (const [path, text] of [
      ["/bikecheck", english],
      ["/cs/bikecheck", czech],
    ] as const) {
      expect(
        text.length,
        `The Case Study at ${path} is too short to be the most important writing on the site — a prose document probably failed to render.`,
      ).toBeGreaterThan(1000);
    }
  });
});
