import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, h } from "vue";
import GlobalLoadingBanner from "../../../src/components/GlobalLoadingBanner.vue";

const scopedLoading = ref(false);
const scopedMessage = ref("Scoped loading...");
const scopedProgress = ref<{ current: number; total: number } | undefined>(undefined);
const globalLoading = ref(false);
const globalMessage = ref("Global loading");
const globalProgress = ref<{ current: number; total: number } | undefined>(undefined);

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => ({
    isLoading: globalLoading,
    loadingMessage: globalMessage,
    loadingProgress: globalProgress,
    getScopeLoading: () => scopedLoading,
    getScopeMessage: () => scopedMessage,
    getScopeProgress: () => scopedProgress,
  }),
}));

const factory = (props = {}) =>
  mount(GlobalLoadingBanner, {
    attachTo: document.body,
    props,
    slots: {
      default: ({ message }: { message: string }) =>
        h("span", { class: "message-slot" }, message),
    },
  });

describe("GlobalLoadingBanner", () => {
  beforeEach(() => {
    scopedLoading.value = false;
    globalLoading.value = false;
    scopedMessage.value = "Scoped loading...";
    globalMessage.value = "Global loading";
    scopedProgress.value = undefined;
    globalProgress.value = undefined;
  });

  it("shows inline loader when scope is active", async () => {
    scopedLoading.value = true;
    const wrapper = factory({
      scope: "csv-upload",
      inline: true,
    });

    expect(wrapper.find(".message-slot").text()).toBe("Scoped loading...");
  });

  it("falls back to global state when no scope provided", () => {
    globalLoading.value = true;
    const wrapper = factory({ inline: true });
    expect(wrapper.find(".message-slot").text()).toBe("Global loading");
  });

  it("shows progress bar when progress is available", () => {
    scopedLoading.value = true;
    scopedProgress.value = { current: 3, total: 10 };
    const wrapper = factory({
      scope: "custom",
      inline: true,
    });

    expect(wrapper.text()).toContain("3 / 10");
  });

  it("shows spinner icon when loading", () => {
    scopedLoading.value = true;
    const wrapper = factory({
      scope: "custom",
      inline: true,
    });

    expect(wrapper.find("svg.animate-spin").exists()).toBe(true);
  });
});
