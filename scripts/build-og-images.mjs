#!/usr/bin/env node
/**
 * Writes one social preview image per route per locale, into the
 * `opengraph-image.png` file Next.js looks for beside each page.
 *
 * A link to this site pasted into an application email, a chat client or a post
 * should render as a designed card rather than as a bare URL. That matters most
 * for the Case Study, which is the link sent deliberately.
 *
 * The card is drawn from the site's own sources and nothing else: the colours
 * and the type stack are parsed out of app/globals.css, the title and
 * description come from the same dictionary entry the page's `<title>` and
 * meta description do, and the URL under them is built by the site's own
 * `pathTo`. Nothing here is a second copy of a value the site already holds, so
 * a card cannot drift from the page it represents — a token changed in
 * globals.css changes the cards on the next build.
 *
 * It renders in Chromium rather than in `next/og`, for one reason: the site's
 * typeface is self-hosted as woff2, and satori — which is what backs
 * `next/og` — cannot read woff2. A browser can, natively, from the very files
 * the site serves. `scripts/build-walkthrough-placeholder.mjs` reaches for
 * Chromium for the same kind of reason, and Playwright is already a dependency
 * of the verification suite, so this adds nothing to install.
 *
 * Dropping the PNGs where Next.js expects them is what wires up the metadata:
 * the framework emits `og:image`, its type, its width and height, and the
 * `twitter:card` that asks for a large card, for every page under that
 * directory. There is no metadata written by hand here.
 *
 * Usage: node scripts/build-og-images.mjs
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium } from "@playwright/test";
import {
  dictionaries,
  locales,
  pathTo,
  projectRoot,
  routeKeys,
  SITE_URL,
} from "./site-source.mjs";

/**
 * The card's pixel size. 1200x630 is what every major platform crops to for a
 * large card; anything else is letterboxed or cropped by the platform rather
 * than by us.
 */
const WIDTH = 1200;
const HEIGHT = 630;

/**
 * The host shown on the card.
 *
 * Taken from the site's own `SITE_URL` rather than written out, for the reason
 * everything else here is: it is the address a Reader reads off the card and
 * then types, so a second copy of it is a second thing to get wrong.
 */
const SITE_HOST = SITE_URL.host;

/**
 * Where each route's image belongs: the directory holding that route's
 * `page.tsx`, because that is where Next.js looks for it.
 *
 * Written out rather than derived from `pathTo`, because it is a fact about
 * the App Router's directory layout — route groups, which contribute no path
 * segment — rather than about the site's URLs. `assertEveryRouteIsCovered`
 * below is what keeps the two in step: a route added to the site with no entry
 * here fails the build rather than shipping without a card.
 */
const IMAGE_DIRECTORIES = {
  en: { home: "app/(en)", caseStudy: "app/(en)/bikecheck" },
  cs: { home: "app/(cs)/cs", caseStudy: "app/(cs)/cs/bikecheck" },
};

/**
 * Every route of the site, in every locale, and the one place this script
 * decides what it is generating.
 *
 * It is the site's own `locales` crossed with its own `routeKeys`, so adding
 * either — a third locale, or the Case Study of a second Project — produces
 * its cards without a line changing here. That is what makes a Project's
 * preview image follow from adding the Project.
 */
function everyRoute() {
  return locales.flatMap((locale) =>
    routeKeys.map((route) => ({ locale, route })),
  );
}

/**
 * The URL path an App Router directory serves, by the framework's own rules:
 * a segment in parentheses is a route group and contributes nothing.
 *
 * This is what lets a directory be checked against the route it is claimed to
 * hold, rather than merely being checked for existing.
 */
function pathServedBy(directory) {
  const segments = directory
    .split("/")
    .slice(1) // "app" itself is the root and names no segment.
    .filter((segment) => !segment.startsWith("("));

  return `/${segments.join("/")}`;
}

/**
 * Fails before rendering anything if a route has nowhere to write its image,
 * or if the directory named for it is not actually that route's.
 *
 * Existence is not enough to check, and checking only that was a real bug: a
 * directory that holds no `page.tsx` — or that holds a different route's —
 * takes the card quite happily, and the route it was meant for then inherits
 * whichever card sits above it. That ships a card for the wrong page, which is
 * worse than shipping none, because nothing looks broken. So each entry is
 * held to both: it is a page, and it is *this* page.
 *
 * The check is here rather than left to a missing-file error at the end,
 * because the failure it catches is a route added without a card — and the
 * symptom of that, if it reached production, is a link that renders as a bare
 * URL in the one place the site is being judged.
 */
