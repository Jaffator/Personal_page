import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const UNKNOWN_PATH = "/no-such-page";
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * The not-found page is deliberately outside `routes` — it answers with 404,
 * so it cannot go through `visitRoute` and it would fail the SEO audit's
 * status-code check. It still has to be the site's own page rather than the
 * framework's, and it still has to be accessible in both themes: it is built
 * from the same tokens as every other page, so it fails contrast the same way.
 */
test("an unknown path serves the site's own not-found page", async ({ page }) => {
  const response = await page.goto(UNKNOWN_PATH);

  expect(response, "No response for an unknown path").not.toBeNull();
  expect(
    response!.status(),
    "An unknown path must answer 404, not 200 — otherwise a broken link looks like a real page.",
  ).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");

  // This page sits above both locale trees and so inherits neither document.
  // `app/layout.tsx` is what keeps it inside one — remove it and the framework
  // supplies a bare shell with no language at all. See docs/locale.md.
  await expect(
    page.locator("html"),
    "The not-found page declares no language, so it is not being rendered inside the site's own document.",
  ).toHaveAttribute("lang", "en");
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the not-found page is accessible (${colorScheme})`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme });
    try {
      const page = await context.newPage();
      await page.goto(UNKNOWN_PATH);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");

      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      expect(
        violations.map((violation) => violation.id),
        `The not-found page has accessibility violations (${colorScheme})`,
      ).toEqual([]);
    } finally {
      await context.close();
    }
  });
}
