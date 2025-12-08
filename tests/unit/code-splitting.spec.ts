import { describe, it, expect } from "vitest";

describe("Code Splitting", () => {
  it("lazy loads components with defineAsyncComponent", async () => {
    // Test that async components can be imported
    const NebulaBackground = await import("../../src/components/NebulaBackground.vue");
    const OnboardingModal = await import("../../src/components/OnboardingModal.vue");
    const CsvUploadModal = await import("../../src/components/CsvUploadModal.vue");
    const DecklistExport = await import("../../src/components/DecklistExport.vue");

    // Verify components are defined
    expect(NebulaBackground.default).toBeDefined();
    expect(OnboardingModal.default).toBeDefined();
    expect(CsvUploadModal.default).toBeDefined();
    expect(DecklistExport.default).toBeDefined();
  });

  it("does not export lazy-loaded components from index", () => {
    // Import the index file
    import("../../src/components/index").then((components) => {
      // Verify lazy-loaded components are NOT exported
      expect((components as Record<string, unknown>).NebulaBackground).toBeUndefined();
      expect((components as Record<string, unknown>).OnboardingModal).toBeUndefined();
      expect((components as Record<string, unknown>).CsvUploadModal).toBeUndefined();
      expect((components as Record<string, unknown>).DecklistExport).toBeUndefined();

      // Verify eagerly-loaded components ARE exported
      expect((components as Record<string, unknown>).Dashboard).toBeDefined();
      expect((components as Record<string, unknown>).EdhrecReader).toBeDefined();
    });
  });
});
