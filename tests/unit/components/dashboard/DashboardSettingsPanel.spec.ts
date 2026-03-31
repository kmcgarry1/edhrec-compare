import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import DashboardSettingsPanel from "../../../../src/components/dashboard/DashboardSettingsPanel.vue";

const baseProps = {
  open: true,
  hasCsvData: true,
  inventorySummary: "243 cards loaded. Filters now match your collection.",
  decklistText: "1 Sol Ring",
  decklistSectionCount: 8,
  exportHelperText: "Copy or download the filtered decklist for your deck builder.",
  copied: false,
  density: "cozy",
  densityOptions: [
    { value: "comfortable", label: "Comfortable" },
    { value: "cozy", label: "Cozy" },
    { value: "compact", label: "Compact" },
  ] as const,
  theme: "light",
  backgroundEnabled: true,
} as const;

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
};

const mountComponent = (overrideProps = {}) =>
  mount(DashboardSettingsPanel, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
    attachTo: document.body,
    global: {
      stubs: {
        Teleport: true,
        Transition: false,
      },
    },
  });

describe("DashboardSettingsPanel", () => {
  beforeEach(() => {
    setViewportWidth(1440);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("opens on desktop, closes on outside click, and keeps display controls available", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[data-testid="dashboard-settings-panel"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Density, theme, and accessibility");
    expect(wrapper.text()).not.toContain("Copy or download the filtered decklist");
    expect(wrapper.text()).not.toContain("Replace CSV");

    const buttons = wrapper.findAll("button");
    await buttons.find((button) => button.text() === "Close")?.trigger("click");
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(wrapper.emitted("close")).toBeTruthy();
    wrapper.unmount();
  });

  it("renders only display controls and wires theme, background, and density changes", async () => {
    const wrapper = mountComponent({
      decklistText: "",
      copied: true,
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Accessibility");
    expect(wrapper.text()).not.toContain("Copy or download the filtered decklist");
    expect(wrapper.findAll('[data-testid^="header-"]')).toHaveLength(0);

    await wrapper.get('button[aria-label="Switch to dark theme"]').trigger("click");
    await wrapper.get('button[aria-label="Hide background texture"]').trigger("click");
    await wrapper.findAll("button").find((button) => button.text() === "Compact")?.trigger("click");

    expect(wrapper.emitted("toggle-theme")).toBeTruthy();
    expect(wrapper.emitted("toggle-background")).toBeTruthy();
    expect(wrapper.emitted("density-change")?.[0]).toEqual(["compact"]);
    wrapper.unmount();
  });

  it("uses a modal dialog on mobile viewports", async () => {
    setViewportWidth(390);
    const wrapper = mountComponent();
    await flushPromises();

    const dialog = wrapper.get('[data-testid="dashboard-settings-dialog"]');
    expect(dialog.attributes("role")).toBe("dialog");
    expect(dialog.attributes("aria-modal")).toBe("true");
    wrapper.unmount();
  });
});
