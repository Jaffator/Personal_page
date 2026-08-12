import { resolvedProofLinks, type Project } from "@/app/_content/projects";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";

/**
 * A Project's Proof Links — the outbound links that let a Reader verify it
 * exists independently of this site's own claims.
 *
 * It renders only the links that point somewhere. A modelled-but-absent one —
 * BikeCheck's Google Play listing, until it is published — renders nothing at
 * all: not an empty slot, not a disabled control and not a "coming soon", each
 * of which would be a claim the site cannot support. Publishing is therefore an
 * `href` added in `app/_content/projects.ts` and no change here.
 *
 * It lives in one component because the hero and Selected Work both show the
 * same Proof Links, and that guarantee has to hold in both places or it does
 * not hold at all. A second inline copy is how one of them ends up rendering an
 * empty Google Play slot on the day the other stops.
 *
 * The link text names what a Reader will find rather than where it sits, so it
 * is clear from the link alone to someone listing the page's links. The `note`
 * follows it as ordinary text — it qualifies the link for every Reader, so it
 * is not hidden behind an attribute only some of them get.
 */
export function ProofLinks({
  project,
  locale,
  spacing,
}: {
  project: Project;
  locale: Locale;
  /**
   * How far the list sits from what precedes it — the one thing that differs
   * between the hero and Selected Work. The list's own treatment is set here
   * rather than by the caller, so the two cannot drift apart.
   */
  spacing: string;
}) {
  const strings = dictionaries[locale];
  const links = resolvedProofLinks(project);

  // No resolved link means no list at all, rather than an empty `ul` that a
  // screen reader announces as a list of zero items.
  if (links.length === 0) return null;

  return (
    <ul className={`${spacing} flex flex-wrap gap-x-6 gap-y-2 text-small`}>
      {links.map((link) => (
        <li key={link.kind}>
          <a className="link link-sweep" href={link.href} rel="noreferrer">
            {strings.proofLinks[link.kind]}
          </a>
          {link.note ? <span className="text-muted"> — {link.note[locale]}</span> : null}
        </li>
      ))}
    </ul>
  );
}
