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
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-6 text-lg">
        That address does not exist on this site.
      </p>
      <p className="mt-6">
        <Link className="underline" href="/">
          Go to the home page
        </Link>
      </p>
    </main>
  );
}
