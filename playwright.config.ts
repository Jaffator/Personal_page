import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(__dirname, "out");

if (!existsSync(path.join(OUT_DIR, "index.html"))) {
  throw new Error(
    "No production build found in ./out — the suite verifies built output only. Run `npm run build` first, or `npm run verify` to do both.",
  );
}

/**
 * The suite drives a real browser against the production build. It runs
 * single-worker and without retries on purpose: the audit thresholds are
 * sensitive to machine load, and a retry would hide a real regression.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "browser",
      testIgnore: /lighthouse\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Drives its own Chrome instance through Lighthouse, so it takes no
      // Playwright browser and must not compete with the browser project.
      name: "lighthouse",
      testMatch: /lighthouse\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run serve:built",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
