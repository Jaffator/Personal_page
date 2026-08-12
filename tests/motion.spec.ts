import { expect, test, type Page } from "@playwright/test";
import { routes } from "./routes";
import { visitRoute } from "./visit";

/**
 * The motion layer, asserted through the built site like everything else.
 *
 * The checks here are deliberately about consequences rather than about
 * mechanism. Nothing below names an animation, a keyframe or a class: a later
 * ticket may re-tune every duration and swap how the reveal is driven, and this
 * file should still be the thing that says whether the result is acceptable.
 *
 * The one that matters most is the reduced-motion pass. Scroll-reveal is
 * ordinarily implemented by hiding an element and letting the animation bring
 * it back — which, under a preference that suppresses animation, hides the
 * content permanently from the Readers who asked for less movement. That failure
 * is invisible in review, because the reviewer is not the person who set the
 * preference. So it is asserted here, on every route, for real text.
 */

/** How far down the page the reveal checks scroll before reading. */
const SCROLL_STEPS = 6;

/**
 * Elements a Reader reads. The reveal is applied to blocks, so this is what
 * "the content is visible" has to be true of, and it is read from the built
 * page rather than listed by hand so a section added later is covered too.
 */
const CONTENT_SELECTOR = "main h1, main h2, main h3, main p, main li";

type Invisible = {
  text: string;
  opacity: string;
  visibility: string;
  clipped: boolean;
};

/**
 * Reads every content element the browser is not actually showing.
 *
 * Zero opacity, `visibility: hidden` and a collapsed box are three different
 * ways for the reveal to leave text on the page but unreadable, and all three
 * would pass a check that only asked whether the element existed.
 */
function readInvisibleContent(selector: string): Invisible[] {
  return Array.from(document.querySelectorAll(selector))
    .filter((element) => (element.textContent ?? "").trim().length > 0)
    .map((element) => {
      const computed = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        text: (element.textContent ?? "").trim().slice(0, 80),
        opacity: computed.opacity,
        visibility: computed.visibility,
        clipped: box.width === 0 || box.height === 0,
      };
    })
    .filter(
      (entry) =>
        Number(entry.opacity) < 0.99 ||
        entry.visibility === "hidden" ||
        entry.clipped,
    );
}

/** Scrolls the whole page in steps, letting any scroll-driven effect run. */
async function scrollThrough(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let step = 1; step <= SCROLL_STEPS; step += 1) {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" as ScrollBehavior }),
      (height / SCROLL_STEPS) * step,
    );
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
}

test.describe("reduced motion", () => {
  for (const { path } of routes) {
    /**
     * The hard constraint from the ticket. Under a reduced-motion preference
     * every piece of content must be present and visible — without the Reader
     * scrolling, and without any animation having run to reveal it.
     */
    test(`${path} shows all of its content with reduced motion set`, async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      try {
        const page = await context.newPage();
        await visitRoute(page, path);
        await page.evaluate(() => document.fonts.ready);

        const hidden = await page.evaluate(readInvisibleContent, CONTENT_SELECTOR);

        expect(
          hidden,
          `${path} hides content under a reduced-motion preference. The reveal is making the content visible rather than merely animating content that is already visible:\n${hidden
            .map((entry) => `  "${entry.text}" opacity=${entry.opacity} visibility=${entry.visibility} collapsed=${entry.clipped}`)
            .join("\n")}`,
        ).toEqual([]);
      } finally {
        await context.close();
      }
    });

    /**
     * "All motion is suppressed" — asserted by asking the browser what is
     * actually running, rather than by reading the stylesheet. An animation
     * left running with a near-zero duration still counts as suppressed; one
     * still playing for a perceptible time does not.
     */
    test(`${path} runs no perceptible animation with reduced motion set`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      try {
        const page = await context.newPage();
        await visitRoute(page, path);
        await scrollThrough(page);

        const running = await page.evaluate(() =>
          document
            .getAnimations()
            .filter((animation) => {
              const timing = animation.effect?.getComputedTiming();
              const duration = Number(timing?.duration ?? 0);
              const delay = Number(timing?.delay ?? 0);
              return animation.playState === "running" && duration + delay > 20;
            })
            .map((animation) => {
              const target = animation.effect as KeyframeEffect | null;
              return {
                name: (animation as Animation & { animationName?: string }).animationName ?? "",
                target: target?.target?.outerHTML.slice(0, 100) ?? "unknown",
                duration: String(target?.getComputedTiming().duration ?? ""),
              };
            }),
        );

        expect(
          running,
          `${path} is still animating under a reduced-motion preference:\n${running
            .map((entry) => `  ${entry.name} (${entry.duration}ms) on ${entry.target}`)
            .join("\n")}`,
        ).toEqual([]);
      } finally {
        await context.close();
      }
    });
  }
});

