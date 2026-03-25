import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import DashboardSelectionStage from "../../../src/components/dashboard/DashboardSelectionStage.vue";
import type { CommanderSelection } from "../../../src/types/edhrec";

const getRandomCardArt = vi.hoisted(() => vi.fn());
const setBackgroundArtUrls = vi.hoisted(() => vi.fn());
const setCommanderSlug = vi.hoisted(() => vi.fn());
const selectPrimaryCommanderSpy = vi.hoisted(() => vi.fn());
const currentCommanderSlug = ref<string | null>(null);

vi.mock("../../../src/api/scryfallApi", () => ({
  getRandomCardArt,
}));

vi.mock("../../../src/composables/useBackgroundArt", () => ({
  useBackgroundArt: () => ({
    setBackgroundArtUrls,
  }),
}));

vi.mock("../../../src/composables/useEdhrecRouteState", () => ({
  useEdhrecRouteState: () => ({
    currentCommanderSlug,
    setCommanderSlug,
  }),
}));

vi.mock("../../../src/utils/animations", () => ({
  prefersReducedMotion: () => true,
}));

const CommanderSearchStub = defineComponent({
  name: "CommanderSearch",
  emits: ["commander-selected", "selection-change"],
  setup(_, { emit, expose }) {
    const selectPrimaryCommander = (name: string) => {
      selectPrimaryCommanderSpy(name);
      emit("selection-change", {
        primary: name,
        partner: "",
        hasPartner: false,
      } satisfies CommanderSelection);
      emit("commander-selected", "atr-a-placeholder");
    };

    expose({ selectPrimaryCommander });

    return () => h("div", { class: "commander-search-stub" });
  },
});

const mountComponent = () =>
  mount(DashboardSelectionStage, {
    props: {
      hasCsvData: false,
      csvCount: 0,
    },
    global: {
      stubs: {
        CommanderSearch: CommanderSearchStub,
        Card: {
          template: "<div class='card-stub'><slot /></div>",
        },
        CButton: {
          template: "<button class='cbutton-stub' @click=\"$emit('click')\"><slot /></button>",
        },
        CText: {
          template: "<span class='ctext-stub'><slot /></span>",
        },
      },
    },
  });

describe("DashboardSelectionStage", () => {
  beforeEach(() => {
    getRandomCardArt.mockReset();
    setBackgroundArtUrls.mockReset();
    setCommanderSlug.mockReset();
    selectPrimaryCommanderSpy.mockReset();
    currentCommanderSlug.value = null;
  });

  it("does not render the random spotlight caption inside the search shell", async () => {
    getRandomCardArt
      .mockResolvedValueOnce({ name: "Atraxa, Grand Unifier", imageUrl: "https://example.com/a.jpg" })
      .mockResolvedValueOnce({ name: "Miirym, Sentinel Wyrm", imageUrl: "https://example.com/b.jpg" })
      .mockResolvedValueOnce({ name: "Edgar Markov", imageUrl: "https://example.com/c.jpg" });

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).not.toContain("Random spotlight");
    expect(setBackgroundArtUrls).toHaveBeenCalledWith(["https://example.com/a.jpg"]);
  });

  it("selects a commander when a floating card is clicked", async () => {
    getRandomCardArt
      .mockResolvedValueOnce({ name: "Atraxa, Grand Unifier", imageUrl: "https://example.com/a.jpg" })
      .mockResolvedValueOnce({ name: "Miirym, Sentinel Wyrm", imageUrl: "https://example.com/b.jpg" })
      .mockResolvedValueOnce({ name: "Edgar Markov", imageUrl: "https://example.com/c.jpg" });

    const wrapper = mountComponent();
    await flushPromises();

    const randomCardButtons = wrapper
      .findAll("button")
      .filter((button) => button.attributes("aria-label")?.startsWith("Open commander "));

    expect(randomCardButtons).toHaveLength(2);

    await randomCardButtons[0]!.trigger("click");

    expect(selectPrimaryCommanderSpy).toHaveBeenCalledWith("Miirym, Sentinel Wyrm");
  });
});
