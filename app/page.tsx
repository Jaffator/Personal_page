/**
 * Placeholder home page. It exists so the verification suite has a real built
 * route to crawl; the hero, Selected Work and contact sections replace it in
 * later tickets.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Jaroslav Lufinka</h1>
      <p className="mt-6 text-lg">
        This site is under construction. It will present BikeCheck — an Android
        application built with Capacitor — as a case study.
      </p>
      <p className="mt-6">
        <a className="underline" href="https://github.com/Jaffator">
          Source on GitHub
        </a>
      </p>
    </main>
  );
}
