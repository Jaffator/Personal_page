#!/usr/bin/env node
/**
 * Production build that treats a warning as a failure.
 *
 * `next build` exits zero on warnings, which would let a deprecation or a
 * misconfigured export slide into the deployed site unnoticed. This wrapper
 * streams the build output through unchanged and then fails if any line looked
 * like a warning. It also clears ./out first, so a stale build can never be
 * what the verification suite ends up checking.
 *
 * It draws the social preview cards first. They are generated rather than
 * committed artwork, so running them on every build is what keeps a card from
 * drifting out of step with the title or the tokens it was drawn from — and it
 * is why adding a route or a Project needs no separate step to get its card.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");

const ANSI = /\[[0-9;]*m/g;
const WARNING_PATTERNS = [/⚠/, /^\s*warn\b/i, /\bwarning:/i];

await rm(path.join(projectRoot, "out"), { recursive: true, force: true });

/**
 * Draws the social preview cards into the `opengraph-image.png` files Next.js
 * picks up, and fails the build if any route has not got one.
 *
 * `--experimental-strip-types` is what lets that script import the site's own
 * locale model and dictionaries rather than restating them; `--no-warnings`
 * silences the notice about the flag, which would otherwise be caught by this
 * very file's warning check and fail the build it is part of.
 */
const cards = spawn(
  process.execPath,
  [
    "--experimental-strip-types",
    "--no-warnings",
    path.join(projectRoot, "scripts", "build-og-images.mjs"),
  ],
  { cwd: projectRoot, stdio: "inherit" },
);

const cardsExitCode = await new Promise((resolve) => cards.on("close", resolve));

if (cardsExitCode !== 0) {
  console.error("\nThe social preview images could not be drawn, so the build stops here.\n");
  process.exit(cardsExitCode);
}

const suspectLines = [];

function teeAndCollectWarnings(stream, sink) {
  let carry = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    sink.write(chunk);
    const lines = (carry + chunk).split(/\r?\n/);
    carry = lines.pop() ?? "";
    for (const line of lines) {
      const plain = line.replace(ANSI, "");
      if (WARNING_PATTERNS.some((pattern) => pattern.test(plain))) {
        suspectLines.push(plain.trim());
      }
    }
  });
}

const build = spawn(process.execPath, [nextBin, "build"], {
  cwd: projectRoot,
  stdio: ["inherit", "pipe", "pipe"],
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
});

teeAndCollectWarnings(build.stdout, process.stdout);
teeAndCollectWarnings(build.stderr, process.stderr);

const exitCode = await new Promise((resolve) => build.on("close", resolve));

if (exitCode !== 0) {
  process.exit(exitCode);
}

if (suspectLines.length > 0) {
  console.error(
    `\nBuild succeeded but emitted ${suspectLines.length} warning(s), which the craft bar treats as a failure:\n` +
      suspectLines.map((line) => `  ${line}`).join("\n") +
      "\n",
  );
  process.exit(1);
}
