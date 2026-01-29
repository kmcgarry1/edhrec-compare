import { describe, it, expect, beforeEach } from "vitest";
import { useCsvUploadMode, type CsvUploadMode } from "../../../src/composables/useCsvUploadMode";

describe("useCsvUploadMode", () => {
  let instance1: ReturnType<typeof useCsvUploadMode>;
  let instance2: ReturnType<typeof useCsvUploadMode>;

  beforeEach(() => {
    // Create fresh instances for each test
    instance1 = useCsvUploadMode();
    instance2 = useCsvUploadMode();
    // Reset to default state
    instance1.setMode("compare");
  });

  it("initializes with 'compare' mode", () => {
    const { mode } = useCsvUploadMode();
    expect(mode.value).toBe("compare");
  });

  it("updates mode to 'top-50'", () => {
    instance1.setMode("top-50");
    expect(instance1.mode.value).toBe("top-50");
  });

  it("updates mode back to 'compare'", () => {
    instance1.setMode("top-50");
    instance1.setMode("compare");
    expect(instance1.mode.value).toBe("compare");
  });

  it("shares state across multiple instances", () => {
    instance1.setMode("top-50");
    expect(instance2.mode.value).toBe("top-50");

    instance2.setMode("compare");
    expect(instance1.mode.value).toBe("compare");
  });

  it("exposes mode as reactive ref", () => {
    const { mode, setMode } = useCsvUploadMode();
    const initialValue = mode.value;

    setMode("top-50");
    expect(mode.value).not.toBe(initialValue);
    expect(mode.value).toBe("top-50");
  });

  it("accepts valid CsvUploadMode values", () => {
    const modes: CsvUploadMode[] = ["compare", "top-50"];

    modes.forEach((modeValue) => {
      instance1.setMode(modeValue);
      expect(instance1.mode.value).toBe(modeValue);
    });
  });
});
