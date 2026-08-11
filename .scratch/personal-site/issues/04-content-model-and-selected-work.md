# 04 — Content model and Selected Work

**What to build:** The typed content layer and the first thing it drives — the Selected Work section on the home page.

Projects, stack groupings, contact details and Proof Links are modelled as typed structured content so that a missing or malformed field fails the build rather than appearing as a gap in front of a Reader. Projects are a collection from the outset even though only BikeCheck exists, because adding lufihome later must be a content change and not a structural one.

Selected Work must look deliberate holding a single Project — not like a grid waiting to be filled.

A Proof Link is data on a Project, carrying its kind and an optional qualifying note. This is what lets a Google Play listing be modelled but absent: publishing later adds a value rather than changing a component. The source Proof Link carries a note marking the repository as actively in development.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Projects, stack groups, contact details and Proof Links are typed; a missing required field fails the build
- [ ] Projects are modelled as a collection, not as a single hard-coded record
- [ ] Selected Work renders from that collection and reads as deliberate with one entry
- [ ] BikeCheck appears with its title, one-line description, stack tags and link through to its Case Study
- [ ] Proof Links carry a kind and an optional note, and a Proof Link with no value is simply absent from the rendered output
- [ ] All Project-facing text resolves per locale
- [ ] Selected Work renders correctly in both locales and both themes, and passes the verification suite
