import { describe, it, expect } from "vitest";
import {
  normalizeCardName,
  cardNameVariants,
  getNameColumnIndex,
  buildCardNameSet,
} from "../../../src/utils/cardName";

describe("normalizeCardName", () => {
  it("trims whitespace", () => {
    expect(normalizeCardName("  Lightning Bolt  ")).toBe("lightning bolt");
  });

  it("collapses repeated spaces", () => {
    expect(normalizeCardName("Sol    Ring")).toBe("sol ring");
  });

  it("lowercases the name", () => {
    expect(normalizeCardName("Black Lotus")).toBe("black lotus");
  });

  it("handles empty strings", () => {
    expect(normalizeCardName("")).toBe("");
  });

  it("handles strings with only whitespace", () => {
    expect(normalizeCardName("   ")).toBe("");
  });

  it("handles complex names", () => {
    expect(normalizeCardName("  Delver   of   Secrets  ")).toBe("delver of secrets");
  });
});

describe("cardNameVariants", () => {
  it("returns single variant for normal cards", () => {
    const variants = cardNameVariants("Lightning Bolt");
    expect(variants).toEqual(["lightning bolt"]);
  });

  it("handles double-faced cards with //", () => {
    const variants = cardNameVariants("Delver of Secrets // Insectile Aberration");
    expect(variants).toHaveLength(3);
    expect(variants).toContain("delver of secrets // insectile aberration");
    expect(variants).toContain("delver of secrets");
    expect(variants).toContain("insectile aberration");
  });

  it("returns empty array for empty string", () => {
    expect(cardNameVariants("")).toEqual([]);
  });

  it("handles whitespace around //", () => {
    const variants = cardNameVariants("Front Name  //  Back Name");
    expect(variants).toContain("front name // back name");
    expect(variants).toContain("front name");
    expect(variants).toContain("back name");
  });

  it("handles cards with multiple //", () => {
    const variants = cardNameVariants("A // B // C");
    expect(variants).toContain("a // b // c");
    expect(variants).toContain("a");
    expect(variants).toContain("b");
    expect(variants).toContain("c");
  });

  it("removes duplicates from variants", () => {
    const variants = cardNameVariants("Test // Test");
    // Should have normalized full name and the single part (deduplicated)
    expect(variants).toHaveLength(2);
    expect(variants).toContain("test // test");
    expect(variants).toContain("test");
  });

  it("filters out empty parts after splitting", () => {
    const variants = cardNameVariants("Front // ");
    expect(variants).toContain("front //");
    expect(variants).toContain("front");
    expect(variants.filter(v => v === "")).toHaveLength(0);
  });
});

describe("getNameColumnIndex", () => {
  it("returns 0 for empty headers", () => {
    expect(getNameColumnIndex([])).toBe(0);
  });

  it("returns 0 for undefined headers", () => {
    expect(getNameColumnIndex(undefined as unknown as string[])).toBe(0);
  });

  it("finds exact match for 'name' (case-insensitive)", () => {
    expect(getNameColumnIndex(["Quantity", "Name", "Set"])).toBe(1);
    expect(getNameColumnIndex(["quantity", "name", "set"])).toBe(1);
    expect(getNameColumnIndex(["QUANTITY", "NAME", "SET"])).toBe(1);
  });

  it("finds partial match containing 'name'", () => {
    expect(getNameColumnIndex(["Quantity", "Card Name", "Set"])).toBe(1);
    expect(getNameColumnIndex(["Quantity", "CardName", "Set"])).toBe(1);
  });

  it("prefers exact match over partial match", () => {
    expect(getNameColumnIndex(["Card Name", "Name", "Set"])).toBe(1);
  });

  it("returns 0 when no match found", () => {
    expect(getNameColumnIndex(["Quantity", "Rarity", "Set"])).toBe(0);
  });

  it("handles headers with whitespace", () => {
    expect(getNameColumnIndex([" Quantity ", " Name ", " Set "])).toBe(1);
  });

  it("finds first matching column when multiple matches", () => {
    expect(getNameColumnIndex(["Name", "Another Name", "Set"])).toBe(0);
  });
});

describe("buildCardNameSet", () => {
  it("builds set from simple card names", () => {
    const rows = [["Lightning Bolt"], ["Sol Ring"], ["Black Lotus"]];
    const set = buildCardNameSet(rows, 0);

    expect(set.size).toBe(3);
    expect(set.has("lightning bolt")).toBe(true);
    expect(set.has("sol ring")).toBe(true);
    expect(set.has("black lotus")).toBe(true);
  });

  it("includes variants for double-faced cards", () => {
    const rows = [["Delver of Secrets // Insectile Aberration"]];
    const set = buildCardNameSet(rows, 0);

    expect(set.has("delver of secrets // insectile aberration")).toBe(true);
    expect(set.has("delver of secrets")).toBe(true);
    expect(set.has("insectile aberration")).toBe(true);
  });

  it("uses correct column index", () => {
    const rows = [
      ["1", "Lightning Bolt", "Alpha"],
      ["4", "Sol Ring", "Alpha"],
    ];
    const set = buildCardNameSet(rows, 1);

    expect(set.has("lightning bolt")).toBe(true);
    expect(set.has("sol ring")).toBe(true);
    expect(set.has("1")).toBe(false);
    expect(set.has("4")).toBe(false);
  });

  it("falls back to first column when nameIndex is out of bounds", () => {
    const rows = [["Lightning Bolt"], ["Sol Ring"]];
    const set = buildCardNameSet(rows, 5);

    expect(set.has("lightning bolt")).toBe(true);
    expect(set.has("sol ring")).toBe(true);
  });

  it("handles empty rows", () => {
    const rows: string[][] = [[], ["Sol Ring"], []];
    const set = buildCardNameSet(rows, 0);

    expect(set.has("sol ring")).toBe(true);
    expect(set.size).toBe(1);
  });

  it("deduplicates card names", () => {
    const rows = [["Lightning Bolt"], ["Lightning Bolt"], ["Sol Ring"]];
    const set = buildCardNameSet(rows, 0);

    expect(set.size).toBe(2);
    expect(set.has("lightning bolt")).toBe(true);
    expect(set.has("sol ring")).toBe(true);
  });

  it("filters out empty strings", () => {
    const rows = [[""], ["  "], ["Sol Ring"]];
    const set = buildCardNameSet(rows, 0);

    expect(set.size).toBe(1);
    expect(set.has("sol ring")).toBe(true);
  });

  it("handles mixed normal and double-faced cards", () => {
    const rows = [
      ["Lightning Bolt"],
      ["Delver of Secrets // Insectile Aberration"],
      ["Sol Ring"],
    ];
    const set = buildCardNameSet(rows, 0);

    expect(set.has("lightning bolt")).toBe(true);
    expect(set.has("sol ring")).toBe(true);
    expect(set.has("delver of secrets")).toBe(true);
    expect(set.has("insectile aberration")).toBe(true);
    expect(set.has("delver of secrets // insectile aberration")).toBe(true);
  });
});
