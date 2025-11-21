import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SkeletonCard from "../../../src/components/SkeletonCard.vue";

describe("SkeletonCard", () => {
  it("renders skeleton card with proper structure", () => {
    const wrapper = mount(SkeletonCard);

    expect(wrapper.find(".skeleton-card").exists()).toBe(true);
    expect(wrapper.find(".animate-pulse").exists()).toBe(true);
  });

  it("has proper accessibility attributes", () => {
    const wrapper = mount(SkeletonCard);
    const container = wrapper.find('[role="status"]');

    expect(container.exists()).toBe(true);
    expect(container.attributes("aria-label")).toBe("Loading card data");
  });

  it("renders image and details placeholders", () => {
    const wrapper = mount(SkeletonCard);

    // Check for image placeholder
    const imagePlaceholder = wrapper.find(".h-32.w-24");
    expect(imagePlaceholder.exists()).toBe(true);

    // Check for detail placeholders
    const detailPlaceholders = wrapper.findAll(".bg-slate-200.dark\\:bg-slate-700");
    expect(detailPlaceholders.length).toBeGreaterThanOrEqual(3);
  });
});
