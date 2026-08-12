import { walkthroughFor, type Walkthrough } from "@/app/_content/walkthrough";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";

/**
 * The Walkthrough player: the component that carries the site's proof.
 *
 * With no live demo and no store listing, this is the only evidence a Reader
 * has that BikeCheck actually runs. So it has to work perfectly — and cost
 * nothing, because a Case Study that fails its performance budget to show a
 * video undermines the argument the video was there to make.
 *
 * ## It is a plain `<video controls>`, and that is the design
 *
 * No custom controls, no player library, no client component. A native player
 * is already keyboard-operable, already labelled for a screen reader, already
 * offers fullscreen, playback rate and — where the platform has them — captions
 * and picture-in-picture. Every one of those would have to be rebuilt, and
 * `tests/keyboard.spec.ts` would hold the rebuild to the same bar the native
 * element clears for free.
 *
 * The cost argument is the same one `copy-email.tsx` makes: one `"use client"`
 * module makes Next.js hydrate the whole page, which measured at ~574 KB of
 * framework runtime. There are no client components in `app/`, and a video
 * element that needs none is not the place to start.
 *
 * ## What keeps it off the performance budget
 *
 * - **`preload="none"`** — not a byte of the video is fetched until the Reader
 *   presses play. It is the largest file on the site and most Readers will
 *   never play it; downloading it to render the page would be the single
 *   biggest regression available here.
 * - **`poster`** — a still, so the player is not a black rectangle at rest, and
 *   so the space is filled by an image measured in kilobytes.
 * - **Explicit `width`/`height`** — the box is reserved before the poster
 *   arrives, so nothing below it moves. `tests/design-system.spec.ts` asserts
 *   the page records zero layout shift.
 * - **A height cap, in the token layer** — the recording is a portrait phone
 *   screen. Rendered at the measure's full width it would stand taller than the
 *   viewport, become the largest thing painted, and push the Case Study out of
 *   sight. Capping its height is what keeps it off the LCP entry that
 *   `tests/case-study.spec.ts` reads.
 *
 * ## It never autoplays
 *
 * There is no `autoplay` attribute and no script that could call `play()`.
 * Sound-free autoplay would still spend a Reader's bandwidth and move something
 * on a page they are reading, and both are worse than the click it saves.
 *
 * ## It carries no audio, so it says everything twice
 *
 * The recording is silent. A caption track carries what is on screen for a
 * Reader who plays it without watching closely, and the description below the
 * player carries the same content for a Reader who will not play a video at
 * all — which, on a page often read at work, is many of them. The description
 * is a `figcaption` attached to the player's `figure`, so a screen reader meets
 * the two as one thing rather than as a video followed by unrelated small text.
 */
export function WalkthroughPlayer({
  locale,
  walkthrough,
}: {
  locale: Locale;
  walkthrough: Walkthrough;
}) {
  const strings = dictionaries[locale].caseStudy;
  const { captions, description } = walkthroughFor(walkthrough, locale);

  return (
    <figure className="max-w-measure">
      {/* `width`/`height` are the recording's own pixels: they give the box its
          aspect ratio so the space is reserved before the poster arrives. The
          `walkthrough` utility is what caps how tall it may actually get. */}
      <video
        controls
        preload="none"
        poster={walkthrough.poster}
        width={walkthrough.width}
        height={walkthrough.height}
        // Named for a screen reader, which otherwise meets a group of media
        // controls with nothing saying what they play. The name is the one the
        // section is titled with, so the two agree.
        aria-label={strings.walkthrough}
        className="walkthrough"
      >
        <source src={walkthrough.src} type="video/mp4" />

        {/* `default` so a browser that honours it shows captions without the
            Reader hunting through a menu for them. The recording is silent —
            captions are the content, not an accommodation bolted on. */}
        <track
          kind="captions"
          src={captions}
          srcLang={locale}
          label={strings.walkthroughCaptions}
          default
        />
      </video>

      <figcaption className="mt-4 text-small text-muted">{description}</figcaption>
    </figure>
  );
}
