import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import TopCommandersColorFilter from "../../../../src/components/top-commanders/TopCommandersColorFilter.vue";
import type { CommanderColor } from "../../../../src/utils/colorIdentity";

vi.mock("../../../../src/composables/useScryfallSymbols", () => ({
  useScryfallSymbols: () => ({
    ensureSymbolsLoaded: vi.fn(),
    getSvgForSymbol: (token: string) => `${token}.svg`,
  }),
}));

const colorOptions: CommanderColor[] = ["W", "U", "B", "R", "G", "C"];

const mountComponent = (selectedColors: CommanderColor[] = []) =>
  mount(TopCommandersColorFilter, {
    props: {
      colorOptions,
      selectedColors,
      colorPillClass: (color) => `pill-${color}`,
      colorLabel: (color) => `${color} mana`,
    },
  });

describe("TopCommandersColorFilter", () => {
  it("renders mana-symbol style controls with accessible labels", () => {
    const wrapper = mountComponent(["G"]);
    const greenButton = wrapper.get("button[aria-label='G mana']");

    expect(greenButton.attributes("aria-pressed")).toBe("true");
    expect(greenButton.classes()).toContain("pill-G");
    expect(greenButton.text()).toBe("");
    expect(greenButton.get("img").attributes("src")).toBe("{G}.svg");
    expect(greenButton.get("img").attributes("alt")).toBe("Green");
    expect(wrapper.text()).not.toContain("Green");
  });

  it("emits color toggles and clear actions", async () => {
    const wrapper = mountComponent(["U"]);

    await wrapper.get("button[aria-label='W mana']").trigger("click");
    await wrapper.get("button:last-of-type").trigger("click");

    expect(wrapper.emitted("toggle-color")?.[0]).toEqual(["W"]);
    expect(wrapper.emitted("clear")).toBeTruthy();
  });
});