function assertEveryRouteIsCovered() {
  const faults = [];

  for (const { locale, route } of everyRoute()) {
    const expected = pathTo(locale, route);
    const directory = IMAGE_DIRECTORIES[locale]?.[route];

    if (directory === undefined) {
      faults.push(`  ${locale} "${route}" (${expected}) — no entry in IMAGE_DIRECTORIES.`);
      continue;
    }

    if (!existsSync(path.join(projectRoot, directory, "page.tsx"))) {
      faults.push(
        `  ${locale} "${route}" (${expected}) — ${directory} holds no page.tsx, so nothing would serve the card written there.`,
      );
      continue;
    }

    const served = pathServedBy(directory);
    if (served !== expected) {
      faults.push(
        `  ${locale} "${route}" — ${directory} serves ${served}, not ${expected}. The card would be written against the wrong page.`,
      );
    }
  }

  if (faults.length > 0) {
    throw new Error(
      `Every route needs a social preview image, and ${faults.length} would not get the right one:\n` +
        faults.join("\n") +
        "\nFix IMAGE_DIRECTORIES in scripts/build-og-images.mjs, naming the directory that holds that route's page.tsx.\n",
    );
  }
}

// --- The site's own values ---------------------------------------------------

/**
 * The colours and type stack the card is drawn in, read out of the stylesheet
 * that declares them.
 *
 * Parsed rather than restated: a hex written here would be a second definition
 * of a token, which is the one thing `scripts/check-tokens.mjs` exists to
 * prevent in component code. The card should be held to the same bar.
 *
 * The dark values are taken, not the light ones. A preview card is seen against
 * a feed or a mail client rather than against a page, and the dark card is the
 * one that reads as deliberate in both — a white rectangle in a dark timeline
 * reads as a screenshot of something else.
 */
function readTokens(stylesheet) {
  /** The last declaration of a token wins, which is the dark theme's. */
  const lastValueOf = (token) => {
    const declarations = [...stylesheet.matchAll(new RegExp(`--${token}:\\s*([^;]+);`, "g"))];
    const last = declarations.at(-1);
    if (!last) {
      throw new Error(
        `app/globals.css declares no --${token}, which the social preview cards are drawn from. If the token was renamed, rename it here too.`,
      );
    }
    return last[1].replace(/\s+/g, " ").trim();
  };

  return {
    page: lastValueOf("color-page"),
    ink: lastValueOf("color-ink"),
    muted: lastValueOf("color-muted"),
    rule: lastValueOf("color-rule"),
    accent: lastValueOf("color-accent"),
    sans: lastValueOf("font-sans"),
    mono: lastValueOf("font-mono"),
    // The site has exactly one rule weight, and the card's rule is that rule.
    hairline: lastValueOf("rule-hairline"),
    /**
     * The letter spacing the metadata register is set in, and the display
     * register's negative tracking.
     *
     * The type *sizes* on a card are deliberately not the site's: a card is
     * read at a few hundred pixels wide in a feed, so its type is far larger
     * relative to the frame than anything on a page. The letterforms are the
     * same decisions though, and those are tokens.
     */
    metaTracking: lastValueOf("text-meta--letter-spacing"),
    displayTracking: lastValueOf("text-display--letter-spacing"),
  };
}

/**
 * The `@font-face` rules from the stylesheet, unchanged.
 *
 * Lifted wholesale rather than rewritten, so the card renders in the same
 * faces, weights and subsets the site does. The `unicode-range` declarations
 * come along with them, which is what lets the Czech cards reach the latin-ext
 * subset for their diacritics exactly as the Czech pages do.
 */
function readFontFaces(stylesheet) {
  const faces = stylesheet.match(/@font-face\s*\{[^}]*\}/g) ?? [];

  if (faces.length === 0) {
    throw new Error(
      "app/globals.css declares no @font-face rules, so the social preview cards would be drawn in a fallback face rather than in the site's own.",
    );
  }

  return faces.join("\n\n");
}

// --- The card ----------------------------------------------------------------

/**
 * The card's markup, in the site's register: an eyebrow in the monospace the
 * design system reserves for metadata, the page's own title set large, its
 * description beneath, and a hairline rule above the URL.
 *
 * The title is the page's title, so each card reflects the page it belongs to
 * rather than being one image reused across the site. It is set at a size that
 * survives the smallest place a card is shown — a chat client's inline preview,
 * where the 1200px image is drawn a few hundred pixels wide — which is why the
 * type here is far larger relative to the frame than anything on the site.
 *
 * The escaping matters: a title carrying an ampersand or an angle bracket must
 * land as text rather than as markup.
 */
