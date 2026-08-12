import { expect, test, type Locator, type Page } from "@playwright/test";
import { routes } from "./routes";
import { visitRoute } from "./visit";

/**
 * The Case Study, asserted through the built site: the structure a Reader
 * navigates and a screen reader announces.
 *
 * These checks are about shape rather than wording, because the prose is
 * placeholder until ticket 14 and the page has to hold its structure whatever
 * the copy says. What matters here is that the parts appear in order, that a
 * Deep Dive repeats as the same unit rather than as three hand-written
 * sections, that a figure's caption is attached to its figure, and that the
 * heading outline has no holes in it.
 *
 * The Walkthrough checks are the exception to "shape rather than content", and
 * deliberately so. It is the site's only proof the application actually runs,
 * and its failure modes are behavioural rather than structural — it autoplays,
 * it downloads eight megabytes nobody asked for, it becomes the largest
 * contentful paint element, or it plays a silent recording with nothing
 * explaining it. Each of those is asserted directly, and each survives ticket
 * 13 swapping the placeholder recording for the real one.
 */

const CASE_STUDIES = routes.filter((route) => route.key === "caseStudy");

/** The four moves every Deep Dive makes, in the order it makes them. */
const MOVES_PER_DEEP_DIVE = 4;

/** The Deep Dives, found by the section that titles them. */
function deepDives(page: Page): Locator {
  return page.locator("section[id^='deep-dive-']");
}

/** The Walkthrough player, found through its section rather than by being the page's only video. */
function walkthroughVideo(page: Page): Locator {
  return page.locator("section[aria-labelledby='walkthrough'] video");
}

/** The document outline, as a screen reader would walk it. */
async function headingLevels(page: Page): Promise<number[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((heading) =>
      Number(heading.tagName.slice(1)),
    ),
  );
}

test.describe("the page", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} presents the Case Study at its own URL`, async ({ page }) => {
      // `visitRoute` already asserts a 200 and exactly one h1 — which together
      // are the claim this ticket makes about the URL being pasteable into a
      // job application and landing on a real page.
      await visitRoute(page, route.path);
    });

    test(`${route.path} composes the parts of a Case Study in order`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      // Found by id rather than by heading text, so the check survives ticket
      // 14 rewriting every word on the page.
      const parts = ["architecture", "feature-tour", "deep-dives", "retrospective"];

      for (const part of parts) {
        await expect(
          page.locator(`section[aria-labelledby="${part}"]`),
          `${route.path} is missing the "${part}" part, so the Case Study does not make its full argument.`,
        ).toHaveCount(1);
      }

      const positions = await page.evaluate(
        (ids) =>
          ids.map((id) => {
            const section = document.querySelector(`section[aria-labelledby="${id}"]`);
            return section ? section.getBoundingClientRect().top : Number.NaN;
          }),
        parts,
      );

      const ordered = [...positions].sort((a, b) => a - b);
      expect(
        positions,
        `${route.path} renders the parts of the Case Study out of order, so the argument arrives in the wrong sequence.`,
      ).toEqual(ordered);
    });
  }
});

test.describe("Deep Dives", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} repeats the Deep Dive as one unit`, async ({ page }) => {
      await visitRoute(page, route.path);

      const dives = deepDives(page);

      // Three, because the ticket asks that the unit be usable three times
      // without duplication and BikeCheck's Case Study exercises exactly that.
      expect(
        await dives.count(),
        `${route.path} renders a different number of Deep Dives than the content declares.`,
      ).toBe(3);

      for (const dive of await dives.all()) {
        await expect(
          dive.getByRole("heading", { level: 3 }),
          `A Deep Dive on ${route.path} has no title of its own.`,
        ).toHaveCount(1);

        // The four moves are what makes it the same unit each time. A Deep
        // Dive missing one — in practice, the cost — is the failure this
        // asserts against.
        await expect(
          dive.getByRole("heading", { level: 4 }),
          `A Deep Dive on ${route.path} does not make all four moves, so it is not the repeatable unit the Case Study is built from.`,
        ).toHaveCount(MOVES_PER_DEEP_DIVE);
      }
    });

    test(`${route.path} labels every Deep Dive the same way`, async ({ page }) => {
      await visitRoute(page, route.path);

      // The labels repeating verbatim is the evidence that one component
      // rendered all three, rather than three sections being written by hand
      // and drifting apart.
      const labelSets = await Promise.all(
        (await deepDives(page).all()).map(async (dive) =>
          (await dive.getByRole("heading", { level: 4 }).allInnerTexts()).map((text) =>
            text.trim(),
          ),
        ),
      );

      for (const labels of labelSets) {
        expect(
          labels,
          `The Deep Dives on ${route.path} do not carry the same four labels, so they read as three different kinds of thing.`,
        ).toEqual(labelSets[0]);
      }
    });
  }
});

