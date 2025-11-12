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
};

const CARDLIST_ICON_MAP: Record<string, IconConfig> = {
  "new-cards": { path: mdiStarFourPoints, color: "#22d3ee" },
  "high-synergy-cards": { path: mdiInfinity, color: "#a855f7" },
  "top-cards": { path: mdiCrownOutline, color: "#facc15" },
  "game-changers": { path: mdiLightningBoltCircle, color: "#f87171" },
  creatures: { path: mdiAccountGroup, color: "#34d399" },
  instants: { path: mdiFlash, color: "#fbbf24" },
  sorceries: { path: mdiBookOpenPageVariant, color: "#60a5fa" },
  "utility-artifacts": { path: mdiCogOutline, color: "#94a3b8" },
  artifacts: { path: mdiCogOutline, color: "#94a3b8" },
  enchantments: { path: mdiMagicStaff, color: "#f472b6" },
  battles: { path: mdiShieldCross, color: "#fb923c" },
  planeswalkers: { path: mdiShieldSword, color: "#c084fc" },
  "utility-lands": { path: mdiMapMarkerMultipleOutline, color: "#38bdf8" },
  lands: { path: mdiTerrain, color: "#a3e635" },
  "mana-artifacts": { path: mdiBatteryHigh, color: "#fde047" },
  basics: { path: mdiHomeVariantOutline, color: "#fde68a" },
  castles: { path: mdiCastle, color: "#eab308" },
};

export const getCardlistIcon = (slug: string | null | undefined) => {
  if (!slug) {
    return null;
  }
  return CARDLIST_ICON_MAP[slug] ?? null;
};
