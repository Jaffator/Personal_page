import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  CITY,
  CV_DOWNLOAD_NAME,
  CV_PATH,
  EMAIL,
  FORM_SERVICE_HOSTS,
  GITHUB_PROFILE,
  LINKEDIN_PROFILE,
} from "./contact";
import { equivalentOf, routes, type Route } from "./routes";
import { visitRoute } from "./visit";

/**
 * Stack, About and Contact — the rest of the home page below Selected Work,
 * asserted through the built site.
 *
 * Three of these are accuracy checks rather than structural ones, and they are
 * why this file exists rather than the sections being left to the accessibility
 * and keyboard scans. A proficiency bar, a second claim about AI tooling, and a
 * contact form posting to a service that was never wired up would each be
 * caught by the Reader this site is written for — so they are caught here
 * first. Everything else is asserted by role and by structure rather than by
 * wording, so ticket 14 can rewrite every sentence without touching this file.
 */

const HOME = routes.filter((route) => route.key === "home");

function stack(page: Page): Locator {
  return page.getByRole("region", { name: /^(stack|technologie)/i });
}

function about(page: Page): Locator {
  return page.getByRole("region", { name: /^(about|o mn)/i });
}

function contact(page: Page): Locator {
  return page.getByRole("region", { name: /^(contact|kontakt)/i });
}

/** The page's own text, as a Reader reads it — no markup, no attributes. */
async function visibleText(page: Page, path: string): Promise<string> {
  await visitRoute(page, path);
  return (await page.getByRole("main").innerText()).trim();
}

test.describe("the sections are landmarks", () => {
  for (const route of HOME) {
    for (const [name, section] of [
      ["Stack", stack],
      ["About", about],
      ["Contact", contact],
    ] as const) {
      test(`${route.path} presents ${name} as a named section`, async ({ page }) => {
        await visitRoute(page, route.path);

        await expect(
          section(page),
          `${route.path} has no ${name} section a Reader could find or a screen reader could jump to.`,
        ).toHaveCount(1);

        await expect(
          section(page).getByRole("heading"),
          `${name} on ${route.path} is a region with no heading, so it announces itself as a landmark with nothing to say.`,
        ).not.toHaveCount(0);
      });
    }
  }
});