test.describe("the Walkthrough", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} sits the player in its slot in the Case Study`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      // The Walkthrough carries the site's proof: with no live demo and no
      // store listing, it is the only evidence the application runs. So it is
      // a titled part of the page rather than a video dropped into the prose.
      await expect(
        page.locator("section[aria-labelledby='walkthrough']"),
        `${route.path} has no Walkthrough section, so the Case Study offers no evidence the application runs.`,
      ).toHaveCount(1);

      await expect(
        walkthroughVideo(page),
        `${route.path} has a Walkthrough section with no player in it.`,
      ).toHaveCount(1);

      // Above the architecture, which is the order the Case Study argues in:
      // proof it runs, then how it is built.
      const [walkthrough, architecture] = await page.evaluate(() =>
        ["walkthrough", "architecture"].map((id) => {
          const section = document.querySelector(`section[aria-labelledby="${id}"]`);
          return section ? section.getBoundingClientRect().top : Number.NaN;
        }),
      );

      expect(
        walkthrough,
        `${route.path} places the Walkthrough after the architecture, so a Reader is told how it is built before being shown that it runs.`,
      ).toBeLessThan(architecture);
    });

    test(`${route.path} plays only on the Reader's action`, async ({ page }) => {
      await visitRoute(page, route.path);

      const video = walkthroughVideo(page);

      // Autoplay is the failure this asserts against, in all three forms it
      // takes: the attribute, a script calling play(), and the muted+inline
      // combination browsers permit to start on its own.
      expect(
        await video.evaluate((element: HTMLVideoElement) => element.hasAttribute("autoplay")),
        `${route.path} marks the Walkthrough autoplay.`,
      ).toBe(false);

      // Settle past load: anything that was going to start on its own has had
      // its chance by now.
      await page.waitForTimeout(1200);

      const state = await video.evaluate((element: HTMLVideoElement) => ({
        paused: element.paused,
        currentTime: element.currentTime,
      }));

      expect(
        state.paused,
        `${route.path} starts the Walkthrough without being asked, which takes the Reader's attention and their bandwidth.`,
      ).toBe(true);

      expect(
        state.currentTime,
        `${route.path} has advanced the Walkthrough before the Reader asked for it.`,
      ).toBe(0);

      // And it does play when asked — otherwise every check above passes on a
      // player that is simply broken.
      await video.evaluate(async (element: HTMLVideoElement) => {
        element.muted = true;
        await element.play();
      });

      await expect
        .poll(
          async () => video.evaluate((element: HTMLVideoElement) => element.currentTime),
          {
            message: `${route.path} does not play the Walkthrough when asked, so the site's only proof the application runs does not run.`,
          },
        )
        .toBeGreaterThan(0);
    });

    test(`${route.path} shows a poster and fetches no video until asked`, async ({
      page,
    }) => {
      const videoRequests: string[] = [];
      page.on("request", (request) => {
        if (request.resourceType() === "media" || /\.(mp4|webm|mov)$/i.test(request.url())) {
          videoRequests.push(request.url());
        }
      });

      await visitRoute(page, route.path);

      const video = walkthroughVideo(page);

      const poster = await video.getAttribute("poster");
      expect(
        poster,
        `${route.path} shows no poster before playback, so the Walkthrough is a black rectangle until a Reader guesses there is something in it.`,
      ).toBeTruthy();

      // The poster has to actually be served. A path pointing at nothing looks
      // identical to no poster at all from the markup.
      const posterResponse = await page.request.get(new URL(poster!, page.url()).toString());
      expect(
        posterResponse.status(),
        `${route.path} points its poster at ${poster}, which is not served.`,
      ).toBe(200);

      // The whole performance argument for the player rests on this: the video
      // is the largest file on the site and none of it may be fetched to render
      // a page a Reader might never press play on.
      expect(
        await video.getAttribute("preload"),
        `${route.path} lets the browser preload the Walkthrough, so its bytes are spent before a Reader asks for them.`,
      ).toBe("none");

      await page.waitForTimeout(1200);

      expect(
        videoRequests,
        `${route.path} fetched video bytes without the Reader asking:\n  ${videoRequests.join("\n  ")}`,
      ).toEqual([]);
    });

    test(`${route.path} is not the largest contentful paint element`, async ({ page }) => {
      await visitRoute(page, route.path);

      // Reading the real LCP entry rather than reasoning about it: the poster
      // is a large portrait image near the top of the page, which is exactly
      // the shape of thing that becomes LCP by accident and puts the audit
      // threshold at risk.
      const lcp = await page.evaluate(
        () =>
          new Promise<string>((resolve) => {
            const read = (): string => {
              const entries = performance.getEntriesByType("largest-contentful-paint");
              const last = entries[entries.length - 1] as
                | (PerformanceEntry & { element?: Element })
                | undefined;
              return last?.element?.tagName ?? "";
            };

            new PerformanceObserver(() => {}).observe({
              type: "largest-contentful-paint",
              buffered: true,
            });

            // LCP settles as late-arriving content paints; one frame past load
            // is where it stops moving on a page this static.
            requestAnimationFrame(() => requestAnimationFrame(() => resolve(read())));
          }),
      );

      expect(
        ["VIDEO", "IMG"],
        `${route.path} paints the Walkthrough as its largest contentful element (${lcp}), so the page's headline metric is set by a file the Reader may never play.`,
      ).not.toContain(lcp);
    });

    test(`${route.path} conveys the Walkthrough without audio`, async ({ page }) => {
      await visitRoute(page, route.path);

      const video = walkthroughVideo(page);

      // The recording is silent, so a Reader who cannot see it gets nothing
      // from the file itself. Two things have to carry it instead.
      const track = video.locator("track[kind='captions']");
      await expect(
        track,
        `${route.path} offers no captions, so a silent recording is the whole of what a Reader who cannot see it receives.`,
      ).toHaveCount(1);

      const src = await track.getAttribute("src");
      const captionResponse = await page.request.get(new URL(src!, page.url()).toString());
      expect(
        captionResponse.status(),
        `${route.path} points its caption track at ${src}, which is not served.`,
      ).toBe(200);
      expect(
        (await captionResponse.text()).startsWith("WEBVTT"),
        `${route.path} serves a caption track that is not WebVTT, so no browser will show it.`,
      ).toBe(true);

      // A textual description beside the player, for a Reader who will not
      // play a video at all — which on a page read at work is many of them.
      const description = page.locator(
        "section[aria-labelledby='walkthrough'] figcaption",
      );
      expect(
        (await description.innerText()).trim().length,
        `${route.path} shows the Walkthrough with no description beside it, so its content is unavailable to a Reader who does not press play.`,
      ).toBeGreaterThan(80);
    });

    test(`${route.path} gives the player visible controls`, async ({ page }) => {
      await visitRoute(page, route.path);

      // `controls` is what makes the player keyboard-operable and screen-reader
      // labelled without a line of script. tests/keyboard.spec.ts already tabs
      // to `video[controls]` and demands a visible focus ring; a custom player
      // would have to re-earn all of that.
      expect(
        await walkthroughVideo(page).evaluate((element: HTMLVideoElement) =>
          element.hasAttribute("controls"),
        ),
        `${route.path} renders the Walkthrough without controls, so a Reader has no way to play, pause or seek it.`,
      ).toBe(true);
    });
  }
});

