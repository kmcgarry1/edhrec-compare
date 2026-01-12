import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NebulaBackground from "../../../src/components/NebulaBackground.vue";

describe("NebulaBackground", () => {
  it("renders the component with base structure", () => {
    const wrapper = mount(NebulaBackground);
    expect(
      wrapper.find(".nebula.fixed.inset-0.-z-10.overflow-hidden.pointer-events-none").exists()
    ).toBe(true);
    expect(wrapper.findAll(".nebula > div")).toHaveLength(7);
    expect(wrapper.find(".nebula__art--primary").exists()).toBe(true);
    expect(wrapper.find(".nebula__art--secondary").exists()).toBe(true);
    expect(wrapper.find(".nebula__base").exists()).toBe(true);
    expect(wrapper.find(".nebula__glow").exists()).toBe(true);
    expect(wrapper.find(".nebula__particles--fine").exists()).toBe(true);
    expect(wrapper.find(".nebula__particles--coarse").exists()).toBe(true);
    expect(wrapper.find(".nebula__noise").exists()).toBe(true);
  });

  it("marks the layers as decorative", () => {
    const wrapper = mount(NebulaBackground);
    wrapper.findAll(".nebula > div").forEach((layer) => {
      expect(layer.attributes("aria-hidden")).toBe("true");
    });
  });
});
