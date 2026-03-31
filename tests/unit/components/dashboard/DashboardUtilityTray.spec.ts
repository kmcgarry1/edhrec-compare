import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import DashboardUtilityTray from "../../../../src/components/dashboard/DashboardUtilityTray.vue";

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
};

const mountComponent = (open = true) =>
  mount(DashboardUtilityTray, {
    props: {
      open,
      title: "Collection, export, and display settings",
      description: "Secondary dashboard actions stay here so the compare canvas can stay focused.",
    },
    attachTo: document.body,
    slots: {
      default: "<div class='utility-slot-stub'>Tray content</div>",
    },
    global: {
      stubs: {
        Teleport: true,
        CButton: {
          template: "<button v-bind=\"$attrs\" @click=\"$emit('click')\"><slot /></button>",
        },
        CText: {
          template: "<span v-bind=\"$attrs\"><slot /></span>",
        },
      },
    },
  });

describe("DashboardUtilityTray", () => {
  beforeEach(() => {
    setViewportWidth(1440);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a desktop drawer by default and delegates close actions", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.get('[data-testid="dashboard-utility-tray"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Collection, export, and display settings");
    expect(wrapper.text()).toContain("Tray content");

    await wrapper.findAll("button").find((button) => button.text() === "Close")?.trigger("click");

    expect(wrapper.emitted("close")?.[0]).toEqual([]);
  });

  it("renders a mobile bottom sheet under the dashboard breakpoint", async () => {
    setViewportWidth(390);
    const wrapper = mountComponent();
    await flushPromises();

    const dialog = wrapper.get('[data-testid="dashboard-utility-sheet"]');
    expect(dialog.exists()).toBe(true);
    expect(wrapper.find('[data-testid="dashboard-utility-tray"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("Collection, export, and display settings");
  });
});
