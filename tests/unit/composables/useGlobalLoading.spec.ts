import { describe, it, expect, beforeEach, vi } from "vitest";

type GlobalLoadingModule = typeof import("../../../src/composables/useGlobalLoading");
let useGlobalLoading: GlobalLoadingModule["useGlobalLoading"];
let composable: ReturnType<GlobalLoadingModule["useGlobalLoading"]>;

beforeEach(async () => {
  vi.resetModules();
  ({ useGlobalLoading } = await vi.importActual<GlobalLoadingModule>(
    "../../../src/composables/useGlobalLoading"
  ));
  composable = useGlobalLoading();
});

describe("useGlobalLoading", () => {
  describe("default scope loading", () => {
    it("should start with isLoading false", () => {
      expect(composable.isLoading.value).toBe(false);
    });

    it("should set isLoading to true when startLoading is called", () => {
      composable.startLoading();
      expect(composable.isLoading.value).toBe(true);
    });

    it("should set isLoading to false when stopLoading is called", () => {
      composable.startLoading();
      composable.stopLoading();
      expect(composable.isLoading.value).toBe(false);
    });

    it("should handle multiple startLoading calls", () => {
      composable.startLoading();
      composable.startLoading();
      composable.startLoading();
      expect(composable.isLoading.value).toBe(true);
    });

    it("should require matching stopLoading calls", () => {
      composable.startLoading();
      composable.startLoading();
      composable.stopLoading();
      expect(composable.isLoading.value).toBe(true);
      composable.stopLoading();
      expect(composable.isLoading.value).toBe(false);
    });

    it("should not go negative when stopLoading is called without startLoading", () => {
      composable.stopLoading();
      composable.stopLoading();
      expect(composable.isLoading.value).toBe(false);
    });
  });

  describe("loading messages", () => {
    it("should have default message 'Loading...'", () => {
      composable.startLoading();
      expect(composable.loadingMessage.value).toBe("Loading...");
    });

    it("should set custom message when provided", () => {
      composable.startLoading("Fetching data...");
      expect(composable.loadingMessage.value).toBe("Fetching data...");
    });

    it("should keep custom message across multiple startLoading calls", () => {
      composable.startLoading("Custom message");
      composable.startLoading();
      expect(composable.loadingMessage.value).toBe("Custom message");
    });

    it("should update message when new status is provided", () => {
      composable.startLoading("First message");
      composable.startLoading("Second message");
      expect(composable.loadingMessage.value).toBe("Second message");
    });

    it("should clear message when loading stops", () => {
      composable.startLoading("Test message");
      composable.stopLoading();
      expect(composable.loadingMessage.value).toBe("Loading...");
    });
  });

  describe("scoped loading", () => {
    it("should handle custom scopes independently", () => {
      composable.startLoading(undefined, "scope1");
      composable.startLoading(undefined, "scope2");

      const scope1Loading = composable.getScopeLoading("scope1");
      const scope2Loading = composable.getScopeLoading("scope2");

      expect(scope1Loading.value).toBe(true);
      expect(scope2Loading.value).toBe(true);
      expect(composable.isLoading.value).toBe(false);
    });

    it("should stop scoped loading independently", () => {
      composable.startLoading(undefined, "scope1");
      composable.startLoading(undefined, "scope2");

      composable.stopLoading("scope1");

      const scope1Loading = composable.getScopeLoading("scope1");
      const scope2Loading = composable.getScopeLoading("scope2");

      expect(scope1Loading.value).toBe(false);
      expect(scope2Loading.value).toBe(true);
    });

    it("should handle scoped messages", () => {
      composable.startLoading("Scope1 message", "scope1");
      composable.startLoading("Scope2 message", "scope2");

      const scope1Message = composable.getScopeMessage("scope1");
      const scope2Message = composable.getScopeMessage("scope2");

      expect(scope1Message.value).toBe("Scope1 message");
      expect(scope2Message.value).toBe("Scope2 message");
    });

    it("should return false for non-existent scope", () => {
      const scopeLoading = composable.getScopeLoading("nonexistent");
      expect(scopeLoading.value).toBe(false);
    });

    it("should return default message for non-existent scope", () => {
      const scopeMessage = composable.getScopeMessage("nonexistent");
      expect(scopeMessage.value).toBe("Loading...");
    });
  });

  describe("progress tracking", () => {
    it("should initialize progress when total is provided", () => {
      composable.startLoading("Loading with progress", "custom", 10);
      const progress = composable.getScopeProgress("custom");
      expect(progress.value).toEqual({ current: 0, total: 10 });
    });

    it("should update progress", () => {
      composable.startLoading("Loading", "custom", 5);
      composable.updateProgress("custom", 3);
      const progress = composable.getScopeProgress("custom");
      expect(progress.value).toEqual({ current: 3, total: 5 });
    });

    it("should not exceed total in progress", () => {
      composable.startLoading("Loading", "custom", 5);
      composable.updateProgress("custom", 10);
      const progress = composable.getScopeProgress("custom");
      expect(progress.value).toEqual({ current: 5, total: 5 });
    });

    it("should clear progress when loading stops", () => {
      composable.startLoading("Loading", "custom", 5);
      composable.updateProgress("custom", 3);
      composable.stopLoading("custom");
      const progress = composable.getScopeProgress("custom");
      expect(progress.value).toBeUndefined();
    });

    it("should not set progress if total is not provided", () => {
      composable.startLoading("Loading", "custom");
      const progress = composable.getScopeProgress("custom");
      expect(progress.value).toBeUndefined();
    });

    it("should return undefined for non-existent scope progress", () => {
      const progress = composable.getScopeProgress("nonexistent");
      expect(progress.value).toBeUndefined();
    });
  });

  describe("withLoading", () => {
    it("should set loading during async operation", async () => {
      const action = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 10)));

      const promise = composable.withLoading(action);
      expect(composable.isLoading.value).toBe(true);

      await promise;
      expect(composable.isLoading.value).toBe(false);
      expect(action).toHaveBeenCalledOnce();
    });

    it("should return the result of the action", async () => {
      const result = await composable.withLoading(async () => "test result");
      expect(result).toBe("test result");
    });

    it("should set custom status message", async () => {
      const promise = composable.withLoading(async () => "result", "Processing...");
      expect(composable.loadingMessage.value).toBe("Processing...");
      await promise;
    });

    it("should clear loading even if action throws", async () => {
      const action = vi.fn(() => Promise.reject(new Error("Test error")));

      await expect(composable.withLoading(action)).rejects.toThrow("Test error");
      expect(composable.isLoading.value).toBe(false);
    });

    it("should work with custom scope", async () => {
      const scopeLoading = composable.getScopeLoading("custom");

      const promise = composable.withLoading(async () => "result", "Custom scope", "custom");

      expect(scopeLoading.value).toBe(true);
      expect(composable.isLoading.value).toBe(false);

      await promise;
      expect(scopeLoading.value).toBe(false);
    });

    it("should initialize progress when total is provided", async () => {
      const scopeProgress = composable.getScopeProgress("custom");
      const promise = composable.withLoading(
        async () => "result",
        "Loading with progress",
        "custom",
        5
      );

      expect(scopeProgress.value).toEqual({ current: 0, total: 5 });
      await promise;
    });
  });

  describe("reactive behavior", () => {
    it("should trigger computed updates when loading state changes", () => {
      const updates: boolean[] = [];

      updates.push(composable.isLoading.value);

      composable.startLoading();
      updates.push(composable.isLoading.value);

      composable.stopLoading();
      updates.push(composable.isLoading.value);

      expect(updates).toEqual([false, true, false]);
    });
  });
});
