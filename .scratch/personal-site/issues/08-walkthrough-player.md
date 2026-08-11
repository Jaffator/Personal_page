# 08 — Walkthrough player

**What to build:** The component that carries the site's proof. With no live demo and no store listing, the Walkthrough is the only evidence a Reader has that the application actually runs — so it has to work perfectly and cost nothing in performance.

The video is self-hosted with a poster image and plays on the Reader's action. It never autoplays. It must not become the largest contentful paint element and must not delay interaction, or it will undermine the performance budget the whole site is committed to.

The recording is silent, so its content is conveyed by captions or an accompanying textual description rather than by audio.

Build against a placeholder video file. The real recording is ticket 13 and must not block this.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] The Walkthrough sits in its slot in the Case Study and plays on the Reader's action
- [ ] It never autoplays
- [ ] It is fully operable by keyboard, with visible focus and clear controls
- [ ] A poster image is shown before playback
- [ ] The video is not the largest contentful paint element
- [ ] Video bytes are not fetched until the Reader asks for them
- [ ] Content is conveyed without audio, by captions or an accompanying description
- [ ] Swapping the placeholder for the real recording requires no code change
- [ ] The Case Study still clears the performance threshold with the player present
