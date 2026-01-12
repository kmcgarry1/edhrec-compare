import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

  afterEach(() => {
    document.body.innerHTML = "";
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

  it("renders notice styling based on type", () => {
    noticesRef.value = [
      { id: 2, type: "error", title: "Oops", message: "Something failed" },
    ];

    mount(GlobalNoticeStack, {
      attachTo: document.body,
    });

    const notice = document.body.querySelector("[role='status']");
    expect(notice?.className).toContain("border-[color:var(--danger)]");
    expect(notice?.getAttribute("aria-live")).toBe("assertive");
  });

  it("renders nothing when there are no notices", () => {
    noticesRef.value = [];
    mount(GlobalNoticeStack, {
      attachTo: document.body,
    });

    expect(document.body.querySelector("[role='status']")).toBeNull();
  });

  it("renders info notices with default styling", () => {
    noticesRef.value = [
      { id: 3, type: "info", title: "Heads up", message: "FYI" },
    ];
    mount(GlobalNoticeStack, {
      attachTo: document.body,
    });

    const notice = document.body.querySelector("[role='status']");
    expect(notice?.textContent ?? "").toContain("Heads up");
    expect(notice?.className).toContain("border-[color:var(--border)]");
  });
});
