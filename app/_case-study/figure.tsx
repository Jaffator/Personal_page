import type { ReactNode } from "react";

/**
 * A figure inside a Deep Dive, with its caption attached to it.
 *
 * `figure` and `figcaption` rather than a div and a styled paragraph, because
 * the association is the whole point: a screen-reader Reader meeting the image
 * is told what it shows, and a caption that is merely positioned underneath is
 * an unrelated line of small text to them. The element pair is what carries
 * that relationship — no `aria-describedby` needed, and none added.
 *
 * The caption is required. A figure a Reader cannot interpret is decoration,
 * and this page has no room for decoration.
 */
export function CaseStudyFigure({
  caption,
  children,
}: {
  caption: ReactNode;
  /** The image, diagram or code block being captioned. */
  children: ReactNode;
}) {
  return (
    <figure className="mt-10">
      {children}
      <figcaption className="mt-3 max-w-measure text-small text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
