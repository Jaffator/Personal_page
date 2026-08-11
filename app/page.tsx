/**
 * Placeholder home page. It exists so the verification suite has a real built
 * route to crawl, and so the design system is exercised by something rather
 * than asserted in the abstract; the hero, Selected Work and contact sections
 * replace it in later tickets.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-page px-6 py-24">
      <p className="font-mono text-meta text-muted uppercase">In progress</p>

      <h1 className="mt-6 text-display font-semibold text-ink">
        Jaroslav Lufinka
      </h1>

      <p className="mt-8 max-w-measure text-lede text-muted">
        This site is under construction. It will present BikeCheck — an Android
        application built with Capacitor — as a Case Study.
      </p>

      <div className="rule-t mt-16 pt-8">
        <a className="link" href="https://github.com/Jaffator">
          Source on GitHub
        </a>
      </div>
    </main>
  );
}