function cardMarkup({ locale, title, description, url, tokens, fontFaces }) {
  const escape = (text) =>
    text.replace(/[&<>"]/g, (character) => `&#${character.charCodeAt(0)};`);

  return `<!doctype html>
<html lang="${locale}">
<meta charset="utf-8">
<title>${escape(title)}</title>
<style>
${fontFaces}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  background-color: ${tokens.page};
  color: ${tokens.ink};
  font-family: ${tokens.sans};
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 72px 80px;
}

.eyebrow {
  font-family: ${tokens.mono};
  font-size: 24px;
  letter-spacing: ${tokens.metaTracking};
  text-transform: uppercase;
  color: ${tokens.accent};
}

h1 {
  margin: 0;
  font-size: 86px;
  line-height: 1.05;
  letter-spacing: ${tokens.displayTracking};
  font-weight: 600;
  /* The longest title the site carries still fits on two lines at this size.
     A third line would push the description into the footer, so it is clipped
     rather than allowed to reflow the card. */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

p {
  margin: 28px 0 0;
  font-size: 32px;
  line-height: 1.5;
  color: ${tokens.muted};
  max-width: 22em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

footer {
  border-top: ${tokens.hairline} solid ${tokens.rule};
  padding-top: 28px;
  font-family: ${tokens.mono};
  font-size: 26px;
  color: ${tokens.muted};
}
</style>

<header class="eyebrow">${escape(SITE_HOST)}</header>

<main>
  <h1>${escape(title)}</h1>
  <p>${escape(description)}</p>
</main>

<footer>${escape(url)}</footer>
`;
}

// --- Rendering ---------------------------------------------------------------

/**
 * Serves the card and the site's font files to the browser rendering them.
 *
 * A server rather than `setContent`, because the `@font-face` rules lifted out
 * of globals.css name the fonts by absolute path — `/fonts/inter-latin.woff2` —
 * which is the path the site serves them under. Serving them at the same path
 * is what lets those rules be used unchanged.
 */
async function serveCards(markupFor) {
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, "http://127.0.0.1");

    if (pathname.startsWith("/fonts/")) {
      try {
        const file = await readFile(path.join(projectRoot, "public", pathname));
        response
          .writeHead(200, { "content-type": "font/woff2", "cache-control": "no-store" })
          .end(file);
      } catch {
        response.writeHead(404).end();
      }
      return;
    }

    const markup = markupFor(pathname);
    if (markup === undefined) {
      response.writeHead(404).end();
      return;
    }

    response
      .writeHead(200, { "content-type": "text/html; charset=utf-8" })
      .end(markup);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => server.close(),
  };
}

async function main() {
  assertEveryRouteIsCovered();

  // One read, two readers: the tokens and the font faces are both facts about
  // the same stylesheet, and reading it twice invited them to disagree.
  const stylesheet = await readFile(path.join(projectRoot, "app/globals.css"), "utf8");
  const tokens = readTokens(stylesheet);
  const fontFaces = readFontFaces(stylesheet);

  /** Every card to draw, keyed by the path the browser will ask for it at. */
  const cards = new Map(
    everyRoute().map(({ locale, route }) => {
      const { title, description } = dictionaries[locale].meta[route];
      const routePath = pathTo(locale, route);

      return [
        `/${locale}/${route}`,
        {
          locale,
          route,
          file: path.join(projectRoot, IMAGE_DIRECTORIES[locale][route], "opengraph-image.png"),
          markup: cardMarkup({
            locale,
            title,
            description,
            // The home page is `/`, which reads as nothing at the foot of a
            // card, so the bare host stands in for it.
            url: routePath === "/" ? SITE_HOST : `${SITE_HOST}${routePath}`,
            tokens,
            fontFaces,
          }),
        },
      ];
    }),
  );

  const server = await serveCards((pathname) => cards.get(pathname)?.markup);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      // The card is a fixed-pixel image, so it is drawn at 1:1. A device scale
      // factor would produce a 2400px file for no gain: every platform
      // downscales to its own preview size anyway, and the bytes are spent
      // where the performance budget is being held.
      deviceScaleFactor: 1,
    });

    const written = [];

    for (const [pathname, card] of cards) {
      await page.goto(`${server.origin}${pathname}`, { waitUntil: "load" });

      // Without this the screenshot can be taken while the face is still
      // loading, and the card ships set in a fallback — which is the one defect
      // that would not be visible in review, because it renders fine locally
      // once the font is in cache.
      await page.evaluate(() => document.fonts.ready);

      const image = await page.screenshot({ type: "png" });
      await writeFile(card.file, image);
      written.push({ card, bytes: image.length });
    }

    console.log(
      [
        `Wrote ${written.length} social preview image(s) at ${WIDTH}x${HEIGHT}:`,
        ...written.map(
          ({ card, bytes }) =>
            `  ${path.relative(projectRoot, card.file).replace(/\\/g, "/")}  ${bytes} bytes  (${card.locale} ${card.route})`,
        ),
      ].join("\n"),
    );
  } finally {
    await browser.close();
    server.close();
  }
}

await main();