test.describe("the Stack", () => {
  for (const route of HOME) {
    test(`${route.path} groups the Stack under named headings`, async ({ page }) => {
      await visitRoute(page, route.path);

      // Grouped rather than one flat list: a Reader matching against an open
      // role scans for a category before a name. The floor is two, because one
      // group is a flat list wearing a heading.
      const groups = stack(page).getByRole("list");

      expect(
        await groups.count(),
        `The Stack on ${route.path} is not grouped, so a Reader matching it against a role has one undifferentiated list to read.`,
      ).toBeGreaterThan(1);

      for (const group of await groups.all()) {
        expect(
          await group.getByRole("listitem").count(),
          `A Stack group on ${route.path} is empty.`,
        ).toBeGreaterThan(0);
      }
    });

    test(`${route.path} names a technology in every Stack entry`, async ({ page }) => {
      await visitRoute(page, route.path);

      const entries = stack(page).getByRole("listitem");

      expect(
        await entries.count(),
        `The Stack on ${route.path} names no technologies at all.`,
      ).toBeGreaterThan(0);

      for (const entry of await entries.all()) {
        expect(
          ((await entry.textContent()) ?? "").trim(),
          `A Stack entry on ${route.path} is empty.`,
        ).not.toBe("");
      }
    });

    /**
     * The check the ticket exists for. No bars, no stars, no percentages and no
     * year counts — a technical Reader treats "React 85%" as a red flag,
     * because the claim cannot be true. Asserted three ways, because a
     * proficiency indicator can be drawn as text, as a widget or as a bar.
     *
     * Run under both colour schemes, because the third assertion reads a
     * resolved `background-color` to recognise a bar. A bar drawn only in the
     * dark theme — the case where a token resolves to something visible against
     * a dark page and to the page colour against a light one — would otherwise
     * pass here while a Reader looked straight at it.
     */
    for (const colorScheme of ["light", "dark"] as const) {
      test(`${route.path} puts no proficiency indicator on any technology (${colorScheme})`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        await visitRoute(page, route.path);

        const text = (await stack(page).innerText()).trim();
        const rated =
          /(\b\d{1,3}\s*%|★|☆|●{2,}|\bexpert\b|\badvanced\b|\bintermediate\b|\bbeginner\b|\bproficien\w*|\bpokro[čc]il\w*|\bza[čc][áa]te[čc]n[íi]k\w*|\bpokro[čc]il[áa]\b|\b\d+\+?\s*(?:years?|yrs?|let|roky?|rok[ůu])\b)/i.exec(
            text,
          );

        expect(
          rated?.[0] ?? null,
          `The Stack on ${route.path} rates a technology ("${rated?.[0]}") in the ${colorScheme} theme. A proficiency claim cannot be true as stated, and a technical Reader reads it as a red flag.`,
        ).toBeNull();

        // A meter or progressbar is the same claim drawn as a widget.
        expect(
          (await stack(page).getByRole("meter").count()) +
            (await stack(page).getByRole("progressbar").count()),
          `The Stack on ${route.path} renders a meter or progress bar, which is a proficiency rating in another form.`,
        ).toBe(0);

        // And the same claim drawn as a bar: a nested element whose width is set
        // to a fraction of its parent is what a proficiency bar looks like once
        // the class names are gone.
        const bars = await stack(page).evaluate((root) => {
          return Array.from(root.querySelectorAll("*")).filter((element) => {
            const style = getComputedStyle(element);
            const width = Number.parseFloat(style.width);
            const parent = element.parentElement;
            if (!parent || Number.isNaN(width) || width === 0) return false;
            const parentWidth = Number.parseFloat(getComputedStyle(parent).width);
            if (Number.isNaN(parentWidth) || parentWidth === 0) return false;
            const ratio = width / parentWidth;
            const isBar =
              element.textContent?.trim() === "" &&
              Number.parseFloat(style.height) > 0 &&
              style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
              ratio > 0.05 &&
              ratio < 0.98;
            return isBar;
          }).length;
        });

        expect(
          bars,
          `The Stack on ${route.path} draws what looks like a proficiency bar in the ${colorScheme} theme — an empty filled element sized to a fraction of its track.`,
        ).toBe(0);
      });
    }
  }
});

test.describe("About", () => {
  for (const route of HOME) {
    test(`${route.path} tells the story in prose rather than in a list`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      const paragraphs = about(page).locator("p");

      expect(
        await paragraphs.count(),
        `About on ${route.path} carries no prose, so the self-taught story is not told.`,
      ).toBeGreaterThan(0);

      const text = (await about(page).innerText()).trim();
      expect(
        text.length,
        `About on ${route.path} is too short to tell a story a Reader would weigh.`,
      ).toBeGreaterThan(200);
    });

    /**
     * The framing check. The story is told as fact, not as an apology: no
     * "only", no "just", no "unfortunately I have no commercial experience".
     * The level labels are the hero's rule applied here, because About is the
     * section most likely to reintroduce one.
     */
    test(`${route.path} states the story without apologising for it`, async ({
      page,
    }) => {
      await visitRoute(page, route.path);

      const apologetic =
        /(\bonly a\b|\bjust a\b|\bunfortunately\b|\bi lack\b|\bno real experience\b|\bnot yet a real\b|\bdespite having no\b|\bbohu[žz]el\b|\bjen ob[yý]?[čc]ejn\w*|\bzat[íi]m nem[áa]m [žz][áa]dn\w*|\bchyb[íi] mi\b)/i;

      const found = (await about(page).innerText()).match(apologetic);

      expect(
        found?.[0] ?? null,
        `About on ${route.path} apologises for the author's path ("${found?.[0]}"). The story is told as fact — the work is what sets the level.`,
      ).toBeNull();
    });

    /**
     * Exactly one line about AI tooling, and it lives in About. The site says
     * this once, honestly, and never again — a second mention reads as either
     * a defence or a selling point, and both undercut the first.
     */
    test(`${route.path} mentions AI tooling exactly once, in About`, async ({
      page,
    }) => {
      const pageText = await visibleText(page, route.path);
      const aiMention = /\b(ai|umělá inteligence|umělou inteligenci|llm|copilot|claude|chatgpt)\b/gi;

      const everywhere = pageText.match(aiMention) ?? [];

      expect(
        everywhere.length,
        `${route.path} mentions AI tooling ${everywhere.length} times (${everywhere.join(", ")}). The spec allows exactly one line, in About.`,
      ).toBe(1);

      const inAbout = ((await about(page).innerText()).match(aiMention) ?? []).length;

      expect(
        inAbout,
        `The one AI tooling mention on ${route.path} is not in About, which is the only section the spec places it in.`,
      ).toBe(1);
    });
  }
});

