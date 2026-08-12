import type { Localised } from "./localised";

/**
 * The author, as facts rather than as prose: how to reach him, where he is, and
 * what he is built out of.
 *
 * This is content by the test in docs/content.md — it describes a particular
 * person rather than naming a piece of furniture, so it would not survive being
 * rewritten for someone else. The headings above it ("Stack", "Contact") are
 * interface and live in the dictionaries.
 *
 * An email address, a URL and a city are the same in both languages, so they
 * are plain strings. Only the text a Reader reads as language — the note on a
 * profile, the work preference — is `Localised`.
 */

/**
 * The author's name, as the site's wordmark writes it.
 *
 * Not `Localised`: a person's name is the same in both languages, and the
 * header renders it identically either way.
 *
 * The name also appears in each locale's `hero.name` and page titles. Those are
 * not read from here — a page title is a written sentence the name happens to
 * sit inside, and threading a constant through them would buy nothing. This
 * constant exists so the wordmark, which is the site's identity rather than any
 * one page's copy, has a source that is not some other component's string.
 */
export const NAME = "Jaroslav Lufinka";

/** Where the author is. Stated, because a Reader is placing him on a map. */
export const CITY = "Jablonec nad Nisou";

/**
 * The address a Reader writes to.
 *
 * One constant, used by the visible text, the copy control and the `mailto:`
 * link alike, so the address a Reader sees is provably the address they copy.
 * Three literals would be three chances to ship a typo in the one string on the
 * site that has to be exactly right.
 */
export const EMAIL = "jardalufi@gmail.com";

/**
 * The CV, served from `public/` and versioned with the site, so it cannot drift
 * from what is deployed.
 *
 * `download` is the filename it lands under in a Reader's downloads folder,
 * where it sits among files from every other candidate. A generic `cv.pdf` is
 * indistinguishable there; the name is therefore the author's, not the site's.
 */
export const CV = {
  href: "/jaroslav-lufinka-cv.pdf",
  download: "Jaroslav-Lufinka-CV.pdf",
} as const;

/**
 * Which profile a link points at.
 *
 * A closed union, so a profile cannot be invented at a call site and each one
 * is named in every locale before the build passes — the same guarantee
 * `ProofLinkKind` gives the Proof Links.
 */
export type ProfileKey = "github" | "linkedin";

/** A profile a Reader can look the author up on, away from this site. */
export type Profile = {
  /** Identifies the profile in content and in test failures. */
  key: ProfileKey;
  href: string;
};

export const profiles: readonly Profile[] = [
  { key: "github", href: "https://github.com/Jaffator" },
  // The numeric suffix is part of the profile's real address. Tidying it away
  // to a bare name reads better and leads nowhere.
  { key: "linkedin", href: "https://www.linkedin.com/in/jaroslav-lufinka-5a975751" },
];

/**
 * One group of the Stack — a heading and the technologies under it.
 *
 * Grouped rather than flat because a Reader matching against an open role scans
 * for a category before a name, and a single 30-item list makes them read all
 * thirty. The group's `name` is localised: "Frontend" and "Testing and tooling"
 * are read as language, unlike the technology names beneath them.
 *
 * There is deliberately nowhere to put a proficiency: no level, no percentage,
 * no year count. A technical Reader treats a bar reading "React 85%" as a red
 * flag, because the claim cannot be true — 85% of what? The type is what makes
 * that a decision recorded once here rather than one a component could reverse.
 */
export type StackGroup = {
  key: string;
  name: Localised<string>;
  /**
   * The technologies in the group, named as a Reader searching for them would
   * write them. Not localised: a technology's name is the same in both
   * languages, and translating one would make it unrecognisable.
   */
  items: readonly string[];
};

/**
 * What the author builds with.
 *
 * Only what he would be willing to be asked about in an interview. A list
 * padded with everything ever touched is a list a Reader finds a hole in on the
 * first question, and the hole costs more than the entry gained.
 */
export const stackGroups: readonly StackGroup[] = [
  {
    key: "languages",
    name: { en: "Languages", cs: "Jazyky" },
    items: ["TypeScript", "JavaScript", "SQL", "HTML", "CSS"],
  },
  {
    key: "frontend",
    name: { en: "Frontend", cs: "Frontend" },
    items: ["React", "Next.js", "Tailwind CSS", "Mantine UI", "Vite"],
  },
  {
    key: "backend",
    name: { en: "Backend", cs: "Backend" },
    items: ["NestJS", "Node.js", "Prisma", "PostgreSQL", "REST"],
  },
  {
    key: "mobile",
    name: { en: "Mobile", cs: "Mobilní vývoj" },
    items: ["Capacitor", "Android"],
  },
  {
    key: "tooling",
    name: { en: "Tooling", cs: "Nástroje" },
    items: ["Git", "GitHub Actions", "Docker", "Playwright", "Figma"],
  },
];
