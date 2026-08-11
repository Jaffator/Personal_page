# English serves from the root, Czech from /cs

The two locales are handled asymmetrically: `jardalufi.cz/` serves English and `jardalufi.cz/cs` serves Czech, rather than the symmetrical `/en` and `/cs` with a redirect at the root. English gets the clean canonical URL because it is the version pasted into job applications and the version search engines should rank.

## Consequences

- URLs are effectively permanent once they appear in submitted applications and search indexes, so this is expensive to change later even though it looks like a routing detail.
- The default locale needs special-casing in routing and in the language switch. Accepted deliberately.
- `hreflang` must be set on both versions so neither is treated as duplicate content.
