import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { reactive } from "vue";
import AccessibilityControls from "../../../src/components/AccessibilityControls.vue";

const preferences = reactive({
  reduceMotion: false,
  highContrast: false,
  focusRing: false,
  linkUnderlines: false,
  textScale: "100",
  textSpacing: false,
});

const setReduceMotion = vi.fn();
const setHighContrast = vi.fn();
const setFocusRing = vi.fn();
const setLinkUnderlines = vi.fn();
const setTextScale = vi.fn();
const setTextSpacing = vi.fn();
const resetPreferences = vi.fn();

vi.mock("../../../src/composables/useAccessibilityPreferences", () => ({
  textScaleOptions: [
    { value: "100", label: "100%" },
    { value: "110", label: "110%" },
  ],
  useAccessibilityPreferences: () => ({
    preferences,
    setReduceMotion,
    setHighContrast,
    setFocusRing,
    setLinkUnderlines,
    setTextScale,
    setTextSpacing,
    resetPreferences,
  }),
}));

describe("AccessibilityControls", () => {
  it("calls setters when options change", async () => {
    const wrapper = mount(AccessibilityControls, {
      global: {
        stubs: {
          Card: { template: "<div><slot /></div>" },
        },
      },
    });

    await wrapper.get("[data-testid='a11y-reduce-motion']").setValue(true);
    expect(setReduceMotion).toHaveBeenCalledWith(true);

    await wrapper.get("[data-testid='a11y-high-contrast']").setValue(true);
    expect(setHighContrast).toHaveBeenCalledWith(true);

    await wrapper.get("input[value='110']").setValue(true);
    expect(setTextScale).toHaveBeenCalledWith("110");

    await wrapper.get("[data-testid='a11y-reset']").trigger("click");
    expect(resetPreferences).toHaveBeenCalled();
  });
});
