import type { ReactNode } from "react";

/**
 * Where the Walkthrough player goes.
 *
 * BikeCheck's Case Study fills this today, but the slot stays optional: a
 * second Project may reach publication before its recording exists, and an
 * empty slot must render **nothing at all** — no placeholder box, no "video
 * coming soon", no reserved grey rectangle. Each of those would be a promise
 * the site cannot keep, and a Reader who came to see the Project running would
 * read it as the thing being missing rather than as the thing being unbuilt.
 *
 * It is a component rather than an inline `{walkthrough}` in the layout so the
 * heading titling the player is decided in one place — an `h2`, level with the
 * Case Study's other parts — and so the empty case above cannot be forgotten at
 * the next call site.
 */
export function WalkthroughSlot({
  heading,
  children,
}: {
  /** Titles the Walkthrough. Unused while the slot is empty. */
  heading: string;
  children?: ReactNode;
}) {
  // Render nothing — including the heading, which would otherwise announce a
  // section with no content under it and leave a gap in the document outline.
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
