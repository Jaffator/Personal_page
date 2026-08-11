import type { Dictionary } from "./en";

/**
 * The Czech dictionary. The annotation is the point: it fails the build the
 * moment English carries a string this file does not.
 */
export const cs: Dictionary = {
  languageSwitch: {
    label: "Jazyk",
  },

  meta: {
    home: {
      title: "Jaroslav Lufinka",
      description:
        "Jaroslav Lufinka vyvíjí software. Tento web do hloubky představuje BikeCheck, androidovou aplikaci postavenou na Capacitoru.",
    },
  },

  home: {
    eyebrow: "Ve výstavbě",
    heading: "Jaroslav Lufinka",
    lede: "Tento web se právě staví. Představí BikeCheck — androidovou aplikaci postavenou na Capacitoru — jako případovou studii.",
    source: "Zdrojový kód na GitHubu",
  },
};
