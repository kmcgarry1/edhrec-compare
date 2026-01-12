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
  "new-cards": { path: mdiStarFourPoints },
  "high-synergy-cards": { path: mdiInfinity },
  "top-cards": { path: mdiCrownOutline },
  "game-changers": { path: mdiLightningBoltCircle },
  creatures: { path: mdiAccountGroup },
  instants: { path: mdiFlash },
  sorceries: { path: mdiBookOpenPageVariant },
  "utility-artifacts": { path: mdiCogOutline },
  artifacts: { path: mdiCogOutline },
  enchantments: { path: mdiMagicStaff },
  battles: { path: mdiShieldCross },
  planeswalkers: { path: mdiShieldSword },
  "utility-lands": { path: mdiMapMarkerMultipleOutline },
  lands: { path: mdiTerrain },
  "mana-artifacts": { path: mdiBatteryHigh },
  basics: { path: mdiHomeVariantOutline },
  castles: { path: mdiCastle },
};

export const getCardlistIcon = (slug: string | null | undefined) => {
  if (!slug) {
    return null;
  }
  return CARDLIST_ICON_MAP[slug] ?? null;
};
