import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
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
        GlobalLoadingBanner: { template: "<div class='loader-stub' />" },
        CommanderDisplay: { template: "<div class='display-stub' />" },
        CText: { template: "<span><slot /></span>" },
      },
    },
  });

describe("CommanderSearch", () => {
  beforeEach(() => {
    searchCardNames.mockClear();
    getCard.mockClear();
    notifyError.mockClear();
  });

  it("emits commander slug when primary commander is selected", async () => {
    const wrapper = mountComponent();
    await (
      wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> }
    ).handleSelection("primary", "Atraxa, Grand Unifier");
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.[0][0]).toBe("atraxa-grand-unifier");
  });

  it("combines partner selection into slug", async () => {
    const wrapper = mountComponent();
    await (
      wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> }
    ).handleSelection("primary", "Rograkh, Son of Rohgahh");
    await (
      wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> }
    ).handleSelection("partner", "Silas Renn, Seeker Adept");
    await flushPromises();

    // partner + primary should be sorted alphabetically
    expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe(
      "rograkh-son-of-rohgahh-silas-renn-seeker-adept"
    );
  });

  it("clears selections and emits empty slug when cleared", async () => {
    const wrapper = mountComponent();
    await (
      wrapper.vm as {
        handleSelection: (type: string, name: string) => Promise<void>;
        clearSelection: (type: string) => Promise<void>;
      }
    ).handleSelection("primary", "Atraxa");
    await (
      wrapper.vm as {
        handleSelection: (type: string, name: string) => Promise<void>;
        clearSelection: (type: string) => Promise<void>;
      }
    ).clearSelection("primary");
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe("");
  });

  it("hydrates state from selected slug", async () => {
    const wrapper = mountComponent({ selectedSlug: "atraxa-grand-unifier" });
    await flushPromises();

    expect(wrapper.text()).toContain("Atraxa Grand Unifier");
    expect(wrapper.find("button[aria-label='Clear commander selection']").exists()).toBe(true);
  });

  it("shows search results and selects a commander", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("#primary-commander-search");

    await input.setValue("Atraxa");
    await flushPromises();

    expect(searchCardNames).toHaveBeenCalledWith("Atraxa");
    const options = wrapper.findAll("li");
    expect(options).toHaveLength(2);

    await options[0]?.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe("atraxa");
    expect(wrapper.text()).toContain("Atraxa");
  });

  it("shows error message when search fails", async () => {
    searchCardNames.mockRejectedValueOnce(new Error("No results"));
    const wrapper = mountComponent();

    await wrapper.get("#primary-commander-search").setValue("Atraxa");
    await flushPromises();

    expect(wrapper.text()).toContain("No results");
    expect(notifyError).toHaveBeenCalled();
  });

  it("disables partner search until primary selection is made", async () => {
    const wrapper = mountComponent();
    const findButton = (label: string) =>
      wrapper.findAll("button").find((button) => button.text().includes(label));

    expect(findButton("Add partner")).toBeUndefined();
    expect(wrapper.get("#partner-commander-search").attributes("disabled")).toBeDefined();

    await (wrapper.vm as { selectPrimaryCommander: (name: string) => void }).selectPrimaryCommander(
      "Atraxa, Grand Unifier"
    );
    await flushPromises();

    const addPartnerButton = findButton("Add partner");
    expect(addPartnerButton).toBeDefined();
    await addPartnerButton?.trigger("click");

    expect(wrapper.get("#partner-commander-search").attributes("disabled")).toBeUndefined();
  });

  it("combines mana costs for partner commanders", async () => {
    const wrapper = mountComponent();
    const findButton = (label: string) =>
      wrapper.findAll("button").find((button) => button.text().includes(label));
    await (wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> })
      .handleSelection("primary", "Atraxa");
    await findButton("Add partner")?.trigger("click");
    await (wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> })
      .handleSelection("partner", "Tymna");
    await flushPromises();

    expect(wrapper.text()).toContain("G + G");
  });

  describe("Add partner button functionality", () => {
    const findButton = (wrapper: ReturnType<typeof mountComponent>, label: string) =>
      wrapper.findAll("button").find((button) => button.text().includes(label));

    it("shows 'Add partner' button when primary commander is selected", async () => {
      const wrapper = mountComponent();
      
      await (wrapper.vm as { selectPrimaryCommander: (name: string) => void }).selectPrimaryCommander(
        "Atraxa, Grand Unifier"
      );
      await flushPromises();

      const addPartnerButton = findButton(wrapper, "Add partner");
      expect(addPartnerButton).toBeDefined();
      expect(addPartnerButton?.exists()).toBe(true);
    });

    it("does not show 'Add partner' button when no primary commander is selected", () => {
      const wrapper = mountComponent();
      const addPartnerButton = findButton(wrapper, "Add partner");
      expect(addPartnerButton).toBeUndefined();
    });

    it("reveals partner section when 'Add partner' button is clicked", async () => {
      const wrapper = mountComponent();
      
      await (wrapper.vm as { selectPrimaryCommander: (name: string) => void }).selectPrimaryCommander(
        "Atraxa, Grand Unifier"
      );
      await flushPromises();

      const addPartnerButton = findButton(wrapper, "Add partner");
      expect(addPartnerButton?.exists()).toBe(true);
      
      await addPartnerButton?.trigger("click");
      await flushPromises();

      const partnerInput = wrapper.find("#partner-commander-search");
      expect(partnerInput.attributes("disabled")).toBeUndefined();
    });

    it("replaces 'Add partner' button with 'Remove partner' button after clicking", async () => {
      const wrapper = mountComponent();
      
      await (wrapper.vm as { selectPrimaryCommander: (name: string) => void }).selectPrimaryCommander(
        "Atraxa, Grand Unifier"
      );
      await flushPromises();

      const addPartnerButton = findButton(wrapper, "Add partner");
      expect(addPartnerButton?.exists()).toBe(true);
      expect(findButton(wrapper, "Remove partner")).toBeUndefined();

      await addPartnerButton?.trigger("click");
      await flushPromises();

      expect(findButton(wrapper, "Add partner")).toBeUndefined();
      const removePartnerButton = findButton(wrapper, "Remove partner");
      expect(removePartnerButton?.exists()).toBe(true);
    });

    it("hides partner section when 'Remove partner' button is clicked", async () => {
      const wrapper = mountComponent();
      
      await (wrapper.vm as { selectPrimaryCommander: (name: string) => void }).selectPrimaryCommander(
        "Atraxa, Grand Unifier"
      );
      await flushPromises();

      const addPartnerButton = findButton(wrapper, "Add partner");
      await addPartnerButton?.trigger("click");
      await flushPromises();

      expect(findButton(wrapper, "Remove partner")?.exists()).toBe(true);

      const removePartnerButton = findButton(wrapper, "Remove partner");
      await removePartnerButton?.trigger("click");
      await flushPromises();

      expect(findButton(wrapper, "Add partner")?.exists()).toBe(true);
      expect(findButton(wrapper, "Remove partner")).toBeUndefined();
    });

    it("clears partner selection when 'Remove partner' button is clicked", async () => {
      const wrapper = mountComponent();
      
      await (wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> })
        .handleSelection("primary", "Atraxa");
      await flushPromises();

      const addPartnerButton = findButton(wrapper, "Add partner");
      await addPartnerButton?.trigger("click");
      await flushPromises();

      await (wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> })
        .handleSelection("partner", "Tymna");
      await flushPromises();

      expect(wrapper.text()).toContain("Atraxa + Tymna");

      const removePartnerButton = findButton(wrapper, "Remove partner");
      await removePartnerButton?.trigger("click");
      await flushPromises();

      expect(wrapper.text()).not.toContain("Atraxa + Tymna");
      expect(wrapper.text()).toContain("Atraxa");
      expect(wrapper.text()).not.toContain("Tymna");
    });

    it("emits correct slug after removing partner", async () => {
      const wrapper = mountComponent();
      
      await (wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> })
        .handleSelection("primary", "Atraxa");
      const addPartnerButton = findButton(wrapper, "Add partner");
      await addPartnerButton?.trigger("click");
      await (wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> })
        .handleSelection("partner", "Tymna");
      await flushPromises();

      const removePartnerButton = findButton(wrapper, "Remove partner");
      await removePartnerButton?.trigger("click");
      await flushPromises();

      expect(wrapper.emitted("commander-selected")?.pop()?.[0]).toBe("atraxa");
    });
  });

  describe("Commander details always visible", () => {
    it("shows CommanderDisplay component when primary commander is selected", async () => {
      const wrapper = mountComponent();
      
      expect(wrapper.findAll(".display-stub")).toHaveLength(0);

      await (wrapper.vm as { selectPrimaryCommander: (name: string) => void }).selectPrimaryCommander(
        "Atraxa, Grand Unifier"
      );
      await flushPromises();

      expect(wrapper.findAll(".display-stub")).toHaveLength(1);
    });

    it("shows both CommanderDisplay components when partner is selected", async () => {
      const wrapper = mountComponent();
      
      await (wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> })
        .handleSelection("primary", "Atraxa");
      await flushPromises();

      expect(wrapper.findAll(".display-stub")).toHaveLength(1);

      const addPartnerButton = wrapper.findAll("button").find((button) => button.text().includes("Add partner"));
      await addPartnerButton?.trigger("click");
      await (wrapper.vm as { handleSelection: (type: string, name: string) => Promise<void> })
        .handleSelection("partner", "Tymna");
      await flushPromises();

      expect(wrapper.findAll(".display-stub")).toHaveLength(2);
    });

    it("keeps details visible throughout partner workflow", async () => {
      const wrapper = mountComponent();
      
      await (wrapper.vm as { selectPrimaryCommander: (name: string) => void }).selectPrimaryCommander(
        "Atraxa, Grand Unifier"
      );
      await flushPromises();

      expect(wrapper.findAll(".display-stub")).toHaveLength(1);

      const addPartnerButton = wrapper.findAll("button").find((button) => button.text().includes("Add partner"));
      await addPartnerButton?.trigger("click");
      await flushPromises();

      expect(wrapper.findAll(".display-stub")).toHaveLength(1);

      const removePartnerButton = wrapper.findAll("button").find((button) => button.text().includes("Remove partner"));
      await removePartnerButton?.trigger("click");
      await flushPromises();

      expect(wrapper.findAll(".display-stub")).toHaveLength(1);
    });
  });
});
