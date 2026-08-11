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
    caseStudy: {
      title: "BikeCheck — případová studie",
      description:
        "Jak vznikl BikeCheck: androidová aplikace pro servisní historii kola, od doménového modelu až po to, co jednotlivá rozhodnutí stála.",
    },
  },

  /**
   * Written as Czech, not translated from the English above. "Full-stack
   * vývojář" is what a Czech job advert says and what a Czech Reader scans for;
   * "vývojář plného zásobníku" is not a phrase anyone uses. The positioning
   * keeps the concrete image — "od fronty úloh až po obrazovku" — rather than
   * flattening it into an abstraction, because the image is the claim.
   */
  hero: {
    eyebrow: "Full-stack vývojář — Jablonec nad Nisou",
    name: "Jaroslav Lufinka",
    positioning:
      "Stavím produkty od začátku do konce — od fronty úloh až po obrazovku. Ne jednu vrstvu, kterou pak někdo převezme.",
    projectLead: "Navrhl a postavil jsem:",
  },

  caseStudy: {
    eyebrow: "Případová studie",
    walkthrough: "Podívejte se, jak běží",
    architecture: "Jak je to postavené",
    featureTour: "Co to umí",
    deepDives: "Těžké části",
    retrospective: "Ohlédnutí",
    deepDive: {
      constraint: "Omezení",
      options: "Zvažované možnosti",
      choice: "Rozhodnutí",
      cost: "Co to stálo",
    },
  },

  selectedWork: {
    heading: "Vybrané práce",
    index: "01",
    label: "Vybrané práce",
    readCaseStudy: "Přečíst případovou studii",
  },

  proofLinks: {
    source: "Zdrojový kód na GitHubu",
    googlePlay: "Stáhnout z Google Play",
  },
};
