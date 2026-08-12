/**
 * What the verification suite knows about how to reach the author.
 *
 * Written out by hand rather than imported from `app/_content/profile.ts`, for
 * the same reason `routes.ts` and `proof.ts` are: the suite asserts the built
 * site from the outside, and a check that read the address from the file it is
 * checking would agree with a typo in it. The email is the one string on the
 * site that has to be exactly right — a Reader who cannot write back is a
 * Reader lost — so it is the last place to accept a check that cannot fail.
 */

/** The address a Reader writes to, as it must appear in the built page. */
export const EMAIL = "jardalufi@gmail.com";

/** Where the author is, as the built page must state it. */
export const CITY = "Jablonec nad Nisou";

/**
 * The profiles a Reader can look the author up on, away from this site.
 *
 * Both are full addresses rather than hosts. A check for "linkedin.com" passes
 * against a profile slug that was tidied into something readable and leads
 * nowhere, which is the exact mistake worth catching: a Reader who follows a
 * dead LinkedIn link during a hiring decision does not come back to try again.
 */
export const GITHUB_PROFILE = "https://github.com/Jaffator";
export const LINKEDIN_PROFILE = "https://www.linkedin.com/in/jaroslav-lufinka-5a975751";

/**
 * The CV as it is served. The filename is asserted rather than merely the
 * extension: it lands in a folder among files from every other candidate, and
 * `cv.pdf` is indistinguishable there.
 */
export const CV_PATH = "/jaroslav-lufinka-cv.pdf";
export const CV_DOWNLOAD_NAME = /jaroslav.*lufinka.*\.pdf$/i;

/**
 * Hosts that host a form for a site with no backend. The spec forbids a contact
 * form outright — one that silently swallows a message during a job search is a
 * catastrophic failure — so the check is that the page never reaches for one.
 */
export const FORM_SERVICE_HOSTS = [
  "formspree.io",
  "getform.io",
  "formsubmit.co",
  "basin.com",
  "netlify.com",
  "web3forms.com",
  "formcarry.com",
  "staticforms.xyz",
  "usebasin.com",
  "forms.gle",
  "docs.google.com/forms",
  "typeform.com",
  "airtable.com",
  "tally.so",
];
