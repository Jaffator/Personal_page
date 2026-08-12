import { expect, test, type Page } from "@playwright/test";
import { locales, routes, type Locale, type Route } from "./routes";
import { visitRoute } from "./visit";

/**
 * The social preview card, asserted the way the thing that renders it meets
 * it: by reading the page's metadata, fetching whatever URL it names, and
 * checking that what comes back is an image of the right kind and size.
 *
 * A crawler for a chat client or a mail client does not run the site's code —
 * it reads the tags and fetches the URL. So does this file. Nothing here knows
 * how the image was produced, which is what lets the generator be replaced
 * without touching these checks.
 *
 * The production origin is written out rather than taken from the site, for
 * the reason `locale.spec.ts` gives: these URLs are what a crawler resolves, so
 * a check that agreed with a mistake in the site's own base URL would be
 * exactly the bug worth catching.
 */
const SITE_ORIGIN = "https://jardalufi.cz";

/** What every major platform crops a large card to. */
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

/**
 * The smallest a card can be and still be a drawn card rather than a blank
 * rectangle. A flat fill of one colour compresses to a few hundred bytes, so
 * this is the floor that separates "an image was generated" from "an image was
 * generated and has something on it".
 */
const MINIMUM_CARD_BYTES = 5_000;

/** The content of a meta tag, whether it is keyed by `property` or by `name`. */
async function metaContent(page: Page, key: string): Promise<string | null> {
  return page
    .locator(`meta[property="${key}"], meta[name="${key}"]`)
    .first()
    .getAttribute("content");
}

/**
 * Fetches the card a page declares, through the browser's own request stack.
 *
 * The declared URL is absolute and points at the production origin, which is
 * not what is being served here, so only its path is followed. That is the
 * same resolution a crawler performs, minus the hostname it cannot reach from
 * a test machine.
 */
async function fetchDeclaredCard(page: Page, declared: string) {
  const { pathname, search } = new URL(declared);
  const response = await page.request.get(`${pathname}${search}`);
  return {
    status: response.status(),
    contentType: response.headers()["content-type"] ?? "",
    body: await response.body(),
  };
}

/**
 * The pixel dimensions in a PNG's header.
 *
 * Read from the bytes rather than by decoding the image: the IHDR chunk is the
 * first thing after the 8-byte signature, and its width and height are the two
 * big-endian integers that open it. That is the whole of what needs checking,
 * and it needs no image library to check it.
 */
function pngDimensions(body: Buffer): { width: number; height: number } {
  const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  expect(
    body.subarray(0, SIGNATURE.length).equals(SIGNATURE),
    "The declared social preview image is not a PNG, whatever its URL and content type claim.",
  ).toBe(true);

  return { width: body.readUInt32BE(16), height: body.readUInt32BE(20) };
}

