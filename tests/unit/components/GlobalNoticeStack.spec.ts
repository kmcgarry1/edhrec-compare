import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import GlobalNoticeStack from "../../../src/components/GlobalNoticeStack.vue";

const noticesRef = ref([
  { id: 1, type: "success", title: "Uploaded", message: "CSV loaded" },
]);
const dismissNotice = vi.fn();

vi.mock("../../../src/composables/useGlobalNotices", () => ({
  useGlobalNotices: () => ({
    notices: noticesRef,
    dismissNotice,
  }),
}));

describe("GlobalNoticeStack", () => {
  beforeEach(() => {
    noticesRef.value = [
      { id: 1, type: "success", title: "Uploaded", message: "CSV loaded" },
    ];
    dismissNotice.mockClear();
  });

  it("renders notices from the global store", () => {
    mount(GlobalNoticeStack, {
      attachTo: document.body,
    });

    const teleported = document.body.querySelector("[role='status']");
    expect(teleported?.textContent ?? "").toContain("Uploaded");
    expect(teleported?.textContent ?? "").toContain("CSV loaded");
  });

  it("dismisses notices when close button is clicked", async () => {
    mount(GlobalNoticeStack, {
      attachTo: document.body,
    });

    const closeButton = document.body.querySelector("button");
    closeButton?.dispatchEvent(new Event("click", { bubbles: true }));
    await flushPromises();
    expect(dismissNotice).toHaveBeenCalledWith(1);
  });
});
