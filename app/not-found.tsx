import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found — Jaroslav Lufinka",
};

/**
 * Replaces Next.js' built-in not-found page, whose generated markup carries a
 * second <title> and inline styles that the markup check rejects.
 */
export default function NotFound() {
  return (
    <main className="mx-auto max-w-page px-6 py-24">
      <p className="font-mono text-meta text-muted uppercase">Error 404</p>

      <h1 className="mt-6 text-section font-semibold text-ink">
        Page not found
      </h1>

      <p className="mt-8 max-w-measure text-lede text-muted">
        That address does not exist on this site.
      </p>

      <div className="rule-t mt-16 pt-8">
        <Link className="link" href="/">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
