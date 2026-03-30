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
        DecklistExport: {
          template:
            "<div><button data-testid='header-copy-decklist' :disabled='disabled' @click=\"$emit('copy')\">Copy</button><button data-testid='header-download-decklist' :disabled='disabled' @click=\"$emit('download')\">Download</button></div>",
          props: ["disabled", "copied"],
        },
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

  it("opens on desktop, closes on outside click, and emits upload/export actions", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[data-testid="dashboard-settings-panel"]').exists()).toBe(true);

    const buttons = wrapper.findAll("button");
    const uploadButton = buttons.find((button) => button.text().includes("Replace CSV"));
    const copyButton = wrapper.get('[data-testid="header-copy-decklist"]');
    const downloadButton = wrapper.get('[data-testid="header-download-decklist"]');

    await uploadButton?.trigger("click");
    await copyButton.trigger("click");
    await downloadButton.trigger("click");
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(wrapper.emitted("open-upload")).toBeTruthy();
    expect(wrapper.emitted("copy")).toBeTruthy();
    expect(wrapper.emitted("download")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
    wrapper.unmount();
  });

  it("renders export controls as disabled when no decklist exists and wires display controls", async () => {
    const wrapper = mountComponent({
      decklistText: "",
      copied: true,
    });
    await flushPromises();

    const exportButtons = wrapper.findAll('[data-testid^="header-"]');
    expect(exportButtons).toHaveLength(2);
    expect(exportButtons[0]?.attributes("disabled")).toBeDefined();
    expect(exportButtons[1]?.attributes("disabled")).toBeDefined();

    expect(wrapper.text()).toContain("Accessibility");

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
