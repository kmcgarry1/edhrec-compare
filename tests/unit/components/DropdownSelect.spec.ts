import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import DropdownSelect from "../../../src/components/DropdownSelect.vue";

const ensureSymbolsLoaded = vi.fn();
const getSvgForSymbol = vi.fn().mockReturnValue("symbol.svg");

vi.mock("../../../src/composables/useScryfallSymbols", () => ({
  useScryfallSymbols: () => ({
    ensureSymbolsLoaded,
    getSvgForSymbol,
  }),
}));

const options = [
  { value: "all", label: "All decks" },
  { value: "budget", label: "Budget", colors: ["{G}", "{U}"] },
];

const mountComponent = (overrideProps = {}) =>
  mount(DropdownSelect, {
    attachTo: document.body,
    props: {
      options,
      placeholder: "Select bracket",
      ...overrideProps,
    },
  });

describe("DropdownSelect", () => {
  beforeEach(() => {
    ensureSymbolsLoaded.mockClear();
    getSvgForSymbol.mockClear();
  });

  it("renders placeholder text when nothing is selected", () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("Select bracket");
  });

  it("opens the options list and emits value on selection", async () => {
    const wrapper = mountComponent();
    await wrapper.find("button").trigger("click");
    await flushPromises();

    const listItems = wrapper.findAll("ul li");
    expect(listItems).toHaveLength(options.length);

    await listItems[1]?.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["budget"]);
  });

  it("loads mana symbols when options provide colors", async () => {
    mountComponent();
    await flushPromises();

    expect(ensureSymbolsLoaded).toHaveBeenCalled();
  });
});
