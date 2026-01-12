import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, nextTick } from "vue";

const artUrls = ref<string[]>([]);

const loadComponent = async () => {
  vi.doMock("../../../src/composables/useBackgroundArt", () => ({
    useBackgroundArt: () => ({ artUrls }),
  }));
  const module = await import("../../../src/components/NebulaBackground.vue");
  return module.default;
};

describe("NebulaBackground", () => {
  beforeEach(() => {
    artUrls.value = [];
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the component with base structure", async () => {
    const NebulaBackground = await loadComponent();
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

  it("marks the layers as decorative", async () => {
    const NebulaBackground = await loadComponent();
    const wrapper = mount(NebulaBackground);
    wrapper.findAll(".nebula > div").forEach((layer) => {
      expect(layer.attributes("aria-hidden")).toBe("true");
    });
  });

  it("cycles through background art URLs", async () => {
    vi.useFakeTimers();
    artUrls.value = ["https://example.com/one.jpg", "https://example.com/two.jpg"];
    const NebulaBackground = await loadComponent();
    const wrapper = mount(NebulaBackground);

    await nextTick();
    const primary = wrapper.get(".nebula__art--primary");
    expect(primary.attributes("style")).toContain("one.jpg");

    vi.advanceTimersByTime(12000);
    await nextTick();
    const secondary = wrapper.get(".nebula__art--secondary");
    expect(secondary.attributes("style")).toContain("two.jpg");
    expect(secondary.classes()).toContain("is-visible");

    vi.advanceTimersByTime(1800);
    await nextTick();
    expect(primary.attributes("style")).toContain("two.jpg");
    expect(secondary.classes()).not.toContain("is-visible");
  });

  it("clears art when URLs are removed", async () => {
    artUrls.value = ["https://example.com/one.jpg"];
    const NebulaBackground = await loadComponent();
    const wrapper = mount(NebulaBackground);
    await nextTick();

    const primary = wrapper.get(".nebula__art--primary");
    expect(primary.attributes("style")).toContain("one.jpg");

    artUrls.value = [];
    await nextTick();

    expect(primary.attributes("style") ?? "").not.toContain("one.jpg");
  });

  it("does not schedule a fade when only one URL is present", async () => {
    vi.useFakeTimers();
    artUrls.value = ["https://example.com/solo.jpg"];
    const NebulaBackground = await loadComponent();
    const wrapper = mount(NebulaBackground);

    await nextTick();
    const primary = wrapper.get(".nebula__art--primary");
    const secondary = wrapper.get(".nebula__art--secondary");

    vi.advanceTimersByTime(12000);
    await nextTick();

    expect(primary.attributes("style")).toContain("solo.jpg");
    expect(secondary.classes()).not.toContain("is-visible");
  });
});
