# Self-hosted font subsets, displayed as optional

The site needs a grotesk and a monospace in two alphabets: English at the root and Czech under a prefix, where `č`, `ř`, `š`, `ž`, `ě` and `ů` all live in latin-ext. Google Fonts would serve exactly that split for free, but a request to `fonts.gstatic.com` is a third party watching the Reader, and it is a second connection standing between the Reader and the first paint.

So the four subset files — Inter and JetBrains Mono, latin and latin-ext — are committed under `public/fonts/` and declared with `unicode-range` in `app/globals.css`. The latin pair is preloaded; latin-ext is fetched only by a page that contains such a glyph.

`font-display: optional` is the deliberate part. `swap` would paint the fallback and then reflow the page under the Reader's eyes, which is the layout shift the craft bar forbids. `optional` gives the browser a 100ms window: with a preloaded, same-origin, sub-50KB file it wins that race essentially always, and when it does not, the Reader gets the fallback stack for that one page view and the page never moves.

## Consequences

- A cold load on a genuinely slow connection renders in the fallback grotesk. The fallback stack is chosen to degrade gracefully; this is accepted rather than fixed.
- Updating a typeface means re-downloading the subsets by hand. There is no build step that fetches fonts, and there should not be — a build that reaches the network is a build that can fail offline.
- A page whose text is mostly latin-ext (the Czech locale) fetches an unpreloaded file. If that ever shows as mixed rendering, preload latin-ext on the Czech routes rather than dropping the subset split.
