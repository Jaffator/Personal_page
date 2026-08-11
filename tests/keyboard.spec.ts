import { expect, test } from "@playwright/test";
import { routes } from "./routes";
import { visitRoute } from "./visit";

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "video[controls]",
  "audio[controls]",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Properties that can carry a focus indicator a Reader would actually see.
 * Text colour is deliberately absent: a focus state signalled by colour alone
 * is not an indicator, so it must not be able to satisfy this check.
 */
type FocusStyle = {
  outline: string;
  boxShadow: string;
  backgroundColor: string;
  border: string;
  textDecoration: string;
};

type TabStop = {
  index: number | null;
  label: string;
  style: FocusStyle;
};

declare global {
  interface Window {
    __readFocusStyle(element: Element): FocusStyle;
  }
}

/**
 * Installed in the page so the resting and focused snapshots are produced by
 * identical code. An outline that is `none` or zero-width is normalised away,
 * so a change to `outline-color` alone cannot masquerade as a visible ring.
 */
const READ_FOCUS_STYLE_SCRIPT = `
  window.__readFocusStyle = (element) => {
    const computed = getComputedStyle(element);
    const outlineVisible =
      computed.outlineStyle !== "none" && parseFloat(computed.outlineWidth) > 0;
    return {
      outline: outlineVisible
        ? [computed.outlineStyle, computed.outlineWidth, computed.outlineColor, computed.outlineOffset].join(" ")
        : "none",
      boxShadow: computed.boxShadow,
      backgroundColor: computed.backgroundColor,
      border: [computed.borderStyle, computed.borderWidth, computed.borderColor].join(" "),
      textDecoration: [computed.textDecorationLine, computed.textDecorationColor].join(" "),
    };
  };
`;

function hasVisibleFocusIndicator(resting: FocusStyle, focused: FocusStyle): boolean {
  return (Object.keys(focused) as (keyof FocusStyle)[]).some(
    (property) => resting[property] !== focused[property],
  );
}

for (const route of routes) {
  test(`${route} is fully keyboard operable`, async ({ page }) => {
    await page.addInitScript({ content: READ_FOCUS_STYLE_SCRIPT });
    await visitRoute(page, route);

    // Index the interactive elements in DOM order so focus order can be
    // compared against it, and capture how each looks while unfocused.
    const resting = await page.evaluate((selector) => {
      return Array.from(document.querySelectorAll(selector)).map((element, index) => {
        element.setAttribute("data-kbd-index", String(index));
        return {
          label: element.outerHTML.slice(0, 120),
          style: window.__readFocusStyle(element),
        };
      });
    }, INTERACTIVE_SELECTOR);

    expect(
      resting.length,
      `${route} has no interactive elements, so keyboard operability cannot be asserted. Either the page is broken or the selector needs updating.`,
    ).toBeGreaterThan(0);

    const stops: TabStop[] = [];
    for (let step = 0; step < resting.length; step += 1) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate(() => {
        const element = document.activeElement;
        if (!element || element === document.body) return null;
        const index = element.getAttribute("data-kbd-index");
        return {
          index: index === null ? null : Number(index),
          label: element.outerHTML.slice(0, 120),
          style: window.__readFocusStyle(element),
        };
      });

      expect(
        stop,
        `Tab press ${step + 1} on ${route} landed outside the document, so ${resting.length - step} interactive element(s) are unreachable.`,
      ).not.toBeNull();
      stops.push(stop!);
    }

    // Tab order matches DOM order, and every element is visited exactly once.
    expect(
      stops.map((stop) => stop.index),
      `Tab order on ${route} does not match DOM order.\nVisited:\n${stops.map((stop) => `  ${stop.index}: ${stop.label}`).join("\n")}`,
    ).toEqual(resting.map((_, index) => index));

    for (const stop of stops) {
      const restingStyle = resting[stop.index!].style;
      expect(
        hasVisibleFocusIndicator(restingStyle, stop.style),
        `No visible focus indicator on ${route} for ${stop.label}\n  resting: ${JSON.stringify(restingStyle)}\n  focused: ${JSON.stringify(stop.style)}`,
      ).toBe(true);
    }
  });
}
