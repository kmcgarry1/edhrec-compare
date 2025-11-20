import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import ScryfallCardRow from "../../../src/components/ScryfallCardRow.vue";

vi.mock("../../../src/api/scryfallApi", () => ({
  getCardImage: vi.fn().mockResolvedValue("https://example.com/card.jpg"),
}));

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => ({
    withLoading: (action: () => Promise<unknown>) => action(),
  }),
}));

const notifyError = vi.fn();

vi.mock("../../../src/composables/useGlobalNotices", () => ({
  useGlobalNotices: () => ({
    notifyError,
  }),
}));

const ensureSymbolsLoaded = vi.fn();
const getSvgForSymbol = vi.fn().mockReturnValue("symbol.svg");

vi.mock("../../../src/composables/useScryfallSymbols", () => ({
  useScryfallSymbols: () => ({
    ensureSymbolsLoaded,
    getSvgForSymbol,
    isLoading: ref(false),
  }),
}));

const baseCard = {
  id: "abc123",
  name: "Sol Ring",
  mana_cost: "{1}",
  type_line: "Artifact",
  power: null,
  toughness: null,
  set: "c21",
  rarity: "rare",
  prices: { usd: "2.50", eur: "2.00" },
  scryfall_uri: "https://scryfall.com/card",
};

const originalMatchMedia = window.matchMedia;

type ScryfallRowMethods = {
  openScryfallPage: () => void;
};

describe("ScryfallCardRow", () => {
  const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  const matchMediaMock = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  beforeEach(() => {
    ensureSymbolsLoaded.mockClear();
    getSvgForSymbol.mockClear();
    windowOpenSpy.mockClear();
    (window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
      matchMediaMock;
  });

  afterEach(() => {
    (window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
      originalMatchMedia;
  });

  it("renders table variant with card information", () => {
    const wrapper = mount(ScryfallCardRow, {
      props: {
        card: baseCard,
        have: true,
        variant: "table",
      },
    });

    expect(wrapper.text()).toContain("Sol Ring");
    expect(wrapper.text()).toContain("Artifact");
    expect(wrapper.text()).toContain("rare");
  });

  it("opens Scryfall page when row is clicked on desktop", async () => {
    const wrapper = mount<ScryfallRowMethods>(ScryfallCardRow, {
      props: {
        card: baseCard,
        variant: "table",
      },
    });

    await flushPromises();
    wrapper.vm.openScryfallPage();
    expect(windowOpenSpy).toHaveBeenCalledWith(
      "https://scryfall.com/card",
      "_blank",
      "noopener"
    );
  });
});
