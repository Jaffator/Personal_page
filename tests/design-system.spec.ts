import { expect, test, type Browser, type Page } from "@playwright/test";
import { routes } from "./routes";
import { visitRoute } from "./visit";

/**
 * The design system is asserted through the built site like everything else:
 * these checks read what the browser actually resolved, not what the source
 * declared. A token the components never reference is tree-shaken out of the
 * build and is invisible here — which is the right outcome, since a token
 * nothing uses cannot break a Reader's page.
 */

const HOME = "/";

type TokenMap = Record<string, string>;

/** Runs `read` against the home page under one colour-scheme preference. */
async function underColorScheme<T>(
  browser: Browser,
  colorScheme: "light" | "dark",
  read: (page: Page) => Promise<T>,
): Promise<T> {
  const context = await browser.newContext({ colorScheme });
  try {
    const page = await context.newPage();
    await visitRoute(page, HOME);
    return await read(page);
  } finally {
    await context.close();
  }
}

/** Every custom property the browser resolved on the document root. */
function readTokens(): TokenMap {
  const computed = getComputedStyle(document.documentElement);
  const tokens: TokenMap = {};
  for (const property of Array.from(computed)) {
    if (property.startsWith("--")) {
      tokens[property] = computed.getPropertyValue(property).trim();
    }
  }
  return tokens;
}

