import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { App } from "vue";

const notifyError = vi.fn();
const captureError = vi.fn();

vi.mock("../../../src/composables/useGlobalNotices", () => ({
  useGlobalNotices: () => ({
    notifyError,
  }),
}));

vi.mock("../../../src/utils/sentry", () => ({
  captureError,
}));

describe("handleError", () => {
  beforeEach(() => {
    notifyError.mockClear();
    captureError.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("normalizes errors and notifies when requested", async () => {
    const { handleError, AppError } = await import("../../../src/utils/errorHandler");
    const error = new Error("Boom");
    (error as Error & { code?: string }).code = "E_TEST";

    const normalized = handleError(error, {
      notify: true,
      fallbackMessage: "Fallback",
      context: "Test",
    });

    expect(normalized).toBeInstanceOf(AppError);
    expect(normalized.message).toBe("Boom");
    expect(normalized.userMessage).toBe("Fallback");
    expect(normalized.code).toBe("E_TEST");
    expect(notifyError).toHaveBeenCalledWith("Fallback", "Test");
  });

  it("ignores benign errors", async () => {
    const { handleError } = await import("../../../src/utils/errorHandler");

    handleError("ResizeObserver loop limit exceeded", {
      notify: true,
      fallbackMessage: "Fallback",
      context: "Test",
    });

    expect(notifyError).not.toHaveBeenCalled();
  });

  it("reports errors in production", async () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("PROD", true);
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    const { handleError } = await import("../../../src/utils/errorHandler");
    handleError(new Error("Prod boom"), {
      notify: false,
      fallbackMessage: "Fallback",
      context: "Prod",
    });

    expect(captureError).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/log-error",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});

describe("setupAppErrorHandling", () => {
  beforeEach(() => {
    vi.resetModules();
    notifyError.mockClear();
    captureError.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers global listeners and sets app handler", async () => {
    const { setupAppErrorHandling } = await import("../../../src/utils/errorHandler");
    const addListenerSpy = vi.spyOn(window, "addEventListener");

    const app = { config: {} } as App;
    setupAppErrorHandling(app);

    expect(typeof app.config.errorHandler).toBe("function");
    app.config.errorHandler?.(
      new Error("Render error"),
      { $options: { name: "TestComponent" } } as unknown as App,
      "render"
    );

    expect(notifyError).toHaveBeenCalled();
    expect(addListenerSpy).toHaveBeenCalledWith("error", expect.any(Function));
    expect(addListenerSpy).toHaveBeenCalledWith("unhandledrejection", expect.any(Function));

    const callCount = addListenerSpy.mock.calls.length;
    setupAppErrorHandling(app);
    expect(addListenerSpy.mock.calls.length).toBe(callCount);
  });
});
