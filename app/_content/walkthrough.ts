import type { Locale } from "@/app/_locale/routes";
import type { Localised } from "./localised";

/**
 * The Walkthrough recording: which files it is made of, and what it shows.
 *
 * This is content rather than interface by the test in docs/content.md — every
 * field describes one Project's recording, so it would not exist with no
 * Projects at all. It is a separate module from `projects.ts` because a
 * Project's Case Study may exist before its recording does, and because the
 * shape here is about a media file rather than about a Project.
 *
 * ## Swapping the placeholder for the real recording
 *
 * The paths below are the whole interface between ticket 13 and this component.
 * Overwriting the four files in `public/walkthrough/` with the real recording,
 * its poster and its captions changes nothing here and nothing in a component —
 * which is the guarantee ticket 08 makes. What does need updating when the real
 * recording lands is `width`/`height`, if its frame differs, and `description`,
 * which is written for the placeholder today.
 *
 * ## Why the source is not localised
 *
 * The recording is silent (see CONTEXT.md), so one file serves both languages.
 * Only what is written *about* it — the captions and the description — differs
 * per locale, which is why those two are `Localised` and the video is not.
 */
export type Walkthrough = {
  /** The video file. One recording, both locales, because it carries no audio. */
  src: string;
  /**
   * The still shown before playback. Required: without it the player is a black
   * rectangle, and a Reader has no reason to think anything is in it.
   */
  poster: string;
  /** The caption track, per locale. A silent recording still has to say what it shows. */
  captions: Localised<string>;
  /**
   * The recording's frame, in pixels. Declared so the player can reserve the
   * right space before the poster loads — an unsized video is a layout shift on
   * the site's most important page, and `tests/design-system.spec.ts` measures
   * exactly that.
   */
  width: number;
  height: number;
  /**
   * What the recording shows, in prose, beside the player.
   *
   * Not a caption and not alt text: it is for the Reader who will not play a
   * video at all — reading at work, on a metered connection, or simply
   * unwilling — and who would otherwise take nothing from the part of the Case
   * Study carrying its proof.
   */
  description: Localised<string>;
};

/**
 * BikeCheck's Walkthrough.
 *
 * **The recording is a placeholder.** `scripts/build-walkthrough-placeholder.mjs`
 * generates a holding frame that plays, so the player, its poster, its captions
 * and its byte budget are real and under test from the day it ships. The real
 * recording is ticket 13 and gates launch — see the description below, which is
 * written to be true of the placeholder rather than to describe a recording that
 * does not exist yet.
 */
export const bikecheckWalkthrough: Walkthrough = {
  src: "/walkthrough/bikecheck.mp4",
  poster: "/walkthrough/bikecheck.png",
  captions: {
    en: "/walkthrough/bikecheck.en.vtt",
    cs: "/walkthrough/bikecheck.cs.vtt",
  },
  width: 720,
  height: 1280,
  description: {
    en: "This is a placeholder rather than the recording. The finished Walkthrough runs about ninety seconds and follows one real task end to end: signing in, adding a bicycle, logging a ride, and watching component wear change as a result. It is silent, so everything it shows is also written here and in its captions.",
    cs: "Zatím jde o zástupný soubor, ne o samotný záznam. Hotový průchod trvá zhruba devadesát sekund a sleduje jednu skutečnou úlohu od začátku do konce: přihlášení, přidání kola, zapsání jízdy a změnu opotřebení komponent, která z toho plyne. Je bez zvuku, takže všechno, co ukazuje, je popsáno i zde a v titulcích.",
  },
};

/** The caption track and description for one locale. Components resolve, they never pick a language. */
export function walkthroughFor(
  walkthrough: Walkthrough,
  locale: Locale,
): { captions: string; description: string } {
  return {
    captions: walkthrough.captions[locale],
    description: walkthrough.description[locale],
  };
}
