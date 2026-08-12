#!/usr/bin/env node
/**
 * Writes the placeholder Walkthrough: a poster frame, a playable video and a
 * caption track, at the paths the player already points at.
 *
 * ---------------------------------------------------------------------------
 * PLACEHOLDER RECORDING — Jaroslav must replace this before the site is
 * deployed. It is ticket 13, and it is the critical path: with no live demo and
 * no store listing, the real recording is the only proof a Reader has that
 * BikeCheck runs.
 *
 * What is generated below is a legible holding frame, not a recording of
 * anything. It exists so the player, its poster, its caption track, its aspect
 * ratio and its byte budget are real and under test from the day the component
 * ships — the same reason `build-cv.mjs` writes a placeholder PDF.
 *
 * Replacing it is a file swap and nothing else: drop the real files at the four
 * paths below, keeping the names, and adjust WALKTHROUGH in
 * `app/_content/walkthrough.ts` if the recording's dimensions differ. No
 * component changes, and this script is then dead and can be deleted.
 * ---------------------------------------------------------------------------
 *
 * The poster is assembled byte by byte, because a flat panel with one mark on
 * it does not justify an image dependency. The video is encoded by driving
 * Chromium's own `MediaRecorder` over a canvas, because H.264 does justify one
 * and Playwright is already installed — a hand-written elementary stream is the
 * kind of thing that parses, reports a duration, and then fails to decode in
 * front of a Reader.
 *
 * Usage: node scripts/build-walkthrough-placeholder.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(projectRoot, "public", "walkthrough");

/**
 * The frame the placeholder is drawn at. Portrait, because BikeCheck is an
 * Android application and the real recording will be a phone screen — getting
 * this wrong would reserve the wrong aspect ratio and move the page around on
 * the day the recording lands.
 */
const WIDTH = 720;
const HEIGHT = 1280;

/** How long the placeholder runs. Long enough to prove it plays. */
const DURATION_SECONDS = 2;

/** The greys the holding frame is drawn in, matched to the site's dark surface. */
const PANEL = 0x13;
const FRAME = 0x24;
const MARK = 0x8a;

// --- PNG --------------------------------------------------------------------

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typed = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, checksum]);
}

/**
 * A greyscale PNG from a pixel-producing function. Greyscale rather than RGB
 * because the placeholder is a flat panel with a mark on it, and three channels
 * of identical values would triple the file for no visible difference.
 */
