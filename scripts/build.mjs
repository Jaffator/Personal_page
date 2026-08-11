#!/usr/bin/env node
/**
 * Production build that treats a warning as a failure.
 *
 * `next build` exits zero on warnings, which would let a deprecation or a
 * misconfigured export slide into the deployed site unnoticed. This wrapper
 * streams the build output through unchanged and then fails if any line looked
 * like a warning. It also clears ./out first, so a stale build can never be
 * what the verification suite ends up checking.
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
