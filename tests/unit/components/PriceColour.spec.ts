import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PriceColour from "../../../src/components/PriceColour.vue";

describe("PriceColour", () => {
  it("shows placeholder when price is missing", () => {
    const wrapper = mount(PriceColour, {
      props: {
        price: null,
        placeholder: "N/A",
      },
    });

    expect(wrapper.text()).toBe("N/A");
    expect(wrapper.classes()).toContain("inline-flex");
    expect(wrapper.classes()).toContain("text-[color:var(--muted)]");
    expect(wrapper.classes()).toContain("bg-[color:var(--surface-muted)]");
  });

  it("formats price with currency", () => {
    const wrapper = mount(PriceColour, {
      props: {
        price: 4.5,
        currency: "$",
      },
    });

    expect(wrapper.text()).toBe("$4.50");
    expect(wrapper.classes()).toContain("bg-[color:var(--tier-green-soft)]");
    expect(wrapper.classes()).toContain("text-[color:var(--tier-green)]");
  });

  it("can render without pill styling", () => {
    const wrapper = mount(PriceColour, {
      props: {
        price: 10,
        pill: false,
        tag: "span",
        align: "start",
      },
    });

    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.classes()).toContain("tabular-nums");
    expect(wrapper.classes()).toContain("text-[color:var(--tier-orange)]");
  });
});
