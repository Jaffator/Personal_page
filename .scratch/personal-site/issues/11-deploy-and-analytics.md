# 11 — Deploy and analytics

**What to build:** The site live on its own domain, with enough measurement to tell whether it is doing its job.

Deployed to Vercel and served from `jardalufi.cz`, which is already registered. A custom domain matters here: a preview-host URL pasted into a job application quietly undercuts the polish everything else is aiming for.

Analytics must be cookieless, so that no consent banner is required — a cookie banner on a personal page looks absurd and obstructs the quick look this site depends on. The one question worth answering is whether Readers reach the Case Study at all.

**Blocked by:** 05, 06, 07

**Status:** ready-for-agent

- [ ] The site is reachable at `jardalufi.cz` over HTTPS
- [ ] The bare domain and the `www` form resolve consistently to one canonical host
- [ ] Both locales are reachable in production and cross-link correctly
- [ ] Analytics is cookieless and requires no consent banner
- [ ] No consent banner or cookie notice appears anywhere on the site
- [ ] The production build clears every craft-bar threshold, measured against the deployed site rather than a local build
- [ ] Social previews render correctly when a production URL is shared
- [ ] Search engines are permitted to index the site, and a sitemap covers both locales
