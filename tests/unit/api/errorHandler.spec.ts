import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiCall } from "../../../src/api/errorHandler";

const handleError = vi.hoisted(() => vi.fn(() => new Error("normalized")));

vi.mock("../../../src/utils/errorHandler", () => ({
  handleError,
}));

describe("apiCall", () => {
  beforeEach(() => {
    handleError.mockClear();
  });

  it("returns resolved value when call succeeds", async () => {
    const result = await apiCall(async () => "ok", "Failed");
    expect(result).toBe("ok");
    expect(handleError).not.toHaveBeenCalled();
  });

  it("throws normalized error when call fails", async () => {
    await expect(
      apiCall(async () => {
        throw new Error("boom");
      }, "Failed")
    ).rejects.toThrow("normalized");

    expect(handleError).toHaveBeenCalledWith(expect.any(Error), {
      notify: true,
      fallbackMessage: "Failed",
      context: "apiCall",
    });
  });

  it("returns fallback when suppressError is true", async () => {
    const result = await apiCall(
      async () => {
        throw new Error("boom");
      },
      "Failed",
      {
        suppressError: true,
        fallbackValue: [],
        notify: false,
        context: "Custom",
      }
    );

    expect(result).toEqual([]);
    expect(handleError).toHaveBeenCalledWith(expect.any(Error), {
      notify: false,
      fallbackMessage: "Failed",
      context: "Custom",
    });
  });
});
