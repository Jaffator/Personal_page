# 10 — Motion layer

**What to build:** The detail pass that makes the site feel crafted rather than merely correct. A restrained baseline — subtle reveal on scroll, hover transitions, smooth focus treatment — plus two or three deliberate signature moments.

Restraint is the point. Heavy or janky motion reads worse than no motion at all, undercuts the minimal register, and is the easiest way to make a fast page feel slow. Prefer CSS; reach for a library only if a specific moment genuinely cannot be expressed without one.

One hard constraint: scroll-reveal must never be the mechanism that makes content visible. Under a reduced-motion preference all animation is suppressed, and if visibility depends on the animation, the content disappears entirely for the Readers who most need it not to.

**Blocked by:** 05, 06, 07

**Status:** ready-for-agent

- [ ] A restrained motion baseline applies consistently across the site
- [ ] Two or three signature moments are implemented and feel deliberate rather than decorative
- [ ] All motion is suppressed under a reduced-motion preference
- [ ] With reduced motion set, every piece of content is present and visible
- [ ] Motion does not cause layout shift
- [ ] The site still clears the performance threshold with motion enabled
- [ ] No animation library is added unless a specific moment required it
