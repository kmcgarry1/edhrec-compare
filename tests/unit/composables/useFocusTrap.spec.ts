import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useFocusTrap } from "../../../src/composables/useFocusTrap";

const FocusTrapHarness = defineComponent({
  name: "FocusTrapHarness",
  template: `
    <div>
      <button id="outside" type="button">Outside</button>
      <div id="trap-container" ref="container" @escape-pressed="handleEscape">
        <button id="first" type="button">First</button>
        <button id="last" type="button">Last</button>
      </div>
      <output id="escape-count">{{ escapeEvents }}</output>
    </div>
  `,
  setup() {
    const container = ref<HTMLElement | null>(null);
    const isActive = ref(false);
    const escapeEvents = ref(0);
    const { activate, deactivate } = useFocusTrap(container, isActive);

    const handleEscape = () => {
      escapeEvents.value += 1;
    };

    const setActiveState = (value: boolean) => {
      isActive.value = value;
    };

    return {
      container,
      handleEscape,
      activate,
      deactivate,
      setActiveState,
      escapeEvents,
    };
  },
});

const mountHarness = () =>
  mount(FocusTrapHarness, {
    attachTo: document.body,
  });

describe("useFocusTrap", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("focuses the container and sets tabindex when activated", async () => {
    const wrapper = mountHarness();
    const outsideButton = wrapper.get("#outside").element as HTMLButtonElement;
    outsideButton.focus();

    await nextTick();
    expect(document.activeElement).toBe(outsideButton);

    wrapper.vm.setActiveState(true);
    wrapper.vm.activate();
    await nextTick();

    const container = wrapper.get("#trap-container").element as HTMLElement;
    expect(container.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(container);

    wrapper.unmount();
  });

  it("restores focus to the element that was active before activation", async () => {
    const wrapper = mountHarness();
    const outsideButton = wrapper.get("#outside").element as HTMLButtonElement;

    outsideButton.focus();
    wrapper.vm.setActiveState(true);
    wrapper.vm.activate();
    await nextTick();

    wrapper.vm.deactivate();
    await nextTick();

    expect(document.activeElement).toBe(outsideButton);
    wrapper.unmount();
  });

  it("loops focus between the first and last focusable elements when tabbing", async () => {
    const wrapper = mountHarness();
    const firstButton = wrapper.get("#first").element as HTMLButtonElement;
    const lastButton = wrapper.get("#last").element as HTMLButtonElement;

    wrapper.vm.setActiveState(true);
    await nextTick();

    lastButton.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    expect(document.activeElement).toBe(firstButton);

    firstButton.focus();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true })
    );
    expect(document.activeElement).toBe(lastButton);

    wrapper.unmount();
  });

  it("dispatches escape events while active", async () => {
    const wrapper = mountHarness();
    wrapper.vm.setActiveState(true);
    await nextTick();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    expect(wrapper.get("#escape-count").text()).toBe("1");

    wrapper.unmount();
  });
});
