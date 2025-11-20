import { describe, it, expect, beforeEach, vi } from "vitest";

const loadModule = () =>
  vi.importActual<typeof import("../../../src/composables/useCommanderColors")>(
    "../../../src/composables/useCommanderColors"
  );

describe("useCommanderColors", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should initialize with empty colors", async () => {
    const { useCommanderColors } = await loadModule();
    const { commanderColors } = useCommanderColors();
    expect(commanderColors.value).toEqual([]);
  });

  it("should set commander colors for a key", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, commanderColors } = useCommanderColors();
    setCommanderColors("commander1", ["w", "u"]);
    expect(commanderColors.value).toEqual(expect.arrayContaining(["W", "U"]));
  });

  it("should merge colors from multiple sources", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, commanderColors } = useCommanderColors();
    setCommanderColors("commander1", ["w", "u"]);
    setCommanderColors("commander2", ["b", "r"]);
    expect(commanderColors.value).toEqual(expect.arrayContaining(["W", "U", "B", "R"]));
  });

  it("should convert colors to uppercase", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, commanderColors } = useCommanderColors();
    setCommanderColors("commander1", ["w", "u", "b", "r", "g"]);
    expect(commanderColors.value).toEqual(expect.arrayContaining(["W", "U", "B", "R", "G"]));
  });

  it("should deduplicate colors", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, commanderColors } = useCommanderColors();
    setCommanderColors("commander1", ["w", "u"]);
    setCommanderColors("commander2", ["w", "u"]);
    expect(commanderColors.value).toHaveLength(2);
  });

  it("should clear colors for a specific key", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, clearCommanderColors, commanderColors } = useCommanderColors();
    setCommanderColors("commander1", ["w", "u"]);
    setCommanderColors("commander2", ["b", "r"]);
    clearCommanderColors("commander1");
    expect(commanderColors.value).toEqual(expect.arrayContaining(["B", "R"]));
    expect(commanderColors.value).not.toEqual(expect.arrayContaining(["W", "U"]));
  });

  it("should handle clearing non-existent key", async () => {
    const { useCommanderColors } = await loadModule();
    const { clearCommanderColors, commanderColors } = useCommanderColors();
    clearCommanderColors("nonexistent");
    expect(commanderColors.value).toEqual([]);
  });

  it("should filter out empty strings", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, commanderColors } = useCommanderColors();
    setCommanderColors("commander1", ["w", "", "u", ""]);
    expect(commanderColors.value).toEqual(expect.arrayContaining(["W", "U"]));
    expect(commanderColors.value).toHaveLength(2);
  });

  it("should update colors when overwriting a key", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, commanderColors } = useCommanderColors();
    setCommanderColors("commander1", ["w", "u"]);
    setCommanderColors("commander1", ["b", "r", "g"]);
    expect(commanderColors.value).toEqual(expect.arrayContaining(["B", "R", "G"]));
    expect(commanderColors.value).not.toEqual(expect.arrayContaining(["W", "U"]));
  });

  it("should handle empty color arrays", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, commanderColors } = useCommanderColors();
    setCommanderColors("commander1", []);
    expect(commanderColors.value).toEqual([]);
  });

  it("should maintain reactivity", async () => {
    const { useCommanderColors } = await loadModule();
    const { setCommanderColors, commanderColors } = useCommanderColors();
    const initial = commanderColors.value;
    setCommanderColors("commander1", ["w"]);
    expect(commanderColors.value).not.toBe(initial);
  });
});
