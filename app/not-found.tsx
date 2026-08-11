import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, pathTo } from "@/app/_locale/routes";
import { SiteDocument } from "@/app/_shell/document";

export const metadata: Metadata = {
  title: "Page not found — Jaroslav Lufinka",
};

/**
 * Replaces Next.js' built-in not-found page, whose generated markup carries a
 * second <title> and inline styles that the markup check rejects.
 *
 * It sits above both locale trees, so it inherits neither root layout and
 * renders `SiteDocument` itself. Its copy is written in English rather than
 * pulled from a dictionary because it is not a route: a static export serves
 * one 404 document for every unmatched path, in either locale, so there is no
 * Czech version of this page for a Czech string to reach. It offers no
 * language switch for the same reason — there would be nothing to switch to.
 */
export default function NotFound() {
  return (
    <SiteDocument locale={defaultLocale}>
      <main className="mx-auto max-w-page px-6 py-24">
        <p className="font-mono text-meta text-muted uppercase">Error 404</p>

        <h1 className="mt-6 text-section font-semibold text-ink">Page not found</h1>

        <p className="mt-8 max-w-measure text-lede text-muted">
          That address does not exist on this site.
        </p>

        <div className="rule-t mt-16 pt-8">
          <Link className="link" href={pathTo(defaultLocale, "home")}>
            Go to the home page
          </Link>
        </div>
      </main>
    </SiteDocument>
  );
}