test.describe("every route declares a social preview card", () => {
  for (const route of routes) {
    test(`${route.path} names an image, its type and its size`, async ({ page }) => {
      await visitRoute(page, route.path);

      const declared = await metaContent(page, "og:image");

      expect(
        declared,
        `A link to ${route.path} pasted into a chat client, a mail client or a post renders as a bare URL: the page declares no og:image.`,
      ).not.toBeNull();

      // A crawler resolves the image before it has loaded the page it belongs
      // to, so a relative URL is one it cannot follow.
      expect(
        declared,
        `${route.path} declares its card at "${declared}", which is not an absolute URL under ${SITE_ORIGIN} — a crawler has nothing to resolve it against.`,
      ).toContain(SITE_ORIGIN);

      // The dimensions are declared as well as being true of the file, because
      // several platforms lay out the card from the tags before they have
      // finished fetching the image.
      expect(
        await metaContent(page, "og:image:width"),
        `${route.path} does not declare its card's width, so a platform reserves the wrong space for it.`,
      ).toBe(String(CARD_WIDTH));

      expect(
        await metaContent(page, "og:image:height"),
        `${route.path} does not declare its card's height, so a platform reserves the wrong space for it.`,
      ).toBe(String(CARD_HEIGHT));
    });

    test(`${route.path} asks to be rendered as a large card`, async ({ page }) => {
      await visitRoute(page, route.path);

      // Without this, a card with a perfectly good image is still rendered as
      // a thumbnail beside a line of text, which is the layout this ticket
      // exists to avoid.
      expect(
        await metaContent(page, "twitter:card"),
        `${route.path} does not ask for a large card, so the image is rendered as a small thumbnail beside the text.`,
      ).toBe("summary_large_image");

      expect(
        await metaContent(page, "twitter:image"),
        `${route.path} names no image for a platform that reads the twitter tags rather than the Open Graph ones.`,
      ).not.toBeNull();
    });

    test(`${route.path} serves the card it declares`, async ({ page }) => {
      await visitRoute(page, route.path);

      const declared = await metaContent(page, "og:image");
      const card = await fetchDeclaredCard(page, declared!);

      expect(
        card.status,
        `${route.path} declares a card at ${declared}, which the built site answers with ${card.status}. A declared image that 404s is worse than none: the card renders empty.`,
      ).toBe(200);

      expect(
        card.contentType,
        `The card for ${route.path} is served as "${card.contentType}" rather than as an image, so a crawler discards it.`,
      ).toContain("image/");

      expect(
        card.body.length,
        `The card for ${route.path} is ${card.body.length} bytes, which is too small to have anything drawn on it.`,
      ).toBeGreaterThan(MINIMUM_CARD_BYTES);
    });

    test(`${route.path} serves it at the size a platform expects`, async ({ page }) => {
      await visitRoute(page, route.path);

      const declared = await metaContent(page, "og:image");
      const card = await fetchDeclaredCard(page, declared!);

      // Asserted against the file rather than only against the tags: a card at
      // the wrong ratio is letterboxed or cropped by the platform, and which
      // of the two happens is not ours to decide.
      expect(
        pngDimensions(card.body),
        `The card for ${route.path} is not ${CARD_WIDTH}x${CARD_HEIGHT}, so a platform crops or letterboxes it rather than showing what was drawn.`,
      ).toEqual({ width: CARD_WIDTH, height: CARD_HEIGHT });
    });
  }
});

test.describe("each card belongs to its own page", () => {
  /**
   * The bytes of the card a route declares.
   *
   * Bytes rather than the declared URL, which is what this originally compared
   * and what made it unable to fail: the site emits one file per route
   * directory, so two routes can be served genuinely different URLs and still
   * be sent the same drawn card — which is exactly what happens when a card is
   * written into the wrong directory and a route inherits the one above it.
   * Two URLs differing proves only that two files exist.
   */
  async function cardBytes(page: Page, route: Route): Promise<Buffer> {
    await visitRoute(page, route.path);
    const declared = await metaContent(page, "og:image");

    expect(
      declared,
      `${route.path} declares no social preview image at all.`,
    ).not.toBeNull();

    const card = await fetchDeclaredCard(page, declared!);

    expect(
      card.body.length,
      `The card for ${route.path} is too small to have anything drawn on it.`,
    ).toBeGreaterThan(MINIMUM_CARD_BYTES);

    return card.body;
  }

  for (const route of routes) {
    for (const other of routes) {
      // Each unordered pair once, and never a route against itself.
      if (routes.indexOf(other) <= routes.indexOf(route)) continue;

      test(`${route.path} and ${other.path} do not share one card`, async ({ page }) => {
        const first = await cardBytes(page, route);
        const second = await cardBytes(page, other);

        expect(
          first.equals(second),
          `${route.path} and ${other.path} are served the same drawn card, so a Reader sent both links sees one image twice and at least one of them is a card for another page.`,
        ).toBe(false);
      });
    }
  }

  /**
   * The two locales of one page are drawn from two different titles, so their
   * cards must be two different images.
   *
   * The pairwise check above already compares every route against every other,
   * so this pair is covered by it arithmetically. It is stated separately
   * because the failure it names is a specific and likely one — a generator
   * that drew both locales from one dictionary, which is how a locale gets
   * dropped — and a suite that only said "two routes share a card" would leave
   * that diagnosis to be worked out.
   */
  const keys = [...new Set(routes.map((route) => route.key))];

  for (const key of keys) {
    for (const locale of locales.filter((candidate) => candidate !== "en")) {
      test(`"${key}" is drawn in ${locale} rather than reusing the English card`, async ({
        page,
      }) => {
        const versionOf = (target: Locale): Route =>
          routes.find(
            (candidate) => candidate.key === key && candidate.locale === target,
          )!;

        const english = await cardBytes(page, versionOf("en"));
        const translated = await cardBytes(page, versionOf(locale));

        expect(
          translated.equals(english),
          `The ${locale} card for "${key}" is byte-identical to the English one, so a Reader sent the ${locale} link sees a card written in another language.`,
        ).toBe(false);
      });
    }
  }
});
