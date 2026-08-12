import type { ReactNode } from "react";

/**
 * Where the Walkthrough player goes.
 *
 * The player itself is ticket 08 and the recording is ticket 13, so today this
 * is empty on every Case Study. Empty means it renders **nothing at all**: no
 * placeholder box, no "video coming soon", no reserved grey rectangle. Each of
 * those would be a promise the site cannot currently keep, and a Reader who
 * came to see the Project running would read it as the thing being missing
 * rather than as the thing being unbuilt.
 *
 * It is a component rather than an inline `{walkthrough}` in the layout so that
 * ticket 08 has one named place to arrive, and so the heading that will title
 * the player is decided here — an `h2`, level with the Case Study's other
 * parts — rather than being chosen again when the player lands.
 */
export function WalkthroughSlot({
  heading,
  children,
}: {
  /** Titles the Walkthrough once there is one. Unused while the slot is empty. */
  heading: string;
  children?: ReactNode;
}) {
  // Nothing to show yet. Render nothing — including the heading, which would
  // otherwise announce a section with no content under it and leave a gap in
  // the document outline.
  if (!children) {
    return null;
  }

  const headingId = "walkthrough";

  return (
    <section aria-labelledby={headingId} className="mt-24">
      <h2 id={headingId} className="text-section font-semibold text-ink">
        {heading}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
