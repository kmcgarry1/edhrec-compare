import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const modulePath = "../../../src/composables/useAccessibilityPreferences";
const loadComposable = () =>
  vi.importActual<typeof import("../../../src/composables/useAccessibilityPreferences")>(
    modulePath
  );

const stubMatchMedia = (matches: Record<string, boolean>) => {
  const mock = vi.fn((query: string) => ({
    matches: Boolean(matches[query]),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }));

  vi.stubGlobal("matchMedia", mock);
  return mock;
};

describe("useAccessibilityPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.style.removeProperty("--a11y-text-scale");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.className = "";
  });

  it("uses system defaults when no stored preferences exist", async () => {
    stubMatchMedia({
      "(prefers-reduced-motion: reduce)": true,
      "(prefers-contrast: more)": true,
    });

    const { useAccessibilityPreferences } = await loadComposable();
    const { preferences } = useAccessibilityPreferences();

    expect(preferences.reduceMotion).toBe(true);
    expect(preferences.highContrast).toBe(true);
    expect(document.documentElement.classList.contains("a11y-reduce-motion")).toBe(true);
    expect(document.documentElement.classList.contains("a11y-high-contrast")).toBe(true);
  });

  it("hydrates from stored preferences", async () => {
    stubMatchMedia({
      "(prefers-reduced-motion: reduce)": false,
      "(prefers-contrast: more)": false,
    });

    localStorage.setItem(
      "commander-scout:accessibility-preferences",
      JSON.stringify({
        reduceMotion: false,
        highContrast: true,
        focusRing: true,
        linkUnderlines: true,
        textScale: "120",
        textSpacing: true,
      })
    );

    const { useAccessibilityPreferences } = await loadComposable();
    const { preferences } = useAccessibilityPreferences();

    expect(preferences.highContrast).toBe(true);
    expect(preferences.focusRing).toBe(true);
    expect(preferences.linkUnderlines).toBe(true);
    expect(preferences.textScale).toBe("120");
    expect(preferences.textSpacing).toBe(true);
    expect(document.documentElement.dataset.a11yTextScale).toBe("120");
  });

  it("persists updates when preferences change", async () => {
    stubMatchMedia({
      "(prefers-reduced-motion: reduce)": false,
      "(prefers-contrast: more)": false,
    });

    const { useAccessibilityPreferences } = await loadComposable();
    const { setHighContrast, setTextScale } = useAccessibilityPreferences();

    setHighContrast(true);
    setTextScale("130");

    const stored = localStorage.getItem("commander-scout:accessibility-preferences");
    expect(stored).toContain("\"highContrast\":true");
    expect(stored).toContain("\"textScale\":\"130\"");
  });

  it("resets to system defaults", async () => {
    stubMatchMedia({
      "(prefers-reduced-motion: reduce)": false,
      "(prefers-contrast: more)": true,
    });

    const { useAccessibilityPreferences } = await loadComposable();
    const { setHighContrast, resetPreferences, preferences } = useAccessibilityPreferences();

    setHighContrast(false);
    resetPreferences();

    expect(preferences.highContrast).toBe(true);
  });
});
