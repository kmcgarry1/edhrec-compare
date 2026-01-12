import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import OnboardingModal from "../../../src/components/OnboardingModal.vue";

const activate = vi.fn();
const deactivate = vi.fn();

vi.mock("../../../src/composables/useFocusTrap", () => ({
  useFocusTrap: () => ({
    activate,
    deactivate,
  }),
}));

const mountComponent = (open = true) =>
  mount(OnboardingModal, {
    attachTo: document.body,
    props: { open },
    global: {
      stubs: {
        Card: { template: "<div class='card-stub'><slot /></div>" },
      },
    },
  });

describe("OnboardingModal", () => {
  beforeEach(() => {
    activate.mockClear();
    deactivate.mockClear();
    document.body.innerHTML = "";
  });

  it("renders when open", () => {
    mountComponent(true);
    expect(document.body.textContent).toContain("First-time setup");
  });

  it("does not render when closed", () => {
    mountComponent(false);
    expect(document.body.textContent).not.toContain("First-time setup");
  });

  it("emits upload and dismiss events", async () => {
    const wrapper = mountComponent(true);
    const uploadButton = document.body.querySelector(
      '[aria-label="Upload CSV collection file"]'
    );
    const dismissButton = document.body.querySelector(
      '[aria-label="Start searching commanders without uploading"]'
    );

    uploadButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    dismissButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(wrapper.emitted("upload")).toBeTruthy();
    expect(wrapper.emitted("dismiss")).toBeTruthy();
  });

  it("toggles focus trap when open changes", async () => {
    const wrapper = mountComponent(false);
    expect(deactivate).toHaveBeenCalled();

    await wrapper.setProps({ open: true });
    expect(activate).toHaveBeenCalled();
  });
});
