import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DecklistExport from "../../../src/components/DecklistExport.vue";

describe("DecklistExport", () => {
  it("renders copy and download buttons", () => {
    const wrapper = mount(DecklistExport, {
      props: { disabled: false, copied: false },
    });

    expect(wrapper.get("[data-testid='header-copy-decklist']").text()).toContain(
      "Copy Decklist"
    );
    expect(wrapper.get("[data-testid='header-download-decklist']").text()).toContain(
      "Download decklist.txt"
    );
  });

  it("emits copy and download events", async () => {
    const wrapper = mount(DecklistExport, {
      props: { disabled: false, copied: false },
    });

    await wrapper.get("[data-testid='header-copy-decklist']").trigger("click");
    await wrapper.get("[data-testid='header-download-decklist']").trigger("click");

    expect(wrapper.emitted("copy")).toBeTruthy();
    expect(wrapper.emitted("download")).toBeTruthy();
  });

  it("disables actions when disabled", () => {
    const wrapper = mount(DecklistExport, {
      props: { disabled: true, copied: false },
    });

    const copyButton = wrapper.get("[data-testid='header-copy-decklist']");
    const downloadButton = wrapper.get("[data-testid='header-download-decklist']");

    expect(copyButton.attributes("disabled")).toBeDefined();
    expect(downloadButton.attributes("disabled")).toBeDefined();
  });

  it("shows copied label when copied", () => {
    const wrapper = mount(DecklistExport, {
      props: { disabled: false, copied: true },
    });

    expect(wrapper.get("[data-testid='header-copy-decklist']").text()).toContain("Copied!");
  });
});
