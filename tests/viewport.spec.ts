import { expect, test } from "@playwright/test";
import { routes } from "./routes";
import { visitRoute } from "./visit";

/** The narrowest phone width the site is expected to hold. */
const SMALL_PHONE = { width: 360, height: 740 };

test.use({ viewport: SMALL_PHONE });

for (const route of routes) {
  test(`${route} does not overflow horizontally at ${SMALL_PHONE.width}px`, async ({
    page,
  }) => {
    await visitRoute(page, route);

    const report = await page.evaluate(() => {
      const root = document.documentElement;
      const overflow = root.scrollWidth - root.clientWidth;
      const offenders = Array.from(document.body.querySelectorAll<HTMLElement>("*"))
        .filter((element) => element.getBoundingClientRect().right > root.clientWidth + 1)
        .slice(0, 10)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return `  right edge at ${Math.round(rect.right)}px — ${element.outerHTML.slice(0, 120)}`;
        });
      return { overflow, viewportWidth: root.clientWidth, offenders };
    });

    expect(
      report.overflow,
      `${route} scrolls sideways at ${SMALL_PHONE.width}px: content is ${report.overflow}px wider than the ${report.viewportWidth}px viewport.\n${report.offenders.join("\n")}`,
    ).toBeLessThanOrEqual(0);
  });
}
