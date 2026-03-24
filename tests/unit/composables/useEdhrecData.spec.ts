import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";

const withLoading = vi.hoisted(() => vi.fn(async (action: () => Promise<unknown>) => await action()));
const getScopeLoading = vi.hoisted(() => vi.fn(() => ref(false)));
const dedupe = vi.hoisted(() => vi.fn());
const handleError = vi.hoisted(() =>
  vi.fn((_error, options: { fallbackMessage: string }) => ({
    userMessage: options.fallbackMessage,
  }))
);

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => ({
    withLoading,
    getScopeLoading,
  }),
}));

vi.mock("../../../src/api/requestCache", () => ({
  requestCache: {
    dedupe,
  },
}));

vi.mock("../../../src/utils/errorHandler", () => ({
  handleError,
}));

describe("useEdhrecData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies a deduped payload even when the fetcher is shared by another consumer", async () => {
    const payload = {
      header: "Atraxa, Grand Unifier (Commander)",
      container: {
        json_dict: {
          cardlists: [
            {
              header: "Top Cards",
              cardviews: [{ id: "sol-ring", name: "Sol Ring" }],
            },
          ],
        },
      },
    };

    dedupe.mockResolvedValue(payload);

    const { useEdhrecData } = await import("../../../src/composables/useEdhrecData");
    const url = ref("https://json.edhrec.com/pages/commanders/atraxa-grand-unifier.json");
    const composable = useEdhrecData(url);

    await Promise.resolve();
    await Promise.resolve();

    expect(dedupe).toHaveBeenCalledWith(
      "edhrec:https://json.edhrec.com/pages/commanders/atraxa-grand-unifier.json",
      expect.any(Function)
    );
    expect(composable.data.value).toEqual(payload);
    expect(composable.cardlists.value).toEqual(payload.container.json_dict.cardlists);
    expect(composable.totalCardCount.value).toBe(1);
  });
});
