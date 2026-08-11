# Next.js for a site that does not need it

The site is two routes of essentially static content, which Astro or plain HTML would serve with less machinery and a better performance ceiling. We chose Next.js anyway because the site is itself a work sample for a Czech React job search, where Next is the most frequently requested framework — the hiring signal is worth more here than the technical fit.

## Consequences

- A reviewer may reasonably judge this as over-engineering for the content. That trade was made knowingly; do not "fix" it.
- Static generation is the default. If a decision ever pushes this site toward server rendering or runtime data fetching, the justification for Next disappears along with it — revisit this ADR rather than quietly adding a server.
