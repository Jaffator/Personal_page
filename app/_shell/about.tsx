import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";
import { SectionHeading } from "./section-heading";

/**
 * The self-taught story, told as fact.
 *
 * The framing is the whole of this section's design. It names what was actually
 * built while learning and stops — no apology, no "only", no "despite having no
 * commercial experience", and no level label. A Reader who has read the Case
 * Study above has already formed a view of the level; an apology here would
 * overwrite it with a worse one, and one that the work does not support.
 *
 * It carries the site's single line about AI tooling. Once, here, and nowhere
 * else: said twice it reads as a defence, and said as a feature it reads as a
 * selling point, and both undercut the honest version. What it claims is the
 * part a Reader is actually weighing — that he can explain the decisions and
 * defend the trade-offs, whatever helped him reach them. That line sits last,
 * after the evidence, so it is read as a footnote to the work rather than as
 * the thing the work rests on.
 *
 * The prose is interface rather than MDX by the test in docs/content.md: it is
 * about the author, not about a Project, so it would still be here with no
 * Projects at all. MDX on this site is reserved for Case Study prose (ADR 0002).
 */

const HEADING_ID = "about";

export function About({ locale }: { locale: Locale }) {
  const strings = dictionaries[locale].about;

  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID} index={strings.index}>
        {strings.heading}
      </SectionHeading>

      {/* Held to the measure: this is the longest stretch of running prose on
          the home page, and it is the one that has to actually be read. */}
      <div className="mt-10 max-w-measure">
        <p className="text-lede text-ink">{strings.story}</p>
        <p className="mt-6 text-body text-muted">{strings.practice}</p>
        <p className="mt-6 text-body text-muted">{strings.tooling}</p>
      </div>
    </section>
  );
}
