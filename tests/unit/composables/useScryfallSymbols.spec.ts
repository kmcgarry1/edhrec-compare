import { describe, it, expect, beforeEach, vi } from "vitest";

const getAllSymbolsMock = vi.fn();

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => ({
    withLoading: <T>(action: () => Promise<T> | T) => Promise.resolve(action()),
  }),
}));

vi.mock("../../../src/api/scryfallApi", () => ({
  getAllSymbols: getAllSymbolsMock,
}));

type Module = typeof import("../../../src/composables/useScryfallSymbols");
let useScryfallSymbols: Module["useScryfallSymbols"];

beforeEach(async () => {
  vi.resetModules();
  getAllSymbolsMock.mockReset();
  ({ useScryfallSymbols } = await vi.importActual<Module>(
    "../../../src/composables/useScryfallSymbols"
  ));
});

describe("useScryfallSymbols", () => {
  it("loads and caches symbol map", async () => {
    getAllSymbolsMock.mockResolvedValue([
      { symbol: "{W}", svg_uri: "white.svg" },
      { symbol: "{U}", svg_uri: "blue.svg" },
    ] as any);

    const { ensureSymbolsLoaded, getSvgForSymbol, isLoading } = useScryfallSymbols();

    expect(isLoading.value).toBe(true);
    await ensureSymbolsLoaded();
    expect(isLoading.value).toBe(false);
    expect(getSvgForSymbol("{w}")).toBe("white.svg");
    expect(getSvgForSymbol("{U}")).toBe("blue.svg");

    await ensureSymbolsLoaded();
    expect(getAllSymbolsMock).toHaveBeenCalledTimes(1);
  });

  it("returns null for missing symbols", async () => {
    getAllSymbolsMock.mockResolvedValue([] as any);
    const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();
    await ensureSymbolsLoaded();
    expect(getSvgForSymbol("{X}")).toBeNull();
  });

  it("deduplicates concurrent loads", async () => {
    let resolveSymbols: (value: any) => void;
    const promise = new Promise<any>((resolve) => {
      resolveSymbols = resolve;
    });
    getAllSymbolsMock.mockReturnValue(promise);

    const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();

    const first = ensureSymbolsLoaded();
    const second = ensureSymbolsLoaded();

    resolveSymbols!([{ symbol: "{B}", svg_uri: "black.svg" }]);
    await Promise.all([first, second]);

    expect(getAllSymbolsMock).toHaveBeenCalledTimes(1);
    expect(getSvgForSymbol("{b}")).toBe("black.svg");
  });
});
