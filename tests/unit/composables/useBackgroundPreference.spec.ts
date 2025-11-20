import { describe, it, expect, beforeEach, vi } from "vitest";

const modulePath = "../../../src/composables/useBackgroundPreference";
const loadPreference = () =>
  vi.importActual<typeof import("../../../src/composables/useBackgroundPreference")>(modulePath);

describe("useBackgroundPreference", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("should initialize with default value true", async () => {
    const { useBackgroundPreference } = await loadPreference();
    const { backgroundEnabled } = useBackgroundPreference();
    expect(backgroundEnabled.value).toBe(true);
  });

  it("should load false from localStorage if stored", async () => {
    localStorage.setItem("edhrec-background-enabled", "false");
    const { useBackgroundPreference } = await loadPreference();
    const { backgroundEnabled } = useBackgroundPreference();
    expect(backgroundEnabled.value).toBe(false);
  });

  it("should set background enabled and persist to localStorage", async () => {
    const { useBackgroundPreference } = await loadPreference();
    const { setBackgroundEnabled, backgroundEnabled } = useBackgroundPreference();
    setBackgroundEnabled(false);
    expect(backgroundEnabled.value).toBe(false);
    expect(localStorage.getItem("edhrec-background-enabled")).toBe("false");
  });

  it("should toggle background preference", async () => {
    const { useBackgroundPreference } = await loadPreference();
    const { toggleBackground, backgroundEnabled } = useBackgroundPreference();
    const initialValue = backgroundEnabled.value;
    toggleBackground();
    expect(backgroundEnabled.value).toBe(!initialValue);
    expect(localStorage.getItem("edhrec-background-enabled")).toBe(
      (!initialValue).toString()
    );
  });

  it("should toggle background multiple times", async () => {
    const { useBackgroundPreference } = await loadPreference();
    const { toggleBackground, backgroundEnabled } = useBackgroundPreference();
    toggleBackground();
    expect(backgroundEnabled.value).toBe(false);
    toggleBackground();
    expect(backgroundEnabled.value).toBe(true);
    expect(localStorage.getItem("edhrec-background-enabled")).toBe("true");
  });

  it("should share state between multiple calls", async () => {
    const { useBackgroundPreference } = await loadPreference();
    const first = useBackgroundPreference();
    const second = useBackgroundPreference();
    first.setBackgroundEnabled(false);
    expect(second.backgroundEnabled.value).toBe(false);
  });
});
