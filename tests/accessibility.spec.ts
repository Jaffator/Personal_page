import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Result } from "axe-core";
import { routes } from "./routes";
import { visitRoute } from "./visit";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function describeViolations(violations: Result[]): string {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => `      ${node.target.join(" ")}`)
        .join("\n");
      return `  [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}\n    ${violation.helpUrl}\n${targets}`;
    })
    .join("\n");
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`accessibility (${colorScheme})`, () => {
    test.use({ colorScheme });

    for (const { path } of routes) {
      test(`${path} has no accessibility violations`, async ({ page }) => {
        await visitRoute(page, path);

        const { violations } = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .analyze();

        expect(
          violations,
          violations.length
            ? `axe reported ${violations.length} violation(s) on ${path} (${colorScheme}):\n${describeViolations(violations)}`
            : undefined,
        ).toEqual([]);
      });
    }
  });
}
