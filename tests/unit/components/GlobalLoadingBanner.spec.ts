import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, h } from "vue";
import GlobalLoadingBanner from "../../../src/components/GlobalLoadingBanner.vue";

const scopedLoading = ref(false);
const scopedMessage = ref("Scoped loading...");
const globalLoading = ref(false);
const globalMessage = ref("Global loading");

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => ({
    isLoading: globalLoading,
    loadingMessage: globalMessage,
    getScopeLoading: () => scopedLoading,
    getScopeMessage: () => scopedMessage,
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
});
