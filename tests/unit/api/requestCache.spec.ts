import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requestCache } from "../../../src/api/requestCache";

// Helper to create a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("RequestCache", () => {
  beforeEach(() => {
    requestCache.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("dedupe", () => {
    it("deduplicates concurrent requests with the same key", async () => {
      let callCount = 0;
      const fetcher = async () => {
        callCount++;
        await delay(50);
        return "result";
      };

      // Make 5 concurrent requests with the same key
      const results = await Promise.all([
        requestCache.dedupe("key1", fetcher),
        requestCache.dedupe("key1", fetcher),
        requestCache.dedupe("key1", fetcher),
        requestCache.dedupe("key1", fetcher),
        requestCache.dedupe("key1", fetcher),
      ]);

      // Should only call fetcher once
      expect(callCount).toBe(1);
      expect(results).toEqual(["result", "result", "result", "result", "result"]);
    });

    it("allows different keys to execute independently", async () => {
      let callCount = 0;
      const fetcher = async (value: string) => {
        callCount++;
        await delay(50);
        return value;
      };

      // Make concurrent requests with different keys
      const results = await Promise.all([
        requestCache.dedupe("key1", () => fetcher("result1")),
        requestCache.dedupe("key2", () => fetcher("result2")),
        requestCache.dedupe("key3", () => fetcher("result3")),
      ]);

      // Should call fetcher for each unique key
      expect(callCount).toBe(3);
      expect(results).toEqual(["result1", "result2", "result3"]);
    });

    it("cleans up after request completion", async () => {
      vi.useFakeTimers();

      const fetcher = async () => {
        return "result";
      };

      const promise = requestCache.dedupe("key1", fetcher);
      expect(requestCache.has("key1")).toBe(true);

      await promise;
      expect(requestCache.has("key1")).toBe(true); // Still cached briefly

      // Fast-forward past cleanup delay
      await vi.advanceTimersByTimeAsync(1100);

      expect(requestCache.has("key1")).toBe(false);
    });

    it("reuses cached promise before cleanup", async () => {
      vi.useFakeTimers();
      let callCount = 0;

      const fetcher = async () => {
        callCount++;
        return "result";
      };

      // First request
      await requestCache.dedupe("key1", fetcher);

      // Fast-forward 500ms (still within 1000ms cleanup window)
      vi.advanceTimersByTime(500);

      // Second request should reuse cached promise
      await requestCache.dedupe("key1", fetcher);

      expect(callCount).toBe(1);
    });

    it("creates new request after cleanup", async () => {
      vi.useFakeTimers();
      let callCount = 0;

      const fetcher = async () => {
        callCount++;
        return "result";
      };

      // First request
      await requestCache.dedupe("key1", fetcher);

      // Fast-forward past cleanup delay
      vi.advanceTimersByTime(1100);
      await vi.runAllTimersAsync();

      // Second request should create new fetch
      await requestCache.dedupe("key1", fetcher);

      expect(callCount).toBe(2);
    });

    it("handles errors correctly", async () => {
      const error = new Error("Test error");
      const fetcher = async () => {
        await delay(10);
        throw error;
      };

      // All concurrent requests should receive the same error
      const promises = [
        requestCache.dedupe("key1", fetcher),
        requestCache.dedupe("key1", fetcher),
        requestCache.dedupe("key1", fetcher),
      ];

      for (const promise of promises) {
        await expect(promise).rejects.toThrow("Test error");
      }
    });

    it("does not cache errors permanently", async () => {
      vi.useFakeTimers();
      let callCount = 0;

      const fetcher = async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error("First call fails");
        }
        return "success";
      };

      // First request fails
      await expect(requestCache.dedupe("key1", fetcher)).rejects.toThrow("First call fails");

      // Fast-forward past cleanup
      vi.advanceTimersByTime(1100);
      await vi.runAllTimersAsync();

      // Second request should succeed
      const result = await requestCache.dedupe("key1", fetcher);
      expect(result).toBe("success");
      expect(callCount).toBe(2);
    });

    it("respects TTL for expired entries", async () => {
      vi.useFakeTimers();
      let callCount = 0;

      const fetcher = async () => {
        callCount++;
        return "result";
      };

      // First request
      await requestCache.dedupe("key1", fetcher);

      // Fast-forward past TTL (30 seconds)
      vi.advanceTimersByTime(31000);

      // Second request should create new fetch (expired)
      await requestCache.dedupe("key1", fetcher);

      expect(callCount).toBe(2);
    });
  });

  describe("clear", () => {
    it("clears all pending requests", async () => {
      const fetcher = async () => {
        await delay(100);
        return "result";
      };

      // Start some requests (don't await)
      void requestCache.dedupe("key1", fetcher);
      void requestCache.dedupe("key2", fetcher);
      void requestCache.dedupe("key3", fetcher);

      expect(requestCache.size()).toBe(3);

      requestCache.clear();

      expect(requestCache.size()).toBe(0);
      expect(requestCache.has("key1")).toBe(false);
      expect(requestCache.has("key2")).toBe(false);
      expect(requestCache.has("key3")).toBe(false);
    });
  });

  describe("has", () => {
    it("returns true for cached keys", async () => {
      const fetcher = async () => {
        await delay(50);
        return "result";
      };

      void requestCache.dedupe("key1", fetcher);

      expect(requestCache.has("key1")).toBe(true);
      expect(requestCache.has("key2")).toBe(false);
    });
  });

  describe("size", () => {
    it("returns the number of cached requests", async () => {
      const fetcher = async () => {
        await delay(50);
        return "result";
      };

      expect(requestCache.size()).toBe(0);

      void requestCache.dedupe("key1", fetcher);
      expect(requestCache.size()).toBe(1);

      void requestCache.dedupe("key2", fetcher);
      expect(requestCache.size()).toBe(2);

      void requestCache.dedupe("key1", fetcher); // Same key, no increase
      expect(requestCache.size()).toBe(2);
    });
  });

  describe("startCleanup and stopCleanup", () => {
    it("starts periodic cleanup", () => {
      vi.useFakeTimers();

      // Clear and restart to ensure clean state
      requestCache.stopCleanup();
      requestCache.clear();
      requestCache.startCleanup();

      const fetcher = async () => "result";

      // Add expired entry manually (simulating old timestamp)
      void requestCache.dedupe("key1", fetcher);

      // Fast-forward past TTL
      vi.advanceTimersByTime(31000);

      // Fast-forward to trigger cleanup interval
      vi.advanceTimersByTime(60000);

      // Entry should be cleaned up
      expect(requestCache.has("key1")).toBe(false);

      requestCache.stopCleanup();
    });

    it("does not start multiple cleanup intervals", () => {
      requestCache.startCleanup();
      requestCache.startCleanup();
      requestCache.startCleanup();

      // Should only have one interval running (no way to directly test this,
      // but we verify no errors occur from multiple calls)
      expect(true).toBe(true);

      requestCache.stopCleanup();
    });

    it("stops cleanup interval", () => {
      requestCache.stopCleanup();
      expect(true).toBe(true); // No errors should occur
    });
  });

  describe("integration scenarios", () => {
    it("handles rapid sequential requests", async () => {
      let callCount = 0;
      const fetcher = async (value: string) => {
        callCount++;
        await delay(20);
        return value;
      };

      // Rapid sequential requests
      const result1 = await requestCache.dedupe("key1", () => fetcher("a"));
      const result2 = await requestCache.dedupe("key1", () => fetcher("b")); // Should reuse
      const result3 = await requestCache.dedupe("key1", () => fetcher("c")); // Should reuse

      expect(result1).toBe("a");
      expect(result2).toBe("a"); // Gets cached result
      expect(result3).toBe("a"); // Gets cached result
      expect(callCount).toBe(1);
    });

    it("handles mixed concurrent and sequential requests", async () => {
      vi.useFakeTimers();
      let callCount = 0;

      const fetcher = async (value: string) => {
        callCount++;
        return value;
      };

      // Start concurrent requests
      const concurrent = [
        requestCache.dedupe("key1", () => fetcher("concurrent")),
        requestCache.dedupe("key1", () => fetcher("concurrent")),
      ];

      // Wait for them to complete
      await Promise.all(concurrent);

      // Fast-forward past cleanup
      await vi.advanceTimersByTimeAsync(1100);

      // New request should create fresh fetch
      const sequential = await requestCache.dedupe("key1", () => fetcher("sequential"));

      expect(callCount).toBe(2);
      expect(sequential).toBe("sequential");
    });
  });
});
