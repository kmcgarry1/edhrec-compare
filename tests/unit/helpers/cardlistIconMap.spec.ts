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
    expect(result).toEqual({ path: mdiStarFourPoints, color: "#22d3ee" });
});

it("returns correct icon for high-synergy-cards", () => {
    const result = getCardlistIcon("high-synergy-cards");
    expect(result).toEqual({ path: mdiInfinity, color: "#a855f7" });
});

it("returns correct icon for top-cards", () => {
    const result = getCardlistIcon("top-cards");
    expect(result).toEqual({ path: mdiCrownOutline, color: "#facc15" });
});

it("returns correct icon for game-changers", () => {
    const result = getCardlistIcon("game-changers");
    expect(result).toEqual({ path: mdiLightningBoltCircle, color: "#f87171" });
});

it("returns correct icon for creatures", () => {
    const result = getCardlistIcon("creatures");
    expect(result).toEqual({ path: mdiAccountGroup, color: "#34d399" });
});

it("returns correct icon for instants", () => {
    const result = getCardlistIcon("instants");
    expect(result).toEqual({ path: mdiFlash, color: "#fbbf24" });
});

it("returns correct icon for sorceries", () => {
    const result = getCardlistIcon("sorceries");
    expect(result).toEqual({ path: mdiBookOpenPageVariant, color: "#60a5fa" });
});

it("returns correct icon for utility-artifacts", () => {
    const result = getCardlistIcon("utility-artifacts");
    expect(result).toEqual({ path: mdiCogOutline, color: "#94a3b8" });
});

it("returns correct icon for artifacts", () => {
    const result = getCardlistIcon("artifacts");
    expect(result).toEqual({ path: mdiCogOutline, color: "#94a3b8" });
});

it("returns correct icon for enchantments", () => {
    const result = getCardlistIcon("enchantments");
    expect(result).toEqual({ path: mdiMagicStaff, color: "#f472b6" });
});

it("returns correct icon for battles", () => {
    const result = getCardlistIcon("battles");
    expect(result).toEqual({ path: mdiShieldCross, color: "#fb923c" });
});

it("returns correct icon for planeswalkers", () => {
    const result = getCardlistIcon("planeswalkers");
    expect(result).toEqual({ path: mdiShieldSword, color: "#c084fc" });
});

it("returns correct icon for utility-lands", () => {
    const result = getCardlistIcon("utility-lands");
    expect(result).toEqual({ path: mdiMapMarkerMultipleOutline, color: "#38bdf8" });
});

it("returns correct icon for lands", () => {
    const result = getCardlistIcon("lands");
    expect(result).toEqual({ path: mdiTerrain, color: "#a3e635" });
});

it("returns correct icon for mana-artifacts", () => {
    const result = getCardlistIcon("mana-artifacts");
    expect(result).toEqual({ path: mdiBatteryHigh, color: "#fde047" });
});

it("returns correct icon for basics", () => {
    const result = getCardlistIcon("basics");
    expect(result).toEqual({ path: mdiHomeVariantOutline, color: "#fde68a" });
});

it("returns correct icon for castles", () => {
    const result = getCardlistIcon("castles");
    expect(result).toEqual({ path: mdiCastle, color: "#eab308" });
});
});

