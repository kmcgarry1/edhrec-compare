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
  EXHIBITION: { value: "exhibition", label: "Exhibition" },
  CORE: { value: "core", label: "Core" },
  UPGRADED: { value: "upgraded", label: "Upgraded" },
  OPTIMIZED: { value: "optimized", label: "Optimized" },
  COMPETITIVE: { value: "cedh", label: "Competitive" },
  ALL: { value: "", label: "All" },
} as const;

export type EDHRECBracket = (typeof EDHRECBracket)[keyof typeof EDHRECBracket];

export const EDHRECCompanion = {
  NONE: { value: "", label: "None" },
  GYRUDA: { value: "gyruda-companion", label: "Gyruda" },
  JEGANTHA: { value: "jegantha-companion", label: "Jegantha" },
  KAHEERA: { value: "kaheera-companion", label: "Kaheera" },
  KERUGA: { value: "keruga-companion", label: "Keruga" },
  LURRUS: { value: "lurrus-companion", label: "Lurrus" },
  OBOSH: { value: "obosh-companion", label: "Obosh" },
  UMORI: { value: "umori-companion", label: "Umori" },
  ZIRDA: { value: "zirda-companion", label: "Zirda" },
} as const;

export type EDHRECCompanion =
  (typeof EDHRECCompanion)[keyof typeof EDHRECCompanion];
