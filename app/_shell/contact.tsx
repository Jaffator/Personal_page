import { CITY, CV, EMAIL, profiles } from "@/app/_content/profile";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";
import { CopyEmail } from "./copy-email";
import { SectionHeading } from "./section-heading";

/**
 * How to reach the author, and the last thing a Reader sees.
 *
 * There is no contact form, and that is a decision rather than a gap. The site
 * is statically exported and has no backend (ADR 0001), so a form would either
 * post nowhere or post to a third-party service — and a form that silently
 * swallows a message during a job search is the worst failure this site could
 * have. The email is shown as text a Reader can read, copy, or hand to their
 * own mail client, all three of which work without anything of ours running.
 *
 * The address appears once, as one constant, used by the visible text, the
 * `mailto:` link and the copy control alike. Written out three times it would
 * be three chances to ship a typo in the one string on the site that has to be
 * exactly right.
 *
 * The city and the work preference are stated rather than left to be asked,
 * because a Reader is placing him against a role with a location on it, and an
 * unanswered question at that point is a reason to move on to the next
 * candidate.
 */

const HEADING_ID = "contact";

export function Contact({ locale }: { locale: Locale }) {
  const strings = dictionaries[locale].contact;

  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID} index={strings.index}>
        {strings.heading}
      </SectionHeading>

      <p className="mt-10 max-w-measure text-lede text-ink">{strings.lede}</p>

      {/* The address, as text and as a link. Both are server-rendered, so the
          section works whole with no JavaScript at all — the copy control
          beside it is the only part that needs any, and it is the only part
          that can be done without. */}
      <div className="mt-8">
        <p className="font-mono text-meta text-muted uppercase">{strings.emailLabel}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <a className="link link-sweep text-lede" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <CopyEmail locale={locale} />
        </div>
      </div>

      <div className="mt-8">
        <p className="font-mono text-meta text-muted uppercase">{strings.locationLabel}</p>
        <p className="mt-2 text-body text-ink">
          {CITY} — {strings.availability}
        </p>
      </div>

      {/* The profiles and the CV, as one list: they are the same kind of thing
          to a Reader, which is somewhere else to go and look. `rel="noreferrer"`
          matches the Proof Links; the CV is same-origin and is a download
          rather than a destination, so it carries `download` instead. */}
      <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-small">
        {profiles.map((profile) => (
          <li key={profile.key}>
            <a className="link link-sweep" href={profile.href} rel="noreferrer">
              {strings.profiles[profile.key]}
            </a>
          </li>
        ))}
        <li>
          <a className="link link-sweep" href={CV.href} download={CV.download}>
            {strings.cv}
          </a>
        </li>
      </ul>
    </section>
  );
}