test.describe("Contact", () => {
  for (const route of HOME) {
    test(`${route.path} shows the email as visible text`, async ({ page }) => {
      await visitRoute(page, route.path);

      const text = (await contact(page).innerText()).trim();

      // Visible text, not hidden behind a "get in touch" button: a Reader
      // writing from their own mail client needs to read the address.
      expect(
        text,
        `Contact on ${route.path} does not show the email address as text, so a Reader who does not use a mail handler cannot see where to write.`,
      ).toContain(EMAIL);
    });

    test(`${route.path} offers a one-action copy of the email`, async ({ page }) => {
      await visitRoute(page, route.path);

      const copy = contact(page).getByRole("button");

      await expect(
        copy,
        `Contact on ${route.path} offers no control to copy the email in one action.`,
      ).toHaveCount(1);

      // A control with no accessible name is a control a screen-reader Reader
      // cannot identify, however well it works with a mouse.
      const name = ((await copy.getAttribute("aria-label")) ?? (await copy.innerText())).trim();
      expect(
        name.length,
        `The copy control on ${route.path} has no accessible name.`,
      ).toBeGreaterThan(3);
    });

    test(`${route.path} copies the email by keyboard and says so`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await visitRoute(page, route.path);

      const copy = contact(page).getByRole("button");
      const before = (await contact(page).innerText()).trim();

      // Reached and fired by keyboard alone. A control that only answers a
      // mouse is not operable for a Reader who does not use one.
      await copy.focus();
      await page.keyboard.press("Enter");

      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(
        copied.trim(),
        `Pressing Enter on the copy control on ${route.path} put "${copied}" on the clipboard rather than the email address.`,
      ).toBe(EMAIL);

      // The result is announced, not merely painted: a live region is what
      // tells a screen-reader Reader the copy happened at all.
      const live = contact(page).locator("[aria-live], [role=status], [role=alert]");
      await expect(
        live,
        `Contact on ${route.path} has no live region, so a screen-reader Reader is never told whether the copy worked.`,
      ).not.toHaveCount(0);

      await expect(
        live.first(),
        `The copy on ${route.path} announced nothing, so a Reader who cannot see the button has no confirmation.`,
      ).not.toBeEmpty();

      const after = (await contact(page).innerText()).trim();
      expect(
        after,
        `Copying on ${route.path} changed nothing a Reader could perceive, so there is no confirmation it worked.`,
      ).not.toBe(before);
    });

    /**
     * The confirmation has to be readable, not merely present. It is the one
     * piece of feedback this control gives a sighted Reader, and it is rendered
     * in the muted colour — so it is checked against the page it sits on, in
     * both themes, rather than assumed to inherit a safe pair.
     */
    for (const colorScheme of ["light", "dark"] as const) {
      test(`${route.path} shows a legible copy confirmation (${colorScheme})`, async ({
        page,
        context,
      }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        await page.emulateMedia({ colorScheme });
        await visitRoute(page, route.path);

        const status = contact(page).locator("[role=status]").first();
        await contact(page).getByRole("button").click();

        await expect(
          status,
          `The copy confirmation on ${route.path} never appeared in the ${colorScheme} theme.`,
        ).not.toBeEmpty();

        // Read what the browser resolved rather than the class names, so this
        // holds through a retune of the token values.
        const contrast = await status.evaluate((node) => {
          const luminance = (colour: string): number => {
            const parts = /rgba?\(([^)]+)\)/.exec(colour);
            if (!parts) return 0;
            const [r, g, b] = parts[1].split(/[\s,/]+/).slice(0, 3).map(Number);
            const channel = (value: number): number => {
              const srgb = value / 255;
              return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          };

          // Walk up for the nearest painted background: the span itself is
          // transparent, so its own value says nothing about what it sits on.
          let element: Element | null = node;
          let background = "rgba(0, 0, 0, 0)";
          while (element) {
            const candidate = getComputedStyle(element).backgroundColor;
            if (candidate !== "rgba(0, 0, 0, 0)" && !candidate.endsWith(", 0)")) {
              background = candidate;
              break;
            }
            element = element.parentElement;
          }

          const foreground = luminance(getComputedStyle(node).color);
          const behind = luminance(background);
          const lighter = Math.max(foreground, behind);
          const darker = Math.min(foreground, behind);
          return (lighter + 0.05) / (darker + 0.05);
        });

        // 4.5:1 is the WCAG AA floor for body-sized text.
        expect(
          contrast,
          `The copy confirmation on ${route.path} resolves to ${contrast.toFixed(2)}:1 against its background in the ${colorScheme} theme, below the 4.5:1 needed to read it.`,
        ).toBeGreaterThanOrEqual(4.5);
      });
    }

    test(`${route.path} still reaches the author with no JavaScript`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      try {
        const page = await context.newPage();
        await visitRoute(page, route.path);

        // The copy control is an enhancement. The address itself, and a way to
        // open a mail client, must survive the script never running.
        expect(
          (await contact(page).innerText()).trim(),
          `Contact on ${route.path} does not show the email with JavaScript off.`,
        ).toContain(EMAIL);

        await expect(
          contact(page).locator(`a[href^="mailto:"]`),
          `Contact on ${route.path} offers no mailto link, so with the copy control inert there is no way to act on the address.`,
        ).not.toHaveCount(0);
      } finally {
        await context.close();
      }
    });

    test(`${route.path} links to GitHub and LinkedIn`, async ({ page }) => {
      await visitRoute(page, route.path);

      await expect(
        contact(page).locator(`a[href^="${GITHUB_PROFILE}"]`),
        `Contact on ${route.path} does not link to the author's GitHub profile.`,
      ).toHaveCount(1);

      // The exact profile, not merely the host: a slug tidied into something
      // readable still matches "linkedin.com" and still leads nowhere.
      await expect(
        contact(page).locator(`a[href="${LINKEDIN_PROFILE}"]`),
        `Contact on ${route.path} does not link to the author's LinkedIn profile at ${LINKEDIN_PROFILE}.`,
      ).toHaveCount(1);
    });

    test(`${route.path} names every contact link from its own text`, async ({ page }) => {
      await visitRoute(page, route.path);

      for (const link of await contact(page).getByRole("link").all()) {
        const name = ((await link.textContent()) ?? "").trim();

        expect(
          name.length,
          `A link in Contact on ${route.path} has no text of its own, so its purpose is not clear from the link alone.`,
        ).toBeGreaterThan(3);

        expect(
          /^(here|this|link|zde|odkaz|více)$/i.test(name),
          `A link in Contact on ${route.path} is named "${name}", which tells a Reader nothing about where it goes.`,
        ).toBe(false);
      }
    });

    test(`${route.path} states the city and the work preference`, async ({ page }) => {
      await visitRoute(page, route.path);

      const text = (await contact(page).innerText()).trim();

      expect(
        text,
        `Contact on ${route.path} does not say where the author is, which a Reader placing him against a role needs.`,
      ).toContain(CITY);

      expect(
        /\b(remote|hybrid|remotn|hybridn|d[áa]lky|na d[áa]lku)\b/i.test(text),
        `Contact on ${route.path} does not state openness to remote or hybrid work.`,
      ).toBe(true);
    });
  }
});

