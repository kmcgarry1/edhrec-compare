import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardUtilityContent from "../../../../src/components/dashboard/DashboardUtilityContent.vue";

const mountComponent = (overrides = {}) =>
  mount(DashboardUtilityContent, {
    props: {
      hasCommander: false,
      hasCsvData: false,
      inventorySummary: "No collection loaded.",
      collectionModeLabel: "Commander compare",
      collectionModeHint: "Upload a CSV to compare ownership.",
      collectionSourceName: null,
      collectionImportedAt: null,
      decklistText: null,
      decklistCopied: false,
      exportHelperText: "Copy or download the filtered list.",
      density: "comfortable",
      densityOptions: [
        { value: "comfortable", label: "Comfortable" },
        { value: "cozy", label: "Cozy" },
        { value: "compact", label: "Compact" },
      ],
      theme: "dark",
      backgroundEnabled: true,
      ...overrides,
    },
    global: {
      stubs: {
        DashboardSettingsContent: {
          template:
            "<section class='settings-stub'><button class='density-trigger' @click=\"$emit('density-change', 'compact')\">Density</button><button class='theme-trigger' @click=\"$emit('toggle-theme')\">Theme</button><button class='background-trigger' @click=\"$emit('toggle-background')\">Background</button></section>",
        },
        DecklistExport: {
          template:
            "<section class='export-stub'><button class='copy-trigger' @click=\"$emit('copy')\">Copy</button><button class='download-trigger' @click=\"$emit('download')\">Download</button></section>",
          props: ["disabled", "copied"],
        },
        TopCommanderScanPanel: { template: "<section class='scan-stub'></section>" },
        SiteNotice: { template: "<footer class='notice-stub'></footer>" },
      },
    },
  });

describe("DashboardUtilityContent", () => {
  it("renders upload guidance when no collection is loaded", () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("CSV pending");
    expect(wrapper.text()).toContain("Upload when you want collection overlays");
    expect(wrapper.text()).toContain("Open this tray whenever you need collection status");
    expect(wrapper.find(".export-stub").exists()).toBe(false);
  });

  it("summarizes loaded collection source details and emits collection actions", async () => {
    const wrapper = mountComponent({
      hasCsvData: true,
      inventorySummary: "42 rows loaded.",
      collectionSourceName: "collection.csv",
      collectionImportedAt: new Date("2026-09-10T13:05:00Z"),
    });

    expect(wrapper.text()).toContain("Collection loaded");
    expect(wrapper.text()).toContain("Collection overlays are ready");
    expect(wrapper.text()).toContain("42 rows loaded.");
    expect(wrapper.text()).toContain("collection.csv loaded");

    await wrapper.findAll("button").find((button) => button.text() === "Replace CSV")?.trigger("click");
    await wrapper.findAll("button").find((button) => button.text() === "Clear collection")?.trigger("click");

    expect(wrapper.emitted("open-upload")).toHaveLength(1);
    expect(wrapper.emitted("clear-upload")).toHaveLength(1);
  });

  it("renders export controls for active commanders and forwards settings events", async () => {
    const wrapper = mountComponent({
      hasCommander: true,
      hasCsvData: true,
      decklistText: "1 Sol Ring",
      decklistCopied: true,
    });

    await wrapper.get(".copy-trigger").trigger("click");
    await wrapper.get(".download-trigger").trigger("click");
    await wrapper.get(".density-trigger").trigger("click");
    await wrapper.get(".theme-trigger").trigger("click");
    await wrapper.get(".background-trigger").trigger("click");

    expect(wrapper.emitted("copy-decklist")).toHaveLength(1);
    expect(wrapper.emitted("download-decklist")).toHaveLength(1);
    expect(wrapper.emitted("density-change")).toEqual([["compact"]]);
    expect(wrapper.emitted("toggle-theme")).toHaveLength(1);
    expect(wrapper.emitted("toggle-background")).toHaveLength(1);
  });
});