function unquote(value: string): string {
  return value.replace(/["']/g, "").trim();
}

function relativeLuminance(color: string): number {
  const match = /rgba?\(([^)]+)\)/.exec(color);
  if (!match) throw new Error(`Not an rgb colour: ${color}`);
  const [r, g, b] = match[1].split(/[\s,/]+/).slice(0, 3).map(Number);
  const channel = (value: number): number => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

test.describe("tokens", () => {
  test("both themes resolve the same token names", async ({ browser }) => {
    const read = (page: Page): Promise<TokenMap> => page.evaluate(readTokens);
    const light = await underColorScheme(browser, "light", read);
    const dark = await underColorScheme(browser, "dark", read);

    expect(
      Object.keys(light).length,
      "No custom properties resolved on :root — the design tokens are not reaching the built page.",
    ).toBeGreaterThan(0);

    expect(
      Object.keys(dark).sort(),
      "The dark theme defines a different set of token names than the light theme, so it is a second implementation rather than the same tokens resolved differently.",
    ).toEqual(Object.keys(light).sort());

    const differing = Object.keys(light).filter((name) => light[name] !== dark[name]);

    expect(
      differing.length,
      "No token resolves to a different value in dark mode, so the two themes are identical.",
    ).toBeGreaterThan(0);

    expect(
      differing.filter((name) => !name.startsWith("--color-")),
      "Only colour tokens may differ between themes. Type scale, spacing and rule weights are one set of decisions, not two.",
    ).toEqual([]);
  });
});

test.describe("theme follows the system preference", () => {
  test("the page is light under a light preference and dark under a dark one", async ({
    browser,
  }) => {
    const background = (page: Page): Promise<string> =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    const light = await underColorScheme(browser, "light", background);
    const dark = await underColorScheme(browser, "dark", background);

    expect(
      relativeLuminance(light),
      `The page background under a light preference (${light}) is not lighter than under a dark one (${dark}).`,
    ).toBeGreaterThan(relativeLuminance(dark));
  });

  test("the browser is told which colour scheme the page supports", async ({ page }) => {
    await visitRoute(page, HOME);

    const colorScheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    );

    expect(
      colorScheme,
      "The document does not declare `color-scheme`, so form controls, scrollbars and the canvas keep their default light appearance in dark mode.",
    ).toContain("dark");
  });

  test("no script decides the theme, so there is nothing to flash", async ({ page }) => {
    await visitRoute(page, HOME);
    const html = (await (await page.request.get(HOME)).text()).toLowerCase();

    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(
      (match) => match[1],
    );
    const themeDeciding = scripts.filter((script) =>
      /prefers-color-scheme|matchmedia|localstorage|documentelement\.classlist/.test(script),
    );

    expect(
      themeDeciding,
      "A script in the served HTML decides the theme. The theme must resolve from CSS alone, or the wrong one paints first.",
    ).toEqual([]);

    expect(
      /<link[^>]+rel="stylesheet"/.test(html.split("</head>")[0]),
      "The stylesheet is not linked in <head>, so it does not block the first paint and the unstyled page shows through.",
    ).toBe(true);
  });
});

test.describe("typography", () => {
  test("no font is requested from a third party", async ({ page, baseURL }) => {
    const external: string[] = [];
    const fonts: string[] = [];
    const origin = new URL(baseURL!).origin;

    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.origin !== origin && url.protocol !== "data:") {
        external.push(request.url());
      }
      if (/\.(woff2?|ttf|otf)$/.test(url.pathname)) {
        fonts.push(request.url());
      }
    });

    await visitRoute(page, HOME);
    await page.evaluate(() => document.fonts.ready);

    expect(
      external,
      `The built page reaches out to another origin:\n${external.join("\n")}`,
    ).toEqual([]);

    expect(
      fonts.length,
      "The page requested no font file, so the self-hosted faces are either missing or never applied.",
    ).toBeGreaterThan(0);

    // The requests above only cover what this visit happened to need. The
    // built stylesheet is read outright, so a third-party `src` behind a
    // unicode-range no English page reaches for is caught too.
    const remoteUrls = await page.evaluate(async () => {
      const sheets = Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
      );
      const texts = await Promise.all(
        sheets.map((sheet) => fetch(sheet.href).then((response) => response.text())),
      );
      return texts
        .flatMap((text) => [...text.matchAll(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/g)])
        .map((match) => match[2])
        .filter((url) => /^(?:https?:)?\/\//.test(url));
    });

    expect(
      remoteUrls,
      `The built stylesheet points at another origin:\n${remoteUrls.join("\n")}`,
    ).toEqual([]);
  });

  test("the page renders in the self-hosted grotesk and monospace", async ({ page }) => {
    await visitRoute(page, HOME);
    await page.evaluate(() => document.fonts.ready);

    const families = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        body: getComputedStyle(document.body).fontFamily,
        sans: root.getPropertyValue("--font-sans").trim(),
        mono: root.getPropertyValue("--font-mono").trim(),
      };
    });

    expect(
      families.sans,
      "No `--font-sans` token, so component code has no name to reference for the grotesk.",
    ).not.toBe("");
    expect(
      families.mono,
      "No `--font-mono` token, so component code has no name to reference for the monospace.",
    ).not.toBe("");

    // Compared without quotes: the computed value drops the quotes the token
    // declares around family names that do not need them.
    expect(
      unquote(families.body),
      `The body does not render in the grotesk (${families.body}).`,
    ).toBe(unquote(families.sans));

    // Both faces really loaded, not merely declared: a token pointing at a
    // font file that 404s would satisfy every check above.
    const loaded = await page.evaluate(() =>
      Array.from(document.fonts)
        .filter((face) => face.status === "loaded")
        .map((face) => face.family.replace(/["']/g, "")),
    );

    for (const token of [families.sans, families.mono]) {
      const family = unquote(token.split(",")[0]);
      expect(
        loaded,
        `The self-hosted face "${family}" never loaded. Loaded faces: ${loaded.join(", ") || "none"}`,
      ).toContain(family);
    }
  });
});

test.describe("layout stability", () => {
  for (const { path } of routes) {
    /**
     * Nothing on the page may move after it paints. `font-display: optional`
     * is what makes that hold for the fonts specifically — the browser either
     * has the face before the first paint or keeps the fallback for the whole
     * page view — so this check will not catch a bad font swap so much as
     * catch the day someone removes `optional` and lets one back in.
     */
    test(`${path} does not shift its layout after load`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { __shift: number }).__shift = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput) {
              (window as unknown as { __shift: number }).__shift += entry.value;
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      await visitRoute(page, path);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);

      const shift = await page.evaluate(
        () => (window as unknown as { __shift: number }).__shift,
      );

      expect(
        shift,
        `${path} shifted its layout by ${shift} after load. Swapping a fallback for a webfont of different metrics is the usual cause.`,
      ).toBe(0);
    });
  }
});
