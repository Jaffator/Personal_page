# 03 — Locale shell

**What to build:** The bilingual structure of the site. English is served from the root and Czech from a prefix — an asymmetry recorded in ADR 0003, chosen so the English URL stays clean because it is the one pasted into job applications and the one search engines should rank. Do not "correct" this to symmetrical prefixes without revisiting that ADR.

A Reader can switch language from anywhere and arrives at the equivalent page rather than being returned to the home page. Each page declares its own title and description per locale, and both language versions cross-declare each other so neither is treated as duplicate content.

Interface strings live in typed per-locale dictionaries. Case Study prose does not — that boundary is set in ADR 0002 and is established properly in ticket 05.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] English serves from the root; Czech serves from its prefix
- [ ] Every route exists in both locales
- [ ] The language switch preserves the current route and lands on its equivalent
- [ ] The language switch is reachable by keyboard and clearly indicates the active language
- [ ] Each page declares its own title and description, per locale
- [ ] Each page declares a canonical URL
- [ ] Both locales declare reciprocal alternate-language links
- [ ] Interface strings are typed per locale, so a missing string fails the build rather than reaching a Reader
- [ ] The verification suite runs against both locales and passes
