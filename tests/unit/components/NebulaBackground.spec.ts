import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NebulaBackground from "../../../src/components/NebulaBackground.vue";

describe("NebulaBackground", () => {
  it("renders the component with base structure", () => {
    const wrapper = mount(NebulaBackground);
    expect(
      wrapper.find(".fixed.inset-0.-z-10.overflow-hidden.pointer-events-none").exists()
    ).toBe(true);
    expect(wrapper.findAll(".absolute.inset-0")).toHaveLength(1);
  });

  it("applies the pattern layer styles", () => {
    const wrapper = mount(NebulaBackground);
    const layer = wrapper.find(".absolute.inset-0");
    const style = layer.attributes("style");
    expect(style).toContain("background-image");
    expect(style).toContain("linear-gradient");
    expect(style).toContain("radial-gradient");
  });

  it("marks the pattern layer as decorative", () => {
    const wrapper = mount(NebulaBackground);
    const layer = wrapper.find(".absolute.inset-0");
    expect(layer.attributes("aria-hidden")).toBe("true");
  });
});
