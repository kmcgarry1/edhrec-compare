import { describe, it, expect, vi } from "vitest";
import { mapWithConcurrency } from "../../../src/utils/concurrency";

describe("mapWithConcurrency", () => {
  it("processes all items with concurrency limit", async () => {
    const items = [1, 2, 3, 4, 5];
    const mapper = vi.fn(async (item: number) => item * 2);

    const results = await mapWithConcurrency(items, 2, mapper);

    expect(results).toEqual([2, 4, 6, 8, 10]);
    expect(mapper).toHaveBeenCalledTimes(5);
  });

  it("maintains correct order of results", async () => {
    const items = [1, 2, 3, 4, 5];
    // Simulate items taking different amounts of time
    const mapper = async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, (6 - item) * 10));
      return item * 2;
    };

    const results = await mapWithConcurrency(items, 3, mapper);

    expect(results).toEqual([2, 4, 6, 8, 10]);
  });

  it("handles empty array", async () => {
    const items: number[] = [];
    const mapper = vi.fn(async (item: number) => item * 2);

    const results = await mapWithConcurrency(items, 2, mapper);

    expect(results).toEqual([]);
    expect(mapper).not.toHaveBeenCalled();
  });

  it("passes correct index to mapper", async () => {
    const items = ["a", "b", "c"];
    const mapper = vi.fn(async (item: string, index: number) => `${item}-${index}`);

    const results = await mapWithConcurrency(items, 2, mapper);

    expect(results).toEqual(["a-0", "b-1", "c-2"]);
    expect(mapper).toHaveBeenCalledWith("a", 0);
    expect(mapper).toHaveBeenCalledWith("b", 1);
    expect(mapper).toHaveBeenCalledWith("c", 2);
  });

  it("respects concurrency limit", async () => {
    const items = [1, 2, 3, 4, 5];
    let activeCount = 0;
    let maxActive = 0;

    const mapper = async (item: number) => {
      activeCount++;
      maxActive = Math.max(maxActive, activeCount);
      await new Promise((resolve) => setTimeout(resolve, 50));
      activeCount--;
      return item * 2;
    };

    await mapWithConcurrency(items, 2, mapper);

    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it("handles single item", async () => {
    const items = [42];
    const mapper = vi.fn(async (item: number) => item * 2);

    const results = await mapWithConcurrency(items, 5, mapper);

    expect(results).toEqual([84]);
    expect(mapper).toHaveBeenCalledTimes(1);
  });

  it("handles concurrency limit greater than array length", async () => {
    const items = [1, 2, 3];
    const mapper = vi.fn(async (item: number) => item * 2);

    const results = await mapWithConcurrency(items, 10, mapper);

    expect(results).toEqual([2, 4, 6]);
    expect(mapper).toHaveBeenCalledTimes(3);
  });

  it("handles errors in mapper function", async () => {
    const items = [1, 2, 3];
    const mapper = async (item: number) => {
      if (item === 2) {
        throw new Error("Test error");
      }
      return item * 2;
    };

    await expect(mapWithConcurrency(items, 2, mapper)).rejects.toThrow("Test error");
  });

  it("works with different data types", async () => {
    interface TestItem {
      id: number;
      name: string;
    }

    const items: TestItem[] = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ];

    const mapper = async (item: TestItem) => ({
      ...item,
      name: item.name.toUpperCase(),
    });

    const results = await mapWithConcurrency(items, 2, mapper);

    expect(results).toEqual([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
      { id: 3, name: "C" },
    ]);
  });
});
