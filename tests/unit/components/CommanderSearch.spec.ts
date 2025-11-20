import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import CommanderSearch from "../../../src/components/CommanderSearch.vue";

vi.mock("@vueuse/core", () => ({
  useDebounceFn: (fn: (...args: unknown[]) => unknown) => fn,
}));

const searchCardNames = vi.hoisted(() =>
  vi.fn().mockResolvedValue(["Atraxa", "Shalai and Hallar"])
);

vi.mock("../../../src/api/scryfallApi", () => ({
  searchCardNames,
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

const mountComponent = () =>
  mount(CommanderSearch, {
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
});
