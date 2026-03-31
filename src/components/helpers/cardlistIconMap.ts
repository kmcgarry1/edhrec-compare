import {
  mdiStarFourPoints,
  mdiInfinity,
  mdiCrownOutline,
  mdiLightningBoltCircle,
  mdiAccountGroup,
  mdiFlash,
  mdiBookOpenPageVariant,
  mdiCogOutline,
  mdiMagicStaff,
  mdiShieldSword,
  mdiMapMarkerMultipleOutline,
  mdiTerrain,
  mdiBatteryHigh,
  mdiCastle,
  mdiShieldCross,
  mdiHomeVariantOutline,
} from "@mdi/js";

type IconConfig = {
  path: string;
  color?: string;
  tone?: "default" | "accent" | "success" | "warn" | "danger" | "muted";
  summary?: string;
};

const CARDLIST_ICON_MAP: Record<string, IconConfig> = {
  "new-cards": {
    path: mdiStarFourPoints,
    tone: "accent",
    summary: "Fresh additions showing up in newer average lists.",
  },
  "high-synergy-cards": {
    path: mdiInfinity,
    tone: "accent",
    summary: "Cards with the strongest overlap across current builds.",
  },
  "top-cards": {
    path: mdiCrownOutline,
    tone: "success",
    summary: "Most-played staples anchoring the core shell.",
  },
  "game-changers": {
    path: mdiLightningBoltCircle,
    tone: "warn",
    summary: "High-impact swings and finishers worth prioritizing.",
  },
  creatures: {
    path: mdiAccountGroup,
    tone: "default",
    summary: "Creature package and battlefield pressure.",
  },
  instants: {
    path: mdiFlash,
    tone: "accent",
    summary: "Instant-speed interaction and surprise lines.",
  },
  sorceries: {
    path: mdiBookOpenPageVariant,
    tone: "default",
    summary: "Sorcery-speed setup, ramp, and haymakers.",
  },
  "utility-artifacts": {
    path: mdiCogOutline,
    tone: "default",
    summary: "Artifacts handling support, mana, and utility work.",
  },
  artifacts: {
    path: mdiCogOutline,
    tone: "default",
    summary: "Artifact package supporting the route plan.",
  },
  enchantments: {
    path: mdiMagicStaff,
    tone: "accent",
    summary: "Enchantments that shape the deck's long game.",
  },
  battles: {
    path: mdiShieldCross,
    tone: "warn",
    summary: "Battle package and protected value plays.",
  },
  planeswalkers: {
    path: mdiShieldSword,
    tone: "warn",
    summary: "Planeswalker threats and value engines.",
  },
  "utility-lands": {
    path: mdiMapMarkerMultipleOutline,
    tone: "muted",
    summary: "Utility lands and flexible mana slots.",
  },
  lands: {
    path: mdiTerrain,
    tone: "muted",
    summary: "Mana base essentials and fixing.",
  },
  "mana-artifacts": {
    path: mdiBatteryHigh,
    tone: "success",
    summary: "Fast mana and artifact ramp pieces.",
  },
  basics: {
    path: mdiHomeVariantOutline,
    tone: "muted",
    summary: "Basic lands supporting consistency and utility.",
  },
  castles: {
    path: mdiCastle,
    tone: "default",
    summary: "Specialized land package with utility upside.",
  },
};

export const getCardlistIcon = (slug: string | null | undefined) => {
  if (!slug) {
    return null;
  }
  return CARDLIST_ICON_MAP[slug] ?? null;
};
