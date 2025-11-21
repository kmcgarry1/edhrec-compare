import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "vue";
import * as Sentry from "@sentry/vue";

// Mock Sentry module
vi.mock("@sentry/vue", () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  withScope: vi.fn((callback) => callback({ setContext: vi.fn() })),
  setUser: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
  replayIntegration: vi.fn(() => ({})),
}));

// Import after mocking
import {
  initSentry,
  captureError,
  setUserContext,
  clearUserContext,
} from "../../../src/utils/sentry";

describe("sentry", () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    // Save original environment
    originalEnv = {
      PROD: import.meta.env.PROD as string | undefined,
      DEV: import.meta.env.DEV as string | undefined,
      MODE: import.meta.env.MODE as string | undefined,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN as string | undefined,
    };

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    Object.assign(import.meta.env, originalEnv);
  });

  describe("initSentry", () => {
    it("returns false in development mode", () => {
      import.meta.env.PROD = false;
      import.meta.env.DEV = true;

      const app = createApp({});
      const result = initSentry(app);

      expect(result).toBe(false);
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it("returns false when DSN is not configured", () => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_SENTRY_DSN = "";

      const app = createApp({});
      const result = initSentry(app);

      expect(result).toBe(false);
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it("returns false when DSN is whitespace only", () => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_SENTRY_DSN = "   ";

      const app = createApp({});
      const result = initSentry(app);

      expect(result).toBe(false);
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it("initializes Sentry in production with valid DSN", () => {
      import.meta.env.PROD = true;
      import.meta.env.MODE = "production";
      import.meta.env.VITE_SENTRY_DSN = "https://example@sentry.io/123";

      const app = createApp({});
      const result = initSentry(app);

      expect(result).toBe(true);
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          app,
          dsn: "https://example@sentry.io/123",
          environment: "production",
          tracesSampleRate: 0.1,
        })
      );
    });

    it("configures integrations correctly", () => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_SENTRY_DSN = "https://example@sentry.io/123";

      const app = createApp({});
      initSentry(app);

      expect(Sentry.browserTracingIntegration).toHaveBeenCalled();
      expect(Sentry.replayIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          maskAllText: true,
          blockAllMedia: true,
        })
      );
    });

    it("filters out CSV-related breadcrumbs in beforeSend", () => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_SENTRY_DSN = "https://example@sentry.io/123";

      const app = createApp({});
      initSentry(app);

      const initCall = (Sentry.init as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const event = {
        breadcrumbs: [
          { message: "User clicked button", category: "ui" },
          { message: "CSV uploaded", category: "csv" },
          { data: { csv: "data" }, category: "data" },
        ],
        contexts: {
          csv: { data: "sensitive" },
          browser: { name: "Chrome" },
        },
      };

      const result = beforeSend(event, {});

      expect(result.breadcrumbs).toHaveLength(1);
      expect(result.breadcrumbs[0].message).toBe("User clicked button");
      expect(result.contexts.csv).toBeUndefined();
      expect(result.contexts.browser).toBeDefined();
    });

    it("returns false and logs error if Sentry.init throws", () => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_SENTRY_DSN = "https://example@sentry.io/123";

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (Sentry.init as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error("Init failed");
      });

      const app = createApp({});
      const result = initSentry(app);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to initialize Sentry:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("captureError", () => {
    it("captures error without context", () => {
      const error = new Error("Test error");
      captureError(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it("captures error with context", () => {
      const error = new Error("Test error");
      const context = { component: "TestComponent", action: "click" };

      captureError(error, context);

      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it("silently handles errors if Sentry.captureException fails", () => {
      (Sentry.captureException as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error("Capture failed");
      });

      const error = new Error("Test error");

      expect(() => captureError(error)).not.toThrow();
    });
  });

  describe("setUserContext", () => {
    it("sets user context with id", () => {
      const user = { id: "user123" };
      setUserContext(user);

      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it("sets user context with username", () => {
      const user = { username: "testuser" };
      setUserContext(user);

      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it("sets user context with both id and username", () => {
      const user = { id: "user123", username: "testuser" };
      setUserContext(user);

      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it("silently handles errors if Sentry.setUser fails", () => {
      (Sentry.setUser as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error("SetUser failed");
      });

      expect(() => setUserContext({ id: "user123" })).not.toThrow();
    });
  });

  describe("clearUserContext", () => {
    it("clears user context by setting to null", () => {
      clearUserContext();

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it("silently handles errors if Sentry.setUser fails", () => {
      (Sentry.setUser as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error("SetUser failed");
      });

      expect(() => clearUserContext()).not.toThrow();
    });
  });
});
