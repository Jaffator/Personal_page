# Case Studies are MDX per locale, not translation keys

The site is bilingual (English and Czech) and its Case Studies are long-form prose. Short interface strings live in typed per-locale dictionaries, but Case Study prose lives in one MDX file per locale (`bikecheck.en.mdx`, `bikecheck.cs.mdx`) rendered through a single shared layout.

## Considered Options

The obvious alternative was to put everything in locale dictionaries, matching the i18next pattern already used in BikeCheck. Rejected because paragraph-length prose trapped in string values cannot be formatted, escapes badly, produces unreadable diffs, and makes inline links or emphasis painful — and the Case Study is the most important writing on the site.

## Consequences

- Two mechanisms for text now coexist. The boundary is: interface strings go in dictionaries, Case Study prose goes in MDX. Keep it.
- Adding a Project means adding one MDX file per locale, not a new component.
