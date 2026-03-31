import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, type Ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { useCommanderSpotlight } from "../../../src/composables/useCommanderSpotlight";
import type { CommanderSelection } from "../../../src/types/edhrec";

const scryfallApiMocks = vi.hoisted(() => ({
  getCard: vi.fn(),
  getCardPrintings: vi.fn(),
}));

vi.mock("../../../src/api/scryfallApi", () => ({
  getCard: scryfallApiMocks.getCard,
  getCardPrintings: scryfallApiMocks.getCardPrintings,
}));

vi.mock("../../../src/utils/errorHandler", () => ({
  handleError: vi.fn(),
}));

const buildCard = (overrides: Record<string, unknown> = {}) => ({
  id: "atraxa-one",
  name: "Atraxa, Grand Unifier",
  mana_cost: "{G}{W}{U}{B}",
  cmc: 7,
  type_line: "Legendary Creature",
  colors: ["G", "W", "U", "B"],
  color_identity: ["W", "U", "B", "G"],
  set: "one",
  set_name: "Phyrexia: All Will Be One",
  collector_number: "196",
  rarity: "mythic",
  released_at: "2023-02-03",
  prints_search_uri: "https://api.scryfall.com/cards/search?q=atraxa",
  image_uris: {
    normal: "https://example.com/atraxa.jpg",
    art_crop: "https://example.com/atraxa-art.jpg",
  },
  prices: {
    usd: "12.00",
    eur: "11.00",
  },
  ...overrides,
});

const mountComposable = (selection: Ref<CommanderSelection>) => {
  const Host = defineComponent({
    setup(_, { expose }) {
      const api = useCommanderSpotlight(selection);
      expose(api);
      return () => h("div");
    },
  });

  return mount(Host);
};

describe("useCommanderSpotlight", () => {
  beforeEach(() => {
    scryfallApiMocks.getCard.mockReset();
    scryfallApiMocks.getCardPrintings.mockReset();
  });

  it("derives commander color identity and merged ordering from Scryfall data", async () => {
    scryfallApiMocks.getCard.mockResolvedValue(buildCard());
    scryfallApiMocks.getCardPrintings.mockResolvedValue([
      buildCard(),
      buildCard({ id: "atraxa-c17", set: "c17" }),
    ]);

    const selection = ref<CommanderSelection>({
      primary: "Atraxa, Grand Unifier",
      partner: "",
      hasPartner: false,
    });

    const wrapper = mountComposable(selection);
    await flushPromises();

    const vm = wrapper.vm as {
      commanderProfiles: Array<{ colorIdentity: string[]; totalPrintings: number }>;
      mergedColorIdentity: string[];
    };

    expect(vm.commanderProfiles[0]?.colorIdentity).toEqual(["W", "U", "B", "G"]);
    expect(vm.mergedColorIdentity).toEqual(["W", "U", "B", "G"]);
    expect(vm.commanderProfiles[0]?.totalPrintings).toBe(2);
    expect(scryfallApiMocks.getCard).toHaveBeenCalledWith("Atraxa, Grand Unifier");
    expect(scryfallApiMocks.getCardPrintings).toHaveBeenCalledWith(
      "https://api.scryfall.com/cards/search?q=atraxa"
    );
  });

  it("merges partner color identity in canonical order without fetching printings", async () => {
    scryfallApiMocks.getCard
      .mockResolvedValueOnce(
        buildCard({
          id: "tymna",
          name: "Tymna the Weaver",
          colors: ["W", "B"],
          color_identity: ["W", "B"],
          prints_search_uri: undefined,
        })
      )
      .mockResolvedValueOnce(
        buildCard({
          id: "thrasios",
          name: "Thrasios, Triton Hero",
          colors: ["U", "G"],
          color_identity: ["U", "G"],
          prints_search_uri: undefined,
        })
      );

    const selection = ref<CommanderSelection>({
      primary: "Tymna the Weaver",
      partner: "Thrasios, Triton Hero",
      hasPartner: true,
    });

    const wrapper = mountComposable(selection);
    await flushPromises();

    const vm = wrapper.vm as {
      commanderProfiles: Array<{ colorIdentity: string[] }>;
      mergedColorIdentity: string[];
    };

    expect(vm.commanderProfiles).toHaveLength(2);
    expect(vm.commanderProfiles[0]?.colorIdentity).toEqual(["W", "B"]);
    expect(vm.commanderProfiles[1]?.colorIdentity).toEqual(["U", "G"]);
    expect(vm.mergedColorIdentity).toEqual(["W", "U", "B", "G"]);
    expect(scryfallApiMocks.getCardPrintings).not.toHaveBeenCalled();
  });

  it("cycles through printings once they are loaded", async () => {
    scryfallApiMocks.getCard.mockResolvedValue(buildCard());
    scryfallApiMocks.getCardPrintings.mockResolvedValue([
      buildCard({ id: "atraxa-one", set: "one", collector_number: "196" }),
      buildCard({ id: "atraxa-c17", set: "c17", collector_number: "42" }),
    ]);

    const selection = ref<CommanderSelection>({
      primary: "Atraxa, Grand Unifier",
      partner: "",
      hasPartner: false,
    });

    const wrapper = mountComposable(selection);
    await flushPromises();
    await nextTick();

    const vm = wrapper.vm as {
      commanderProfiles: Array<{ id: string; printingPosition: number }>;
      showNextPrinting: (index: number) => void;
      showPreviousPrinting: (index: number) => void;
    };

    expect(vm.commanderProfiles[0]?.id).toBe("atraxa-one");
    expect(vm.commanderProfiles[0]?.printingPosition).toBe(1);

    vm.showNextPrinting(0);
    await nextTick();
    expect(vm.commanderProfiles[0]?.id).toBe("atraxa-c17");
    expect(vm.commanderProfiles[0]?.printingPosition).toBe(2);

    vm.showPreviousPrinting(0);
    await nextTick();
    expect(vm.commanderProfiles[0]?.id).toBe("atraxa-one");
    expect(vm.commanderProfiles[0]?.printingPosition).toBe(1);
  });
});
