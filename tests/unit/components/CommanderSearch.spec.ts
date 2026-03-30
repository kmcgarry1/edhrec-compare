import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import CommanderSearch from "../../../src/components/CommanderSearch.vue";

vi.mock("@vueuse/core", () => ({
  useDebounceFn: (fn: (...args: unknown[]) => unknown) => fn,
}));

const searchCardNames = vi.hoisted(() =>
  vi.fn().mockResolvedValue(["Atraxa", "Shalai and Hallar"])
);
const getCard = vi.hoisted(() => vi.fn().mockResolvedValue({ mana_cost: "{G}" }));

vi.mock("../../../src/api/scryfallApi", () => ({
  searchCardNames,
  getCard,
}));

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => ({
    withLoading: async (action: () => Promise<unknown>) => action(),
  }),
}));

const notifyError = vi.hoisted(() => vi.fn());

vi.mock("../../../src/composables/useGlobalNotices", () => ({
  useGlobalNotices: () => ({
    notifyError,
  }),
}));

const mountComponent = (props = {}) =>
  mount(CommanderSearch, {
    props,
    global: {
      stubs: {
        Card: { template: "<div class='card-stub'><slot /></div>" },
        CText: { template: "<span><slot /></span>" },
      },
    },
  });

describe("CommanderSearch", () => {
  beforeEach(() => {
    searchCardNames.mockClear();
    getCard.mockClear();
    notifyError.mockClear();
    window.localStorage.clear();
  });

  it("emits commander slug when a primary commander is selected", async () => {
    const wrapper = mountComponent();

    await (
      wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> }
    ).handleSelection("primary", "Atraxa, Grand Unifier");
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.[0][0]).toBe("atraxa-grand-unifier");
  });

  it("combines partner selection into the emitted slug", async () => {
    const wrapper = mountComponent();

    await (
      wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> }
    ).handleSelection("primary", "Rograkh, Son of Rohgahh");
    await (
      wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> }
    ).handleSelection("partner", "Silas Renn, Seeker Adept");
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe(
      "rograkh-son-of-rohgahh-silas-renn-seeker-adept"
    );
  });

  it("clears the primary selection and emits an empty slug", async () => {
    const wrapper = mountComponent();

    await (
      wrapper.vm as {
        handleSelection: (type: string, name: string) => Promise<void>;
        clearSelection: (type: string) => void;
      }
    ).handleSelection("primary", "Atraxa");
    (
      wrapper.vm as {
        clearSelection: (type: string) => void;
      }
    ).clearSelection("primary");
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe("");
  });

  it("hydrates the summary from a selected slug", async () => {
    const wrapper = mountComponent({ selectedSlug: "atraxa-grand-unifier" });
    await flushPromises();

    expect(wrapper.text()).toContain("Atraxa Grand Unifier");
    expect(wrapper.find("button[aria-label='Clear commander selection']").exists()).toBe(true);
  });

  it("shows search results and selects a commander from the combobox", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("#primary-commander-search");

    await input.setValue("Atraxa");
    await flushPromises();

    expect(searchCardNames).toHaveBeenCalledWith("Atraxa");
    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(2);

    await options[0]?.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe("atraxa");
    expect(wrapper.text()).toContain("Atraxa");
  });

  it("supports keyboard navigation in the combobox", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("#primary-commander-search");

    await input.setValue("Atraxa");
    await flushPromises();
    await input.trigger("keydown", { key: "ArrowDown" });
    await input.trigger("keydown", { key: "Enter" });
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe("shalai-and-hallar");
  });

  it("shows recent commanders when the primary field is focused while empty", async () => {
    const wrapper = mountComponent();

    await (
      wrapper.vm as { selectPrimaryCommander: (name: string) => void }
    ).selectPrimaryCommander("Atraxa, Grand Unifier");
    await flushPromises();

    (
      wrapper.vm as {
        clearSelection: (type: string) => void;
      }
    ).clearSelection("primary");
    await flushPromises();

    const input = wrapper.get("#primary-commander-search");
    await input.trigger("focus");
    await flushPromises();

    expect(wrapper.text()).toContain("Recent commanders");
    expect(wrapper.text()).toContain("Atraxa, Grand Unifier");
  });

  it("shows the partner field automatically after a primary commander is selected", async () => {
    const wrapper = mountComponent();

    await (
      wrapper.vm as { selectPrimaryCommander: (name: string) => void }
    ).selectPrimaryCommander("Atraxa, Grand Unifier");
    await flushPromises();

    expect(wrapper.find("#partner-commander-search").exists()).toBe(true);
    expect(wrapper.text()).toContain("Partner slot");
    expect(wrapper.text()).toContain("Optional");
  });

  it("clears the partner selection from the partner field clear action", async () => {
    const wrapper = mountComponent();

    await (
      wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> }
    ).handleSelection("primary", "Atraxa");
    await (
      wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> }
    ).handleSelection("partner", "Tymna");
    await flushPromises();

    const partnerClear = wrapper
      .findAll("button")
      .find((button) => button.attributes("aria-label") === "Clear partner commander search");

    expect(partnerClear?.exists()).toBe(true);
    await partnerClear?.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe("atraxa");
    expect(wrapper.text()).toContain("Optional");
    expect(wrapper.text()).not.toContain("TymnaPartner");
  });

  it("renders a single-field landing mode when minimal mode is enabled", async () => {
    const wrapper = mountComponent({ mode: "minimal" });

    expect(wrapper.find("#partner-commander-search").exists()).toBe(false);

    await (
      wrapper.vm as { selectPrimaryCommander: (name: string) => void }
    ).selectPrimaryCommander("Atraxa, Grand Unifier");
    await flushPromises();

    expect(wrapper.find("#partner-commander-search").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Partner slot");
  });

  it("shows an error message when commander search fails", async () => {
    searchCardNames.mockRejectedValueOnce(new Error("No results"));
    const wrapper = mountComponent();

    await wrapper.get("#primary-commander-search").setValue("Atraxa");
    await flushPromises();

    expect(wrapper.text()).toContain("No results");
    expect(notifyError).toHaveBeenCalled();
  });
});
