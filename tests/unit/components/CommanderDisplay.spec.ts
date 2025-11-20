import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import CommanderDisplay from "../../../src/components/CommanderDisplay.vue";

const mockCard = vi.hoisted(() => ({
  id: "card-1",
  name: "Atraxa, Grand Unifier",
  set: "one",
  set_name: "Phyrexia: All Will Be One",
  collector_number: "001",
  released_at: "2023-02-03",
  prices: { usd: "45", eur: "40" },
  image_uris: { normal: "https://example.com/card1.jpg" },
  card_faces: [],
  prints_search_uri: "https://example.com/prints",
  colors: ["G", "W", "U", "B"],
}));

const mockPrintings = vi.hoisted(() => [
  mockCard,
  {
    ...mockCard,
    id: "card-2",
    set: "uma",
    set_name: "Ultimate Masters",
    collector_number: "002",
    released_at: "2020-01-01",
    image_uris: { normal: "https://example.com/card2.jpg" },
  },
]);

const getCard = vi.hoisted(() => vi.fn().mockResolvedValue(mockCard));
const getCardPrintings = vi.hoisted(() =>
  vi.fn().mockResolvedValue(mockPrintings)
);
const setCommanderColors = vi.hoisted(() => vi.fn());
const clearCommanderColors = vi.hoisted(() => vi.fn());

vi.mock("../../../src/api/scryfallApi", () => ({
  getCard,
  getCardPrintings,
}));

vi.mock("../../../src/composables/useCommanderColors", () => ({
  useCommanderColors: () => ({
    setCommanderColors,
    clearCommanderColors,
  }),
}));

describe("CommanderDisplay", () => {
  beforeEach(() => {
    getCard.mockClear();
    getCardPrintings.mockClear();
    setCommanderColors.mockClear();
    clearCommanderColors.mockClear();
  });

  const mountComponent = () =>
    mount(CommanderDisplay, {
      props: {
        commanderName: "Atraxa, Grand Unifier",
      },
    });

  it("loads commander data and renders printing details", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(getCard).toHaveBeenCalledWith("Atraxa, Grand Unifier");
    expect(wrapper.text()).toContain("Atraxa, Grand Unifier");
    expect(wrapper.text()).toContain("Printing 1 of 2");
    expect(setCommanderColors).toHaveBeenCalled();
  });

  it("cycles through printings when buttons are clicked", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const nextButton = wrapper.findAll("button").find((btn) => btn.text().includes("Next"));
    await nextButton?.trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Printing 2 of 2");
  });
});
