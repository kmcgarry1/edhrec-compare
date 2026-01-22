import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import ToolkitHeader from "../../../src/components/ToolkitHeader.vue";

const density = ref("comfortable");
const setDensity = vi.fn((value: string) => {
  density.value = value as typeof density.value;
});
const densityOptions = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

vi.mock("../../../src/composables/useLayoutDensity", () => ({
  useLayoutDensity: () => ({
    density,
    setDensity,
    densityOptions,
  }),
}));

const DecklistExportStub = {
  name: "DecklistExport",
  props: ["disabled", "copied"],
  template:
    "<div class='decklist-stub'><button class='copy' @click=\"$emit('copy')\" />" +
    "<button class='download' @click=\"$emit('download')\" /></div>",
};

const mountComponent = (overrideProps = {}) =>
  mount(ToolkitHeader, {
    props: {
      theme: "dark",
      backgroundEnabled: true,
      showOwned: null,
      decklistAvailable: false,
      decklistCopied: false,
      ...overrideProps,
    },
    global: {
      stubs: {
        AccessibilityControls: { template: "<div class='a11y-controls-stub'></div>" },
        Card: { template: "<div class='card-stub'><slot /></div>" },
        DecklistExport: DecklistExportStub,
      },
    },
  });

describe("ToolkitHeader", () => {
  beforeEach(() => {
    density.value = "comfortable";
    setDensity.mockClear();
  });

  it("emits actions for header buttons", async () => {
    const wrapper = mountComponent();

    await wrapper.get("button[aria-label='Hide toolkit']").trigger("click");
    await wrapper.get("button[aria-label='Switch to light theme']").trigger("click");
    await wrapper.get("button[aria-label='Hide nebula background']").trigger("click");
    await wrapper.get("button[aria-label='Upload CSV collection file']").trigger("click");

    expect(wrapper.emitted("collapse")).toBeTruthy();
    expect(wrapper.emitted("toggle-theme")).toBeTruthy();
    expect(wrapper.emitted("toggle-background")).toBeTruthy();
    expect(wrapper.emitted("show-upload")).toBeTruthy();
  });

  it("calls setDensity when density option is selected", async () => {
    const wrapper = mountComponent();
    const densityButtons = wrapper
      .get("[aria-label='Adjust layout density']")
      .findAll("button");

    await densityButtons[1]?.trigger("click");
    expect(setDensity).toHaveBeenCalledWith("compact");
  });

  it("emits ownership filters", async () => {
    const wrapper = mountComponent({ showOwned: true });
    const filterButtons = wrapper.findAll("[aria-label^='Show']");

    await filterButtons[0]?.trigger("click");
    await filterButtons[1]?.trigger("click");
    await filterButtons[2]?.trigger("click");

    expect(wrapper.emitted("set-owned")?.flat()).toEqual([true, false, null]);
  });

  it("passes decklist props to export component", () => {
    const wrapper = mountComponent({ decklistAvailable: true, decklistCopied: true });
    const exportStub = wrapper.findComponent(DecklistExportStub);

    expect(exportStub.props("disabled")).toBe(false);
    expect(exportStub.props("copied")).toBe(true);
  });
});
