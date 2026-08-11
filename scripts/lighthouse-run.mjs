#!/usr/bin/env node
/**
 * Runs Lighthouse against one URL and prints its category scores.
 *
 * This is a standalone script rather than inline test code because Lighthouse
 * pulls in dependencies that ship TypeScript sources, which Playwright's own
 * transform picks up and mis-compiles. Running it in a plain Node process
 * keeps that transform out of the way.
 *
 * Usage: node scripts/lighthouse-run.mjs <url> <category,category,...>
 * Output: a single line, `LIGHTHOUSE_SCORES=<json>`, mapping category to 0-100.
 */
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const [url, categoryList] = process.argv.slice(2);

if (!url || !categoryList) {
  console.error("Usage: node scripts/lighthouse-run.mjs <url> <categories>");
  process.exit(2);
}

const categories = categoryList.split(",");

const chrome = await launch({
  chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
});

try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: categories,
  });

  if (!result) {
    throw new Error(`Lighthouse produced no result for ${url}`);
  }

  const scores = Object.fromEntries(
    categories.map((id) => [id, Math.round((result.lhr.categories[id].score ?? 0) * 100)]),
  );

  process.stdout.write(`\nLIGHTHOUSE_SCORES=${JSON.stringify(scores)}\n`);
} finally {
  await chrome.kill();
}
