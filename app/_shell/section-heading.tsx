/**
 * A section's heading, with the index that sets the editorial register.
 *
 * The index is decoration in the exact sense that matters: it is a numeral in
 * the monospace face that tells a sighted Reader the page has a structure, and
 * tells a screen-reader Reader nothing it does not already get from the
 * heading itself. So it is hidden from the accessibility tree rather than read
 * out as a stray number before every section title.
 *
 * The heading takes its own id, because the section it titles is labelled by
 * it — that is what makes the section a landmark with a name.
 */
export function SectionHeading({
  id,
  index,
  children,
}: {
  id: string;
  index: string;
  children: string;
}) {
  return (
    <div className="reveal rule-draw rule-t flex items-baseline gap-4 pt-4">
      <span aria-hidden="true" className="font-mono text-meta text-muted">
        {index}
      </span>
      <h2 id={id} className="text-section font-semibold text-ink">
        {children}
      </h2>
    </div>
  );
}
