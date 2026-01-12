import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import CsvUploadModal from "../../../src/components/CsvUploadModal.vue";

const activate = vi.fn();
const deactivate = vi.fn();

vi.mock("../../../src/composables/useFocusTrap", () => ({
  useFocusTrap: () => ({
    activate,
    deactivate,
  }),
}));

const mountComponent = (open = true) =>
  mount(CsvUploadModal, {
    attachTo: document.body,
    props: { open },
    global: {
      stubs: {
        Card: { template: "<div class='card-stub'><slot /></div>" },
        CSVUpload: { template: "<div class='csv-upload-stub' />" },
      },
    },
  });

describe("CsvUploadModal", () => {
  beforeEach(() => {
    activate.mockClear();
    deactivate.mockClear();
    document.body.innerHTML = "";
  });

  it("renders dialog content when open", () => {
    mountComponent(true);
    expect(document.body.textContent).toContain("Import your CSV");
    expect(document.body.querySelector("[role='dialog']")).toBeTruthy();
  });

  it("does not render dialog when closed", () => {
    mountComponent(false);
    expect(document.body.querySelector("[role='dialog']")).toBeNull();
  });

  it("emits close when backdrop is clicked", async () => {
    const wrapper = mountComponent(true);
    const dialog = document.body.querySelector("[role='dialog']");
    dialog?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("emits close when close button is clicked", async () => {
    const wrapper = mountComponent(true);
    const closeButton = document.body.querySelector(
      "button[aria-label='Close upload dialog']"
    );
    closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("activates and deactivates focus trap with open state", async () => {
    const wrapper = mountComponent(false);
    expect(deactivate).toHaveBeenCalled();

    await wrapper.setProps({ open: true });
    expect(activate).toHaveBeenCalled();
  });
});
