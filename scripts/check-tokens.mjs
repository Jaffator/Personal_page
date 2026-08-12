#!/usr/bin/env node
/**
 * Fails when component code writes a raw value instead of naming a token.
 *
 * The dark theme costs nothing only because every component asks for
 * `--color-ink` rather than for a particular grey. One `text-gray-500` is
 * enough to make dark mode a rewrite, and it is invisible in review until the
 * theme is switched — so it is caught here instead.
 *
 * It scans the component code under app/, plus mdx-components.tsx at the root —
 * which Next.js requires by that name and path, and which carries the classes
 * every piece of Case Study prose is rendered with, so leaving it out would
 * exempt the site's most important page. `.mdx` is scanned too: a prose
 * document can write raw JSX, and a `className` typed into one would otherwise
 * reach the built page unchecked.
 *
 * CSS is not scanned at all, because app/globals.css is the one place values
 * are allowed to exist; if a second stylesheet ever appears, it belongs here.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE_DIR = path.join(projectRoot, "app");
const ROOT_SOURCES = [path.join(projectRoot, "mdx-components.tsx")];
const SOURCE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js", ".mdx"]);

const TAILWIND_PALETTE = [
  "black",
  "white",
  "slate",
  "gray",
  "grey",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
].join("|");

const COLOUR_UTILITIES =
  "bg|text|border|ring|outline|decoration|divide|fill|stroke|from|via|to|shadow|accent|caret|placeholder";

/**
 * Tailwind variants that legitimately carry brackets — they select, they do
 * not size. `data-[state=open]:` is a condition, not a value.
 */
const BRACKET_VARIANTS = "data|aria|has|not|in|group|peer|supports|nth|nth-last";

/**
 * Values that would otherwise be read as code rather than as content: an
 * anchor's `#deed` is not a colour, and an id is nobody's design decision.
 */
const NON_STYLE_ATTRIBUTES = /\b(?:href|id|aria-controls|aria-labelledby)=(?:"[^"]*"|\{[^}]*\})/g;

const RULES = [
  {
    pattern: /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b/g,
    reason: "a literal colour. Name a token from app/globals.css instead.",
  },
  {
    pattern: /\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(/g,
    reason: "a computed colour. Name a token from app/globals.css instead.",
  },
  {
    pattern: new RegExp(`\\b(?:${COLOUR_UTILITIES})-(?:${TAILWIND_PALETTE})(?:-\\d{1,3})?\\b`, "g"),
    reason:
      "a colour from Tailwind's default palette, which has no dark counterpart. Use a token utility such as text-ink, text-muted or text-accent.",
  },
  {
    pattern: new RegExp(`\\b(?!(?:${BRACKET_VARIANTS})-\\[)[a-z][a-z-]*-\\[[^\\]\\n]*\\]`, "g"),
    reason:
      "an arbitrary value. Add it to the token layer in app/globals.css and reference it by name.",
  },
  {
    // globals.css clears these namespaces, so the class silently does nothing
    // rather than failing the build. Saying so out loud is the point.
    pattern:
      /\b(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)|max-w-(?:3xs|2xs|xs|sm|md|lg|xl|[2-7]xl|prose|screen-[a-z]+)|font-serif)\b/g,
    reason:
      "a name from Tailwind's default scales, which this project clears — the class resolves to nothing at all. Use a token: text-meta, text-body, text-lede, text-display, max-w-measure, max-w-page, font-sans, font-mono.",
  },
  {
    pattern: /\bstyle=\{\{/g,
    reason:
      "an inline style, which puts values back in component code. Express it with a token utility.",
  },
];

async function collectSources(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSources(full);
      return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
    }),
  );
  return files.flat();
}

const violations = [];

for (const file of [...(await collectSources(SOURCE_DIR)), ...ROOT_SOURCES]) {
  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  lines.forEach((rawLine, index) => {
    const line = rawLine.replace(NON_STYLE_ATTRIBUTES, "");
    for (const rule of RULES) {
      for (const match of line.matchAll(rule.pattern)) {
        violations.push({
          location: `${path.relative(projectRoot, file)}:${index + 1}`,
          found: match[0],
          reason: rule.reason,
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error(
    `Component code must reference tokens, not values. ${violations.length} raw value(s) found:\n` +
      violations
        .map(({ location, found, reason }) => `  ${location}  ${found}\n    ${reason}`)
        .join("\n") +
      "\n",
  );
  process.exit(1);
}

console.log(
  `check:tokens — no raw values in ${path.relative(projectRoot, SOURCE_DIR)} or ` +
    ROOT_SOURCES.map((file) => path.relative(projectRoot, file)).join(", "),
);
