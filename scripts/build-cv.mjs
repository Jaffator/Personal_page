#!/usr/bin/env node
/**
 * Writes public/jaroslav-lufinka-cv.pdf: a single-page, valid PDF built from
 * the same facts the site states, using only the PDF base-14 fonts so the file
 * needs no embedded font and stays small.
 *
 * ---------------------------------------------------------------------------
 * PLACEHOLDER CONTENT — Jaroslav must replace this before the site is deployed.
 *
 * What is written below is assembled from what the repository already states:
 * the positioning, BikeCheck, the Stack and the contact facts. That makes it a
 * true document, but not a complete CV — it carries no employment history, no
 * education and no dates, because this repository does not know them and
 * inventing them on a job-seeking document is the one failure mode worse than
 * shipping nothing.
 *
 * The file exists so the download link, its filename and its content type are
 * real and under test from the day the section ships. Replace it with the
 * genuine CV — either by filling in the sections below and re-running this
 * script, or by dropping a PDF exported from elsewhere at the same path.
 * `tests/home-sections.spec.ts` asserts the path, the `%PDF-` header and a
 * non-trivial size, so a replacement is checked the same way this is.
 * ---------------------------------------------------------------------------
 *
 * Text is WinAnsi-encoded, which covers the Czech diacritics used here.
 *
 * Usage: node scripts/build-cv.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(projectRoot, "public", "jaroslav-lufinka-cv.pdf");

// WinAnsiEncoding byte values for the non-ASCII characters this document uses.
const WINANSI = { "č": 0xe8, "ř": 0xf8, "š": 0xb9, "ž": 0xbe, "ě": 0xec, "ů": 0xf9, "á": 0xe1, "é": 0xe9, "í": 0xed, "ý": 0xfd, "ú": 0xfa, "ó": 0xf3, "ď": 0xef, "ť": 0xbb, "ň": 0xf2, "Č": 0xc8, "Ř": 0xd8, "Š": 0xa9, "Ž": 0xae, "—": 0x97, "–": 0x96 };

function pdfString(text) {
  let out = "";
  for (const ch of text) {
    const code = WINANSI[ch] ?? ch.codePointAt(0);
    if (ch === "(" || ch === ")" || ch === "\\") out += "\\" + ch;
    else if (code < 128) out += ch;
    else out += "\\" + code.toString(8).padStart(3, "0");
  }
  return out;
}

const LEFT = 64;
const TOP = 780;
const WIDTH = 468;

/** The document, as a list of typeset lines. */
const lines = [];
let y = TOP;

function write(text, { font = "F1", size = 10, gap = 14, indent = 0, colour = "0 0 0" } = {}) {
  if (text !== "") {
    lines.push(
      `BT /${font} ${size} Tf ${colour} rg 1 0 0 1 ${LEFT + indent} ${y} Tm (${pdfString(text)}) Tj ET`,
    );
  }
  y -= gap;
}

function rule() {
  lines.push(`0.85 0.85 0.85 rg ${LEFT} ${y + 6} ${WIDTH} 0.6 re f`);
  y -= 12;
}

function heading(text) {
  y -= 8;
  write(text, { font: "F2", size: 8, gap: 10, colour: "0.35 0.35 0.35" });
  rule();
}

// --- Header -----------------------------------------------------------------
write("Jaroslav Lufinka", { font: "F2", size: 22, gap: 20 });
write("Full-stack developer — Jablonec nad Nisou, Czech Republic", { size: 10, gap: 14, colour: "0.35 0.35 0.35" });
write("jardalufi@gmail.com   |   github.com/Jaffator   |   linkedin.com/in/jaroslav-lufinka", { size: 9, gap: 12, colour: "0.35 0.35 0.35" });
write("Open to remote or hybrid work", { size: 9, gap: 16, colour: "0.35 0.35 0.35" });

// --- Profile ----------------------------------------------------------------
heading("PROFILE");
write("Self-taught developer who builds products end to end, from the job queue to the screen.", { gap: 13 });
write("Learned by shipping a complete application rather than by following tutorials: BikeCheck", { gap: 13 });
write("has a domain model, a REST API, a PostgreSQL database and an Android build.", { gap: 13 });

// --- Selected work ----------------------------------------------------------
heading("SELECTED WORK");
write("BikeCheck — Android application for bicycle service history", { font: "F2", size: 11, gap: 13 });
write("TypeScript, React, Capacitor, NestJS, PostgreSQL, Prisma", { size: 9, gap: 13, colour: "0.35 0.35 0.35" });
write("Designed and built end to end: domain model, database schema, REST API and mobile client.", { gap: 12, indent: 10 });
write("Tracks service history and component wear across multiple bicycles.", { gap: 12, indent: 10 });
write("Packaged for Android with Capacitor; actively in development.", { gap: 12, indent: 10 });
write("github.com/Jaffator/BikeCheck", { size: 9, gap: 14, indent: 10, colour: "0.35 0.35 0.35" });

// --- Stack ------------------------------------------------------------------
heading("STACK");
const groups = [
  ["Languages", "TypeScript, JavaScript, SQL, HTML, CSS"],
  ["Frontend", "React, Next.js, Tailwind CSS, Mantine UI, Vite"],
  ["Backend", "NestJS, Node.js, Prisma, PostgreSQL, REST"],
  ["Mobile", "Capacitor, Android"],
  ["Tooling", "Git, GitHub Actions, Docker, Playwright, Figma"],
];
for (const [name, items] of groups) {
  lines.push(
    `BT /F2 9 Tf 0 0 0 rg 1 0 0 1 ${LEFT} ${y} Tm (${pdfString(name)}) Tj ET`,
    `BT /F1 10 Tf 0 0 0 rg 1 0 0 1 ${LEFT + 96} ${y} Tm (${pdfString(items)}) Tj ET`,
  );
  y -= 14;
}

// --- How I work -------------------------------------------------------------
heading("HOW I WORK");
write("Model the domain before writing the schema; decide where complexity should live.", { gap: 12, indent: 10 });
write("Write the tests that make a change safe, and verify against the built artefact.", { gap: 12, indent: 10 });
write("Take a feature end to end: schema, API, client, and the build that ships it.", { gap: 12, indent: 10 });

// --- Languages --------------------------------------------------------------
heading("LANGUAGES");
write("Czech — native   |   English — reads and writes technical English daily", { gap: 14 });

// --- Footer -----------------------------------------------------------------
y = 56;
write("Full case study: jardalufi.cz/bikecheck", { size: 8, gap: 10, colour: "0.45 0.45 0.45" });

const content = lines.join("\n");

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  "<< /Title (Jaroslav Lufinka — CV) /Author (Jaroslav Lufinka) /Subject (Curriculum vitae) /Creator (personal-site) >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefOffset = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets) {
  pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

await writeFile(OUT, Buffer.from(pdf, "latin1"));
console.log(`Wrote ${OUT} (${Buffer.byteLength(pdf, "latin1")} bytes)`);
