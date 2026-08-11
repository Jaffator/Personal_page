import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";
import { routes } from "./routes";

const execFileAsync = promisify(execFile);

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"] as const;
const THRESHOLD = 95;
const RUNNER = path.join(__dirname, "..", "scripts", "lighthouse-run.mjs");

function parseScores(stdout: string): Record<string, number> {
  const match = /^LIGHTHOUSE_SCORES=(.*)$/m.exec(stdout);
  if (!match) {
    throw new Error(`Lighthouse runner produced no scores.\n${stdout}`);
  }
  return JSON.parse(match[1]) as Record<string, number>;
}

/**
 * Lighthouse drives its own Chrome rather than a Playwright browser, because
 * its throttling model needs an instance it controls end to end. Runs are slow
 * and load-sensitive, so this file is a project of its own (see
 * playwright.config.ts) and never runs alongside the browser tests.
 */
for (const { path } of routes) {
  test(`${path} meets the ${THRESHOLD} audit threshold`, async ({ baseURL }) => {
    test.setTimeout(180_000);

    const url = new URL(path, baseURL).toString();
    const { stdout } = await execFileAsync(
      process.execPath,
      [RUNNER, url, CATEGORIES.join(",")],
      { maxBuffer: 32 * 1024 * 1024 },
    );

    const scores = parseScores(stdout);
    const summary = CATEGORIES.map((id) => `  ${id}: ${scores[id]}`).join("\n");
    const failed = CATEGORIES.filter((id) => scores[id] < THRESHOLD);

    expect(failed, `${path} fell below ${THRESHOLD}:\n${summary}`).toEqual([]);
  });
}