test.describe("the CV", () => {
  for (const route of HOME) {
    test(`${route.path} offers the CV as a downloadable PDF`, async ({ page }) => {
      await visitRoute(page, route.path);

      const cv = page.getByRole("main").locator(`a[href="${CV_PATH}"]`);

      await expect(
        cv,
        `${route.path} does not link to the CV at ${CV_PATH}, so a Reader cannot take one away.`,
      ).toHaveCount(1);

      // A professional filename: the file lands among every other candidate's,
      // where a generic `cv.pdf` is indistinguishable.
      const filename = (await cv.getAttribute("download")) ?? CV_PATH.slice(1);

      expect(
        CV_DOWNLOAD_NAME.test(filename),
        `The CV on ${route.path} downloads as "${filename}", which does not identify its author in a Reader's downloads folder.`,
      ).toBe(true);
    });

    test(`${route.path} serves the CV as a real PDF`, async ({ page, request }) => {
      await visitRoute(page, route.path);

      const response = await request.get(CV_PATH);

      expect(
        response.status(),
        `${CV_PATH} is linked from ${route.path} but the build does not serve it — the link is dead.`,
      ).toBe(200);

      // The first bytes of a PDF, so an HTML error page renamed `.pdf` fails
      // here rather than in front of a Reader.
      const body = await response.body();
      expect(
        body.subarray(0, 5).toString("latin1"),
        `${CV_PATH} is served but is not a PDF, so a Reader downloads a file that will not open.`,
      ).toBe("%PDF-");

      expect(
        body.byteLength,
        `${CV_PATH} is an empty PDF.`,
      ).toBeGreaterThan(1000);
    });
  }
});

