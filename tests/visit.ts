import { expect, type Page } from "@playwright/test";

/**
 * Navigates to a route and asserts the built site actually served it.
 *
 * Without the status check the other checks are worthless on a route that does
 * not exist: the static server answers an unknown path with a well-formed
 * error page that has a heading, no accessibility violations and no overflow,
 * so a missing page would pass every scan. The heading assertion is the same
 * guard from the other side — a 200 that rendered nothing is not a route.
 */
export async function visitRoute(page: Page, route: string): Promise<void> {
  const response = await page.goto(route);

  expect(response, `No response at all for ${route}`).not.toBeNull();
  expect(
    response!.status(),
    `${route} was not served from the build output — the build is missing this page.`,
  ).toBe(200);

  await expect(
    page.getByRole("heading", { level: 1 }),
    `${route} was served but rendered no level-1 heading.`,
  ).toHaveCount(1);
}
