/**
 * The site's wordmark — a monogram tile, "JL".
 *
 * It matches `app/icon.svg`, the favicon, so the browser tab and the header
 * read as one identity. It is redrawn here rather than imported: the favicon
 * hardcodes its two colours, which is fine for a tab icon that never changes
 * theme but would ignore dark mode if reused as page content. This version
 * names `--color-ink` and `--color-page` instead, so it inverts with the rest
 * of the site for free.
 *
 * `aria-hidden`: the mark carries no accessible name of its own. The `Link`
 * that wraps it in `SiteHeader` supplies one, and the favicon's own
 * `aria-label="JL"` would otherwise announce a redundant "JL" ahead of it.
 */
export function SiteMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="size-8 shrink-0"
    >
      <rect width="64" height="64" rx="12" className="fill-ink" />
      <text
        x="32"
        y="44"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="32"
        fontWeight="600"
        className="fill-page"
      >
        JL
      </text>
    </svg>
  );
}
