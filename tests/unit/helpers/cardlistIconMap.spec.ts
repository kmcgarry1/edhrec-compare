import { describe, it, expect } from "vitest";
import { getCardlistIcon } from "../../../src/components/helpers/cardlistIconMap";
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

  it("returns correct icon for new-cards", () => {
    const result = getCardlistIcon("new-cards");
    expect(result).toEqual({ path: mdiStarFourPoints });
  });

  it("returns correct icon for high-synergy-cards", () => {
    const result = getCardlistIcon("high-synergy-cards");
    expect(result).toEqual({ path: mdiInfinity });
  });

  it("returns correct icon for top-cards", () => {
    const result = getCardlistIcon("top-cards");
    expect(result).toEqual({ path: mdiCrownOutline });
  });

  it("returns correct icon for game-changers", () => {
    const result = getCardlistIcon("game-changers");
    expect(result).toEqual({ path: mdiLightningBoltCircle });
  });

  it("returns correct icon for creatures", () => {
    const result = getCardlistIcon("creatures");
    expect(result).toEqual({ path: mdiAccountGroup });
  });

  it("returns correct icon for instants", () => {
    const result = getCardlistIcon("instants");
    expect(result).toEqual({ path: mdiFlash });
  });

  it("returns correct icon for sorceries", () => {
    const result = getCardlistIcon("sorceries");
    expect(result).toEqual({ path: mdiBookOpenPageVariant });
  });

  it("returns correct icon for utility-artifacts", () => {
    const result = getCardlistIcon("utility-artifacts");
    expect(result).toEqual({ path: mdiCogOutline });
  });

  it("returns correct icon for artifacts", () => {
    const result = getCardlistIcon("artifacts");
    expect(result).toEqual({ path: mdiCogOutline });
  });

  it("returns correct icon for enchantments", () => {
    const result = getCardlistIcon("enchantments");
    expect(result).toEqual({ path: mdiMagicStaff });
  });

  it("returns correct icon for battles", () => {
    const result = getCardlistIcon("battles");
    expect(result).toEqual({ path: mdiShieldCross });
  });

  it("returns correct icon for planeswalkers", () => {
    const result = getCardlistIcon("planeswalkers");
    expect(result).toEqual({ path: mdiShieldSword });
  });

  it("returns correct icon for utility-lands", () => {
    const result = getCardlistIcon("utility-lands");
    expect(result).toEqual({ path: mdiMapMarkerMultipleOutline });
  });

  it("returns correct icon for lands", () => {
    const result = getCardlistIcon("lands");
    expect(result).toEqual({ path: mdiTerrain });
  });

  it("returns correct icon for mana-artifacts", () => {
    const result = getCardlistIcon("mana-artifacts");
    expect(result).toEqual({ path: mdiBatteryHigh });
  });

  it("returns correct icon for basics", () => {
    const result = getCardlistIcon("basics");
    expect(result).toEqual({ path: mdiHomeVariantOutline });
  });

  it("returns correct icon for castles", () => {
    const result = getCardlistIcon("castles");
    expect(result).toEqual({ path: mdiCastle });
  });
});