function greyscalePng(width, height, pixelAt) {
  // One filter byte per scanline, then the row. Filter 0 — none — because the
  // image is mostly flat and deflate handles the runs without help.
  const raw = Buffer.alloc(height * (width + 1));
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0;
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      raw[offset] = pixelAt(x, y);
      offset += 1;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 0; // colour type: greyscale
  header[10] = 0; // compression
  header[11] = 0; // filter
  header[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * The holding frame: a phone-shaped panel with a centred play mark, in the
 * site's greys. It reads as "a video sits here" without claiming to be a
 * screenshot of an application nobody has recorded yet — a mocked-up UI would
 * be exactly the promise the empty slot was written to avoid making.
 */
function posterPixel(x, y) {
  const inset = Math.round(WIDTH * 0.06);
  if (x < inset || x >= WIDTH - inset || y < inset || y >= HEIGHT - inset) {
    return PANEL;
  }

  const size = Math.round(WIDTH * 0.2);
  const dx = x - (WIDTH / 2 - size * 0.3);
  const dy = y - HEIGHT / 2;
  const withinMark = dx >= 0 && dx <= size && Math.abs(dy) <= (size - dx) * 0.62;

  return withinMark ? MARK : FRAME;
}

// --- MP4 --------------------------------------------------------------------

const hex = (value) => `#${value.toString(16).padStart(2, "0").repeat(3)}`;

/**
 * Encodes the video by recording a canvas in a real browser.
 *
 * A page has to be served over HTTP rather than opened as `about:blank`,
 * because Chromium refuses media work on an opaque origin — which is also the
 * shape the site itself serves these files in.
 */
async function encodeMp4() {
  const server = createServer((_request, response) => {
    response
      .writeHead(200, { "content-type": "text/html; charset=utf-8" })
      .end("<!doctype html><html lang=\"en\"><title>encoder</title>");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}/`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(origin);

    const encoded = await page.evaluate(
      async ({ width, height, seconds, greys }) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // The same holding frame as the poster, drawn with canvas primitives.
        const paint = () => {
          ctx.fillStyle = greys.panel;
          ctx.fillRect(0, 0, width, height);
          const inset = Math.round(width * 0.06);
          ctx.fillStyle = greys.frame;
          ctx.fillRect(inset, inset, width - inset * 2, height - inset * 2);
          const size = Math.round(width * 0.2);
          const x = width / 2 - size * 0.3;
          const y = height / 2;
          ctx.fillStyle = greys.mark;
          ctx.beginPath();
          ctx.moveTo(x, y - size * 0.62);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x, y + size * 0.62);
          ctx.closePath();
          ctx.fill();
        };

        paint();

        const mimeType = 'video/mp4;codecs="avc1.42E01E"';
        if (!window.MediaRecorder?.isTypeSupported(mimeType)) {
          throw new Error(`This browser cannot encode ${mimeType}.`);
        }

        // 12fps and a low bitrate: the frame never changes, so anything more
        // buys nothing and spends bytes the performance budget is holding.
        const stream = canvas.captureStream(12);
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 120_000,
        });

        const chunks = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        const stopped = new Promise((resolve) => {
          recorder.onstop = resolve;
        });

        recorder.start();
        // Repaint every frame: a canvas that never changes produces no frames
        // to capture, and the recording would come out empty.
        const startedAt = performance.now();
        await new Promise((resolve) => {
          const tick = () => {
            paint();
            if (performance.now() - startedAt < seconds * 1000) {
              requestAnimationFrame(tick);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(tick);
        });
        recorder.stop();
        await stopped;

        const bytes = new Uint8Array(await new Blob(chunks, { type: mimeType }).arrayBuffer());
        let binary = "";
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return btoa(binary);
      },
      {
        width: WIDTH,
        height: HEIGHT,
        seconds: DURATION_SECONDS,
        greys: { panel: hex(PANEL), frame: hex(FRAME), mark: hex(MARK) },
      },
    );

    return Buffer.from(encoded, "base64");
  } finally {
    await browser.close();
    server.close();
  }
}

// --- Captions ---------------------------------------------------------------

/**
 * The caption track. It is not a transcript of anything yet, because there is
 * nothing to transcribe — what it carries is the one true statement about the
 * file it accompanies, so a Reader who turns captions on is told where they
 * stand rather than met with silence.
 *
 * WebVTT rather than SRT: it is the only format `<track>` accepts.
 */
function captions(text) {
  return `WEBVTT

NOTE
Placeholder captions. Ticket 13 replaces this file with the real recording's
captions, describing what happens on screen at each step. The file is served
as-is, so replacing it needs no code change.

1
00:00:00.000 --> 00:0${DURATION_SECONDS}.000
${text}
`;
}

const CAPTIONS = {
  "bikecheck.en.vtt": captions("[Placeholder — the BikeCheck walkthrough has not been recorded yet]"),
  "bikecheck.cs.vtt": captions("[Zástupný soubor — průchod aplikací BikeCheck zatím nebyl natočen]"),
};

// --- Write ------------------------------------------------------------------

await mkdir(OUT_DIR, { recursive: true });

const poster = greyscalePng(WIDTH, HEIGHT, posterPixel);
await writeFile(path.join(OUT_DIR, "bikecheck.png"), poster);

const video = await encodeMp4();
await writeFile(path.join(OUT_DIR, "bikecheck.mp4"), video);

for (const [name, body] of Object.entries(CAPTIONS)) {
  await writeFile(path.join(OUT_DIR, name), body, "utf8");
}

console.log(
  [
    `Wrote the placeholder Walkthrough into ${path.relative(projectRoot, OUT_DIR)}:`,
    `  bikecheck.png   ${poster.length} bytes  ${WIDTH}x${HEIGHT}`,
    `  bikecheck.mp4   ${video.length} bytes  ${DURATION_SECONDS}s`,
    `  ${Object.keys(CAPTIONS).join(", ")}`,
  ].join("\n"),
);
