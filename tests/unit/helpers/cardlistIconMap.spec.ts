import { describe, expect, it } from "vitest";
import { getCardlistIcon } from "../../../src/components/helpers/cardlistIconMap";
import {
  mdiAccountGroup,
  mdiBatteryHigh,
  mdiBookOpenPageVariant,
  mdiCastle,
  mdiCogOutline,
  mdiCrownOutline,
  mdiFlash,
  mdiHomeVariantOutline,
  mdiInfinity,
  mdiLightningBoltCircle,
  mdiMagicStaff,
  mdiMapMarkerMultipleOutline,
  mdiShieldCross,
  mdiShieldSword,
  mdiStarFourPoints,
  mdiTerrain,
} from "@mdi/js";

const expectedIcons = [
  {
    slug: "new-cards",
    path: mdiStarFourPoints,
    tone: "accent",
    summary: "Fresh additions showing up in newer average lists.",
  },
  {
    slug: "high-synergy-cards",
    path: mdiInfinity,
    tone: "accent",
    summary: "Cards with the strongest overlap across current builds.",
  },
  {
    slug: "top-cards",
    path: mdiCrownOutline,
    tone: "success",
    summary: "Most-played staples anchoring the core shell.",
  },
  {
    slug: "game-changers",
    path: mdiLightningBoltCircle,
    tone: "warn",
    summary: "High-impact swings and finishers worth prioritizing.",
  },
  {
    slug: "creatures",
    path: mdiAccountGroup,
    tone: "default",
    summary: "Creature package and battlefield pressure.",
  },
  {
    slug: "instants",
    path: mdiFlash,
    tone: "accent",
    summary: "Instant-speed interaction and surprise lines.",
  },
  {
    slug: "sorceries",
    path: mdiBookOpenPageVariant,
    tone: "default",
    summary: "Sorcery-speed setup, ramp, and haymakers.",
  },
  {
    slug: "utility-artifacts",
    path: mdiCogOutline,
    tone: "default",
    summary: "Artifacts handling support, mana, and utility work.",
  },
  {
    slug: "artifacts",
    path: mdiCogOutline,
    tone: "default",
    summary: "Artifact package supporting the route plan.",
  },
  {
    slug: "enchantments",
    path: mdiMagicStaff,
    tone: "accent",
    summary: "Enchantments that shape the deck's long game.",
  },
  {
    slug: "battles",
    path: mdiShieldCross,
    tone: "warn",
    summary: "Battle package and protected value plays.",
  },
  {
    slug: "planeswalkers",
    path: mdiShieldSword,
    tone: "warn",
    summary: "Planeswalker threats and value engines.",
  },
  {
    slug: "utility-lands",
    path: mdiMapMarkerMultipleOutline,
    tone: "muted",
    summary: "Utility lands and flexible mana slots.",
  },
  {
    slug: "lands",
    path: mdiTerrain,
    tone: "muted",
    summary: "Mana base essentials and fixing.",
  },
  {
    slug: "mana-artifacts",
    path: mdiBatteryHigh,
    tone: "success",
    summary: "Fast mana and artifact ramp pieces.",
  },
  {
    slug: "basics",
    path: mdiHomeVariantOutline,
    tone: "muted",
    summary: "Basic lands supporting consistency and utility.",
  },
  {
    slug: "castles",
    path: mdiCastle,
    tone: "default",
    summary: "Specialized land package with utility upside.",
  },
] as const;

describe("getCardlistIcon", () => {
  it("returns null for null input", () => {
    expect(getCardlistIcon(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(getCardlistIcon(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getCardlistIcon("")).toBeNull();
  });

  it("returns null for unknown slug", () => {
    expect(getCardlistIcon("unknown-card-type")).toBeNull();
  });

  it.each(expectedIcons)("returns icon metadata for $slug", ({ slug, path, tone, summary }) => {
    expect(getCardlistIcon(slug)).toEqual({
      path,
      tone,
      summary,
    });
  });
});