test.describe("figures", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} attaches every caption to its figure`, async ({ page }) => {
      await visitRoute(page, route.path);

      // A Deep Dive carries a figure in the placeholder prose precisely so
      // this is not a vacuous check: the ticket asks that a captioned figure
      // can be placed inside a Deep Dive, and an assertion that passed because
      // the page had no figures at all would not have shown that.
      const inDeepDive = deepDives(page).locator("figure");

      expect(
        await inDeepDive.count(),
        `${route.path} has no figure inside a Deep Dive, so the placement the Case Study needs is untested.`,
      ).toBeGreaterThan(0);

      // A caption has to be a `figcaption` inside its `figure`, because that
      // element pair is what associates the two for a screen reader.
      // Positioning alone does not.
      for (const figure of await page.locator("figure").all()) {
        await expect(
          figure.locator("figcaption"),
          `A figure on ${route.path} has no caption attached to it, so a screen-reader Reader meets an image with nothing explaining it.`,
        ).toHaveCount(1);

        expect(
          (await figure.locator("figcaption").innerText()).trim(),
          `A figure on ${route.path} has an empty caption.`,
        ).not.toBe("");
      }

      await expect(
        page.locator("figcaption:not(figure > figcaption)"),
        `${route.path} has a caption that sits outside a figure, so it is unattached small text rather than a caption.`,
      ).toHaveCount(0);
    });
  }
});

test.describe("the document outline", () => {
  for (const route of CASE_STUDIES) {
    test(`${route.path} has an unbroken heading order`, async ({ page }) => {
      await visitRoute(page, route.path);

      const levels = await headingLevels(page);

      expect(
        levels[0],
        `${route.path} does not open with its level-1 heading.`,
      ).toBe(1);

      expect(
        levels.filter((level) => level === 1).length,
        `${route.path} has more than one level-1 heading, so a screen-reader Reader cannot tell what the page is about.`,
      ).toBe(1);

      // A jump — h2 straight to h4 — reads to a screen-reader Reader as a
      // missing section. This is the check that stops an MDX document being
      // allowed to write its own headings.
      levels.forEach((level, index) => {
        if (index === 0) return;
        expect(
          level - levels[index - 1],
          `${route.path} jumps from h${levels[index - 1]} to h${level}, skipping a level and leaving a hole in the outline a screen-reader Reader navigates by.`,
        ).toBeLessThanOrEqual(1);
      });
    });
  }
});

test.describe("prose resolves per locale", () => {
  test("the Case Study is written in each language, not once", async ({ page }) => {
    const read = async (path: string): Promise<string> => {
      await visitRoute(page, path);
      return (await page.locator("main").innerText()).trim();
    };

    const english = await read("/bikecheck");
    const czech = await read("/cs/bikecheck");

    expect(
      czech,
      "The Czech Case Study is identical to the English one, so its prose was written once rather than per locale.",
    ).not.toBe(english);

    // Both are substantial: a locale that resolved to an empty document would
    // otherwise pass the check above simply by differing.
    for (const [path, text] of [
      ["/bikecheck", english],
      ["/cs/bikecheck", czech],
    ] as const) {
      expect(
        text.length,
        `The Case Study at ${path} is too short to be the most important writing on the site — a prose document probably failed to render.`,
      ).toBeGreaterThan(1000);
    }
  });
});
