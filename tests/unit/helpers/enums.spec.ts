import { describe, it, expect } from "vitest";
import {

EDHRECPageType,
EDHRECPageModifier,
EDHRECBracket,
EDHRECCompanion,
} from "../../../src/components/helpers/enums";

describe("EDHRECPageType", () => {
it("should have COMMANDER with correct value and label", () => {
    expect(EDHRECPageType.COMMANDER.value).toBe("commanders");
    expect(EDHRECPageType.COMMANDER.label).toBe("Commander");
});

it("should have AVERAGE_DECK with correct value and label", () => {
    expect(EDHRECPageType.AVERAGE_DECK.value).toBe("average-decks");
    expect(EDHRECPageType.AVERAGE_DECK.label).toBe("Average Decks");
});

it("should have exactly 2 page types", () => {
    expect(Object.keys(EDHRECPageType)).toHaveLength(2);
});
});

describe("EDHRECPageModifier", () => {
it("should have BUDGET with correct value and label", () => {
    expect(EDHRECPageModifier.BUDGET.value).toBe("budget");
    expect(EDHRECPageModifier.BUDGET.label).toBe("Budget");
});

it("should have EXPENSIVE with correct value and label", () => {
    expect(EDHRECPageModifier.EXPENSIVE.value).toBe("expensive");
    expect(EDHRECPageModifier.EXPENSIVE.label).toBe("Expensive");
});

it("should have ANY with empty value", () => {
    expect(EDHRECPageModifier.ANY.value).toBe("");
    expect(EDHRECPageModifier.ANY.label).toBe("Any");
});

it("should have exactly 3 modifiers", () => {
    expect(Object.keys(EDHRECPageModifier)).toHaveLength(3);
});
});

describe("EDHRECBracket", () => {
it("should have EXHIBITION with correct value and label", () => {
    expect(EDHRECBracket.EXHIBITION.value).toBe("exhibition");
    expect(EDHRECBracket.EXHIBITION.label).toBe("1 - Exhibition");
});

it("should have CORE with correct value and label", () => {
    expect(EDHRECBracket.CORE.value).toBe("core");
    expect(EDHRECBracket.CORE.label).toBe("2 - Core");
});

it("should have UPGRADED with correct value and label", () => {
    expect(EDHRECBracket.UPGRADED.value).toBe("upgraded");
    expect(EDHRECBracket.UPGRADED.label).toBe("3 - Upgraded");
});

it("should have OPTIMIZED with correct value and label", () => {
    expect(EDHRECBracket.OPTIMIZED.value).toBe("optimized");
    expect(EDHRECBracket.OPTIMIZED.label).toBe("4 - Optimized");
});

it("should have COMPETITIVE with correct value and label", () => {
    expect(EDHRECBracket.COMPETITIVE.value).toBe("cedh");
    expect(EDHRECBracket.COMPETITIVE.label).toBe("5 - Competitive");
});

it("should have ALL with empty value", () => {
    expect(EDHRECBracket.ALL.value).toBe("");
    expect(EDHRECBracket.ALL.label).toBe("All");
});

it("should have exactly 6 brackets", () => {
    expect(Object.keys(EDHRECBracket)).toHaveLength(6);
});
});

describe("EDHRECCompanion", () => {
it("should have NONE with empty value", () => {
    expect(EDHRECCompanion.NONE.value).toBe("");
    expect(EDHRECCompanion.NONE.label).toBe("None");
});

it("should have GYRUDA with correct properties", () => {
    expect(EDHRECCompanion.GYRUDA.value).toBe("gyruda-companion");
    expect(EDHRECCompanion.GYRUDA.label).toBe("Gyruda");
    expect(EDHRECCompanion.GYRUDA.description).toBe("Dimir (U/B)");
    expect(EDHRECCompanion.GYRUDA.colors).toEqual(["U", "B"]);
});

it("should have JEGANTHA with correct properties", () => {
    expect(EDHRECCompanion.JEGANTHA.value).toBe("jegantha-companion");
    expect(EDHRECCompanion.JEGANTHA.label).toBe("Jegantha");
    expect(EDHRECCompanion.JEGANTHA.description).toBe("Five-Color (W/U/B/R/G)");
    expect(EDHRECCompanion.JEGANTHA.colors).toEqual(["W", "U", "B", "R", "G"]);
});

it("should have KAHEERA with correct properties", () => {
    expect(EDHRECCompanion.KAHEERA.value).toBe("kaheera-companion");
    expect(EDHRECCompanion.KAHEERA.label).toBe("Kaheera");
    expect(EDHRECCompanion.KAHEERA.description).toBe("Selesnya (G/W)");
    expect(EDHRECCompanion.KAHEERA.colors).toEqual(["G", "W"]);
});

it("should have KERUGA with correct properties", () => {
    expect(EDHRECCompanion.KERUGA.value).toBe("keruga-companion");
    expect(EDHRECCompanion.KERUGA.label).toBe("Keruga");
    expect(EDHRECCompanion.KERUGA.description).toBe("Simic (G/U)");
    expect(EDHRECCompanion.KERUGA.colors).toEqual(["G", "U"]);
});

it("should have LURRUS with correct properties", () => {
    expect(EDHRECCompanion.LURRUS.value).toBe("lurrus-companion");
    expect(EDHRECCompanion.LURRUS.label).toBe("Lurrus");
    expect(EDHRECCompanion.LURRUS.description).toBe("Orzhov (W/B)");
    expect(EDHRECCompanion.LURRUS.colors).toEqual(["W", "B"]);
});

it("should have OBOSH with correct properties", () => {
    expect(EDHRECCompanion.OBOSH.value).toBe("obosh-companion");
    expect(EDHRECCompanion.OBOSH.label).toBe("Obosh");
    expect(EDHRECCompanion.OBOSH.description).toBe("Rakdos (B/R)");
    expect(EDHRECCompanion.OBOSH.colors).toEqual(["B", "R"]);
});

it("should have UMORI with correct properties", () => {
    expect(EDHRECCompanion.UMORI.value).toBe("umori-companion");
    expect(EDHRECCompanion.UMORI.label).toBe("Umori");
    expect(EDHRECCompanion.UMORI.description).toBe("Golgari (B/G)");
    expect(EDHRECCompanion.UMORI.colors).toEqual(["B", "G"]);
});

it("should have ZIRDA with correct properties", () => {
    expect(EDHRECCompanion.ZIRDA.value).toBe("zirda-companion");
    expect(EDHRECCompanion.ZIRDA.label).toBe("Zirda");
    expect(EDHRECCompanion.ZIRDA.description).toBe("Boros (R/W)");
    expect(EDHRECCompanion.ZIRDA.colors).toEqual(["R", "W"]);
});

it("should have exactly 9 companions", () => {
    expect(Object.keys(EDHRECCompanion)).toHaveLength(9);
});

it("should have all companions with colors array of length 2 except JEGANTHA and NONE", () => {
    const companionsWithColors = Object.values(EDHRECCompanion).filter(
        (c) => "colors" in c
    );
    companionsWithColors.forEach((companion) => {
        if (companion.label === "Jegantha") {
            expect(companion.colors).toHaveLength(5);
        } else {
            expect(companion.colors).toHaveLength(2);
        }
    });
});
});