test.describe("no contact form", () => {
  for (const route of HOME) {
    /**
     * The spec forbids a form outright. There is no backend, so a form would
     * either post nowhere or post to a third-party service — and one that
     * silently swallows a message during a job search is a catastrophic
     * failure. The check is that neither exists.
     */
    test(`${route.path} has no contact form`, async ({ page }) => {
      await visitRoute(page, route.path);

      await expect(
        page.getByRole("main").locator("form, input:not([type=hidden]), textarea"),
        `${route.path} renders a contact form. The site has no backend, so a message left in it goes nowhere.`,
      ).toHaveCount(0);
    });

    test(`${route.path} reaches no third-party form service`, async ({ page }) => {
      const requested: string[] = [];
      page.on("request", (request) => requested.push(request.url()));

      await visitRoute(page, route.path);

      const offending = requested.filter((url) =>
        FORM_SERVICE_HOSTS.some((host) => url.includes(host)),
      );

      expect(
        offending,
        `${route.path} requests a third-party form service:\n${offending.join("\n")}`,
      ).toEqual([]);

      const html = await (await page.request.get(route.path)).text();
      const embedded = FORM_SERVICE_HOSTS.filter((host) => html.includes(host));

      expect(
        embedded,
        `${route.path} embeds a reference to a third-party form service: ${embedded.join(", ")}`,
      ).toEqual([]);
    });
  }
});

test.describe("the sections resolve per locale", () => {
  for (const route of HOME.filter((candidate) => candidate.locale === "en")) {
    const equivalent: Route = equivalentOf(route, "cs");

    for (const [name, section] of [
      ["Stack", stack],
      ["About", about],
      ["Contact", contact],
    ] as const) {
      test(`${equivalent.path} states ${name} in Czech`, async ({ page }) => {
        const read = async (path: string): Promise<string> => {
          await visitRoute(page, path);
          return (await section(page).innerText()).trim();
        };

        const english = await read(route.path);
        const czech = await read(equivalent.path);

        expect(
          czech,
          `${name} on ${equivalent.path} is identical to ${route.path}, so its text was written once rather than per locale.`,
        ).not.toBe(english);

        expect(
          /[áčďéěíňóřšťúůýž]/i.test(czech),
          `${name} on ${equivalent.path} carries no Czech diacritics, so it is very likely still showing English text.`,
        ).toBe(true);
      });
    }
  }
});
