/**
 * Reads the site's own modules from a plain Node script.
 *
 * `app/_locale/` is TypeScript, is imported through the `@/` alias and writes
 * extensionless relative imports — three things Node's loader does not do on
 * its own. Rather than restating a route list or a page title in a script,
 * where it would drift from the site the first time either changed, this
 * teaches Node to resolve the site's modules and imports the real ones.
 *
 * Type stripping is what makes that possible without a build step: the loader
 * erases the annotations and runs the JavaScript underneath. It costs nothing
 * here, because these modules are data — no decorators, no enums, nothing that
 * needs types at runtime.
 *
 * The hook lives in a separate file because `register` loads it into its own
 * module thread; it cannot be a function defined in the caller.
 */
import { register } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

register("./resolve-site-modules.mjs", import.meta.url, {
  data: { projectRoot },
});

/** The site's locale and route model, as the site itself resolves it. */
export const { locales, defaultLocale, routeKeys, pathTo } = await import(
  pathToFileURL(path.join(projectRoot, "app/_locale/routes.ts")).href
);

/** Every locale's interface strings, including the per-route titles. */
export const { dictionaries } = await import(
  pathToFileURL(path.join(projectRoot, "app/_locale/dictionaries.ts")).href
);

/** The origin the site publishes itself under, as the site declares it. */
export const { SITE_URL } = await import(
  pathToFileURL(path.join(projectRoot, "app/_locale/metadata.ts")).href
);

export { projectRoot };
