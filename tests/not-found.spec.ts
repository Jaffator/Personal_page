import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * The not-found page is deliberately outside `routes` — it answers with 404,
 * so it cannot go through `visitRoute` and it would fail the SEO audit's
 * status-code check. It still has to be the site's own page rather than the
 * framework's, and it still has to be accessible.
 */
test("an unknown path serves the site's own not-found page", async ({ page }) => {
  const response = await page.goto("/no-such-page");

  expect(response, "No response for an unknown path").not.toBeNull();
  expect(
    response!.status(),
    "An unknown path must answer 404, not 200 — otherwise a broken link looks like a real page.",
  ).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(
    violations.map((violation) => violation.id),
    "The not-found page has accessibility violations",
  ).toEqual([]);
});
