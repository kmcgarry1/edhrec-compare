export const EDHRECPageType = {
  COMMANDER: { value: "commanders", label: "Commander" },
  AVERAGE_DECK: { value: "average-decks", label: "Average Decks" },
} as const;

export type EDHRECPageType =
  (typeof EDHRECPageType)[keyof typeof EDHRECPageType];

export const EDHRECPageModifier = {
  BUDGET: { value: "budget", label: "Budget" },
  EXPENSIVE: { value: "expensive", label: "Expensive" },
  ANY: { value: "", label: "Any" },
} as const;

export type EDHRECPageModifier =
  (typeof EDHRECPageModifier)[keyof typeof EDHRECPageModifier];

export const EDHRECBracket = {
  EXHIBITION: { value: "exhibition", label: "1 - Exhibition" },
  CORE: { value: "core", label: "2 - Core" },
  UPGRADED: { value: "upgraded", label: "3 - Upgraded" },
  OPTIMIZED: { value: "optimized", label: "4 - Optimized" },
  COMPETITIVE: { value: "cedh", label: "5 - Competitive" },
  ALL: { value: "", label: "All" },
} as const;

export type EDHRECBracket = (typeof EDHRECBracket)[keyof typeof EDHRECBracket];

export const EDHRECCompanion = {
  NONE: { value: "", label: "None" },
  GYRUDA: {
    value: "gyruda-companion",
    label: "Gyruda",
    description: "Dimir (U/B)",
    colors: ["U", "B"],
  },
  JEGANTHA: {
    value: "jegantha-companion",
    label: "Jegantha",
    description: "Five-Color (W/U/B/R/G)",
    colors: ["W", "U", "B", "R", "G"],
  },
  KAHEERA: {
    value: "kaheera-companion",
    label: "Kaheera",
    description: "Selesnya (G/W)",
    colors: ["G", "W"],
  },
  KERUGA: {
    value: "keruga-companion",
    label: "Keruga",
    description: "Simic (G/U)",
    colors: ["G", "U"],
  },
  LURRUS: {
    value: "lurrus-companion",
    label: "Lurrus",
    description: "Orzhov (W/B)",
    colors: ["W", "B"],
  },
  OBOSH: {
    value: "obosh-companion",
    label: "Obosh",
    description: "Rakdos (B/R)",
    colors: ["B", "R"],
  },
  UMORI: {
    value: "umori-companion",
    label: "Umori",
    description: "Golgari (B/G)",
    colors: ["B", "G"],
  },
  ZIRDA: {
    value: "zirda-companion",
    label: "Zirda",
    description: "Boros (R/W)",
    colors: ["R", "W"],
  },
} as const;

export type EDHRECCompanion =
  (typeof EDHRECCompanion)[keyof typeof EDHRECCompanion];