test.describe("motion baseline", () => {
  for (const { path } of routes) {
    /**
     * The counterpart to the reduced-motion pass: with motion allowed, the
     * content must also all end up visible. A reveal that never fires — an
     * observer that missed an element, a threshold nothing crosses — leaves
     * text permanently at zero opacity, and that is the failure this catches.
     */
    test(`${path} shows all of its content once scrolled`, async ({ page }) => {
      await visitRoute(page, path);
      await page.evaluate(() => document.fonts.ready);
      await scrollThrough(page);
      await page.waitForTimeout(600);

      const hidden = await page.evaluate(readInvisibleContent, CONTENT_SELECTOR);

      expect(
        hidden,
        `${path} left content invisible after the page was scrolled through. A reveal that never fires is worse than no reveal:\n${hidden
          .map((entry) => `  "${entry.text}" opacity=${entry.opacity} visibility=${entry.visibility} collapsed=${entry.clipped}`)
          .join("\n")}`,
      ).toEqual([]);
    });

    /**
     * Motion must not cause layout shift. `design-system.spec.ts` already
     * asserts this for the load; this is the same measurement taken while the
     * Reader scrolls, which is when a reveal animating a layout property —
     * height, margin, `top` — actually does its damage.
     */
    test(`${path} does not shift its layout while scrolling`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { __motionShift: number }).__motionShift = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput) {
              (window as unknown as { __motionShift: number }).__motionShift += entry.value;
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      await visitRoute(page, path);
      await page.evaluate(() => document.fonts.ready);
      await scrollThrough(page);
      await page.waitForTimeout(300);

      const shift = await page.evaluate(
        () => (window as unknown as { __motionShift: number }).__motionShift,
      );

      expect(
        shift,
        `${path} shifted its layout by ${shift} while scrolling. Motion must animate transform and opacity only — animating a layout property is what makes a fast page feel slow.`,
      ).toBe(0);
    });

    /**
     * Whatever drives the motion, it must be compositor-friendly. Animating
     * anything but transform, opacity and filter forces layout or paint on
     * every frame, which is the difference between motion that reads as
     * crafted and motion that reads as jank.
     */
    test(`${path} animates only compositable properties`, async ({ page }) => {
      await visitRoute(page, path);
      await scrollThrough(page);

      const offending = await page.evaluate(() => {
        const allowed = new Set([
          "transform",
          "opacity",
          "filter",
          "translate",
          "scale",
          "rotate",
          "offset",
        ]);
        const properties = new Set<string>();
        for (const animation of document.getAnimations()) {
          const effect = animation.effect;
          if (!(effect instanceof KeyframeEffect)) continue;
          for (const frame of effect.getKeyframes()) {
            for (const key of Object.keys(frame)) {
              if (["offset", "composite", "computedOffset", "easing"].includes(key)) continue;
              properties.add(key);
            }
          }
        }
        return Array.from(properties).filter((property) => !allowed.has(property));
      });

      expect(
        offending,
        `${path} animates properties that cannot be composited: ${offending.join(", ")}. Use transform and opacity.`,
      ).toEqual([]);
    });
  }
});

test.describe("text stays legible while it moves", () => {
  for (const { path } of routes) {
    /**
     * No animation may fade text.
     *
     * This is the constraint the first cut of the motion layer got wrong. A
     * reveal that rises *and* fades looks right in isolation, but any opacity
     * below 1 lowers the text's contrast against the page, and `text-muted`
     * has too little headroom over the AA threshold to give any away — so
     * while the animation ran, the page was failing the contrast bar. The
     * site's axe scan caught it because it happens to run mid-animation,
     * which is luck rather than coverage. This asserts it directly.
     *
     * Opacity on an element carrying no text is fine, and the drawn rule is
     * exactly that case: it fades out a `::before` that renders a hairline and
     * nothing else. Pseudo-elements are therefore skipped — and they have to be
     * skipped explicitly, because the Web Animations API reports a
     * pseudo-element's `target` as the element it hangs off, whose
     * `textContent` is the heading. Reading that as "this animation fades the
     * heading" is wrong, and was this check's first bug.
     */
    test(`${path} never animates the opacity of text`, async ({ page }) => {
      await visitRoute(page, path);
      await scrollThrough(page);

      const fading = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => {
            const effect = animation.effect;
            if (!(effect instanceof KeyframeEffect) || !effect.target) return false;
            // A pseudo-element renders its own content, never the host's text.
            if (effect.pseudoElement) return false;
            const fadesOpacity = effect
              .getKeyframes()
              .some((frame) => "opacity" in frame && Number(frame.opacity) < 1);
            const carriesText = (effect.target.textContent ?? "").trim().length > 0;
            return fadesOpacity && carriesText;
          })
          .map((animation) => {
            const target = (animation.effect as KeyframeEffect).target as Element;
            return `${target.tagName.toLowerCase()}.${target.className} — "${(target.textContent ?? "").trim().slice(0, 50)}"`;
          }),
      );

      expect(
        fading,
        `${path} animates the opacity of elements containing text:\n${fading.map((entry) => `  ${entry}`).join("\n")}\nText below full opacity is text below its contrast ratio. Let the movement carry the reveal.`,
      ).toEqual([]);
    });
  }
});

test.describe("no animation library", () => {
  /**
   * The ticket allows a library only if a specific moment genuinely required
   * one. Nothing here did, so this asserts the outcome: the built pages ship
   * no animation runtime. It reads the served HTML and the scripts it pulls,
   * because a library that arrived as a dependency of something else is still
   * a library the Reader downloads.
   */
  test("the built site ships no animation runtime", async ({ page, baseURL }) => {
    const scriptBodies: string[] = [];

    page.on("response", async (response) => {
      if (!/\.js(\?|$)/.test(new URL(response.url()).pathname)) return;
      try {
        scriptBodies.push(await response.text());
      } catch {
        // A response that cannot be read cannot be searched; the HTML check
        // below is what actually has to hold.
      }
    });

    await visitRoute(page, "/");
    await scrollThrough(page);

    const html = await (await page.request.get(new URL("/", baseURL).toString())).text();
    const haystack = [html, ...scriptBodies].join("\n").toLowerCase();

    const libraries = [
      "framer-motion",
      "motion-dom",
      "gsap",
      "greensock",
      "animejs",
      "anime.js",
      "@react-spring",
      "react-spring",
      "auto-animate",
      "lottie",
      "aos.js",
      "scrollreveal",
      "velocity.js",
    ].filter((name) => haystack.includes(name));

    expect(
      libraries,
      `The built site ships an animation library: ${libraries.join(", ")}. The motion layer is CSS; a library is only warranted if a specific moment cannot be expressed without one.`,
    ).toEqual([]);
  });
});
