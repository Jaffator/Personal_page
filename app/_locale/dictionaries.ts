import { cs } from "./cs";
import { en, type Dictionary } from "./en";
import type { Locale } from "./routes";

/**
 * Every locale's interface strings, reached by locale rather than by import,
 * so a component takes the locale as a prop and never picks a dictionary.
 */
export const dictionaries: Record<Locale, Dictionary> = { en, cs };
