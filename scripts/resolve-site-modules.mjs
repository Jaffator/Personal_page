/**
 * A module resolve hook that makes the site's own TypeScript importable from a
 * script, by answering the two things Node's resolver does not.
 *
 * `@/app/_locale/routes` is the alias `tsconfig.json` maps to the project root,
 * and `./cs` is an extensionless import of `cs.ts` — both are normal in a
 * bundled application and neither resolves in plain Node. Rewriting the site's
 * imports to suit a script would be the wrong way round; this file absorbs the
 * difference instead, in the one place it matters.
 *
 * Loaded by `register` from scripts/site-source.mjs, which is the only thing
 * that should import it.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * The extension an extensionless specifier is tried against.
 *
 * Only `.ts`: what this hook resolves is the site's locale model and its
 * dictionaries, which are data modules. A `.tsx` would be a component, and a
 * component is not something a build script should be reaching into.
 */
const SOURCE_EXTENSIONS = [".ts"];

let projectRoot = process.cwd();

export function initialize(data) {
  projectRoot = data.projectRoot;
}

/** Whether a specifier already names a file extension Node can resolve. */
function hasExtension(specifier) {
  return path.extname(specifier) !== "";
}

/** The first candidate that exists on disk, or `undefined` if none does. */
function withSourceExtension(filePath) {
  return SOURCE_EXTENSIONS.map((extension) => filePath + extension).find((candidate) =>
    existsSync(candidate),
  );
}

export function resolve(specifier, context, nextResolve) {
  // `@/…` is the tsconfig alias for the project root.
  if (specifier.startsWith("@/")) {
    const resolved = path.join(projectRoot, specifier.slice(2));
    const withExtension = hasExtension(resolved)
      ? resolved
      : (withSourceExtension(resolved) ?? resolved);
    return nextResolve(pathToFileURL(withExtension).href, context);
  }

  // A relative import written without its extension, as TypeScript allows.
  if (specifier.startsWith(".") && !hasExtension(specifier) && context.parentURL) {
    const resolved = path.resolve(
      path.dirname(fileURLToPath(context.parentURL)),
      specifier,
    );
    const withExtension = withSourceExtension(resolved);
    if (withExtension) {
      return nextResolve(pathToFileURL(withExtension).href, context);
    }
  }

  return nextResolve(specifier, context);
}
