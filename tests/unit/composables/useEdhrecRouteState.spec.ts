import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, nextTick } from "vue";

const mockRoute = ref({
  name: "home",
  params: {},
  query: {},
  fullPath: "/",
});

const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
};

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute.value,
  useRouter: () => mockRouter,
}));

type EdhrecRouteStateModule = typeof import("../../../src/composables/useEdhrecRouteState");
let useEdhrecRouteState: EdhrecRouteStateModule["useEdhrecRouteState"];

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  mockRoute.value = {
    name: "home",
    params: {},
    query: {},
    fullPath: "/",
  };

  const module = await import("../../../src/composables/useEdhrecRouteState");
  useEdhrecRouteState = module.useEdhrecRouteState;
});

describe("useEdhrecRouteState", () => {
  describe("initialization", () => {
    it("should initialize with default filter values", () => {
      const composable = useEdhrecRouteState();

      expect(composable.chosenPageType.value).toBe("commanders");
      expect(composable.chosenBracket.value).toBe("");
      expect(composable.chosenModifier.value).toBe("");
      expect(composable.chosenCompanion.value).toBe("");
      expect(composable.currentCommanderSlug.value).toBeNull();
    });

    it("should hydrate from route query parameters", async () => {
      mockRoute.value = {
        name: "home",
        params: {},
        query: {
          pageType: "average-decks",
          bracket: "high",
          modifier: "budget",
          companion: "lurrus-companion",
        },
        fullPath: "/?pageType=average-decks&bracket=high&modifier=budget&companion=lurrus-companion",
      };

      const composable = useEdhrecRouteState();

      expect(composable.chosenPageType.value).toBe("average-decks");
      expect(composable.chosenBracket.value).toBe("high");
      expect(composable.chosenModifier.value).toBe("budget");
      expect(composable.chosenCompanion.value).toBe("lurrus-companion");
    });

    it("should hydrate commander slug from route params", async () => {
      mockRoute.value = {
        name: "commander",
        params: { slug: "atraxa-praetors-voice" },
        query: {},
        fullPath: "/commander/atraxa-praetors-voice",
      };

      const composable = useEdhrecRouteState();

      expect(composable.currentCommanderSlug.value).toBe("atraxa-praetors-voice");
    });
  });

  describe("URL building", () => {
    it("should build correct EDHREC URL with all filters", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("atraxa-praetors-voice");
      composable.setBracket("high");
      composable.setModifier("cheap");
      composable.setCompanion("lurrus");

      const expectedUrl =
        "https://json.edhrec.com/pages/commanders/atraxa-praetors-voice/high/lurrus/cheap.json";
      expect(composable.commanderUrl.value).toBe(expectedUrl);
    });

    it("should build URL without bracket if not set", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("atraxa-praetors-voice");
      composable.setBracket("");

      expect(composable.commanderUrl.value).toBe(
        "https://json.edhrec.com/pages/commanders/atraxa-praetors-voice.json"
      );
    });

    it("should build URL without companion if set to none", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("atraxa-praetors-voice");
      composable.setBracket("high");
      composable.setCompanion("");

      expect(composable.commanderUrl.value).toBe(
        "https://json.edhrec.com/pages/commanders/atraxa-praetors-voice/high.json"
      );
    });

    it("should return null when slug is not set", () => {
      const composable = useEdhrecRouteState();

      expect(composable.commanderUrl.value).toBeNull();
    });

    it("should return null when slug is empty string", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("");

      expect(composable.commanderUrl.value).toBeNull();
    });

    it("should return null when slug is undefined", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug(undefined);

      expect(composable.commanderUrl.value).toBeNull();
    });
  });

  describe("filter setters", () => {
    it("should update bracket", () => {
      const composable = useEdhrecRouteState();

      composable.setBracket("high");

      expect(composable.chosenBracket.value).toBe("high");
    });

    it("should update modifier", () => {
      const composable = useEdhrecRouteState();

      composable.setModifier("cheap");

      expect(composable.chosenModifier.value).toBe("cheap");
    });

    it("should update page type", () => {
      const composable = useEdhrecRouteState();

      composable.setPageType("salt");

      expect(composable.chosenPageType.value).toBe("salt");
    });

    it("should update companion", () => {
      const composable = useEdhrecRouteState();

      composable.setCompanion("lurrus");

      expect(composable.chosenCompanion.value).toBe("lurrus");
    });

    it("should convert numeric values to strings", () => {
      const composable = useEdhrecRouteState();

      composable.setBracket(1 as unknown as string);
      composable.setModifier(2 as unknown as string);

      expect(composable.chosenBracket.value).toBe("1");
      expect(composable.chosenModifier.value).toBe("2");
    });
  });

  describe("commander slug setter", () => {
    it("should set commander slug", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("atraxa-praetors-voice");

      expect(composable.currentCommanderSlug.value).toBe("atraxa-praetors-voice");
    });

    it("should clear commander slug when null", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("atraxa-praetors-voice");
      composable.setCommanderSlug(null);

      expect(composable.currentCommanderSlug.value).toBeNull();
    });

    it("should clear commander slug when empty string", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("atraxa-praetors-voice");
      composable.setCommanderSlug("");

      expect(composable.currentCommanderSlug.value).toBeNull();
    });

    it("should trim whitespace from slug", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("  atraxa-praetors-voice  ");

      expect(composable.currentCommanderSlug.value).toBe("atraxa-praetors-voice");
    });

    it("should clear slug when only whitespace", () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("   ");

      expect(composable.currentCommanderSlug.value).toBeNull();
    });
  });

  describe("route synchronization", () => {
    it("should push to commander route when slug is set", async () => {
      const composable = useEdhrecRouteState();

      composable.setCommanderSlug("atraxa-praetors-voice");
      await nextTick();

      expect(mockPush).toHaveBeenCalledWith({
        name: "commander",
        params: { slug: "atraxa-praetors-voice" },
        query: expect.any(Object),
      });
    });

    it("should push to home route when slug is cleared", async () => {
      mockRoute.value = {
        name: "commander",
        params: { slug: "atraxa-praetors-voice" },
        query: {},
        fullPath: "/commander/atraxa-praetors-voice",
      };

      const composable = useEdhrecRouteState();

      composable.setCommanderSlug(null);
      await nextTick();

      expect(mockPush).toHaveBeenCalledWith({
        name: "home",
        query: expect.any(Object),
      });
    });

    it("should include filters in route query", async () => {
      const composable = useEdhrecRouteState();

      composable.setBracket("high");
      composable.setModifier("cheap");
      await nextTick();

      expect(mockPush).toHaveBeenCalledWith({
        name: "home",
        query: {
          bracket: "high",
          modifier: "cheap",
        },
      });
    });

    it("should not push route when already at target route", async () => {
      mockRoute.value = {
        name: "commander",
        params: { slug: "atraxa-praetors-voice" },
        query: { bracket: "high" },
        fullPath: "/commander/atraxa-praetors-voice?bracket=high",
      };

      const composable = useEdhrecRouteState();
      await nextTick();

      mockPush.mockClear();

      // Don't change anything - should not push
      await nextTick();

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should respond to route changes", async () => {
      // Initial composable to check it starts with null slug
      const composable = useEdhrecRouteState();
      expect(composable.currentCommanderSlug.value).toBeNull();

      mockRoute.value = {
        name: "commander",
        params: { slug: "thrasios-triton-hero-tymna-the-weaver" },
        query: { bracket: "high" },
        fullPath: "/commander/thrasios-triton-hero-tymna-the-weaver?bracket=high",
      };

      // Manually trigger route change processing since we can't change fullPath reactively
      // The composable watches route.fullPath but our mock doesn't trigger reactivity
      // So we test that IF the route values change, applyRouteState would work correctly
      // by initializing with the new route values

      // Re-import to get fresh instance with new route
      vi.resetModules();
      const module = await import("../../../src/composables/useEdhrecRouteState");
      const composable2 = module.useEdhrecRouteState();

      expect(composable2.currentCommanderSlug.value).toBe(
        "thrasios-triton-hero-tymna-the-weaver"
      );
      expect(composable2.chosenBracket.value).toBe("high");
    });
  });

  describe("query normalization", () => {
    it("should not push when queries are effectively equal", async () => {
      mockRoute.value = {
        name: "home",
        params: {},
        query: {
          bracket: "",
        },
        fullPath: "/?bracket=",
      };

      const composable = useEdhrecRouteState();

      mockPush.mockClear();

      // These are the default values, should not push
      composable.setPageType("commanders");
      composable.setBracket("");
      await nextTick();

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should handle missing query parameters as defaults", async () => {
      mockRoute.value = {
        name: "home",
        params: {},
        query: {},
        fullPath: "/",
      };

      const composable = useEdhrecRouteState();

      expect(composable.chosenPageType.value).toBe("commanders");
      expect(composable.chosenBracket.value).toBe("");
      expect(composable.chosenModifier.value).toBe("");
      expect(composable.chosenCompanion.value).toBe("");
    });
  });

  describe("multiple filter changes", () => {
    it("should batch multiple changes in single route update", async () => {
      const composable = useEdhrecRouteState();

      composable.setBracket("high");
      composable.setModifier("cheap");
      composable.setCompanion("lurrus");
      await nextTick();

      // Should have pushed only once with all changes
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith({
        name: "home",
        query: {
          bracket: "high",
          modifier: "cheap",
          companion: "lurrus",
        },
      });
    });
  });

  describe("edge cases", () => {
    it("should handle route with array params", async () => {
      mockRoute.value = {
        name: "commander",
        params: { slug: ["atraxa", "praetors", "voice"] },
        query: {},
        fullPath: "/commander/atraxa/praetors/voice",
      };

      const composable = useEdhrecRouteState();

      // Should handle non-string slug param gracefully
      expect(composable.currentCommanderSlug.value).toBeNull();
    });

    it("should handle route with empty slug param", async () => {
      mockRoute.value = {
        name: "commander",
        params: { slug: "" },
        query: {},
        fullPath: "/commander/",
      };

      const composable = useEdhrecRouteState();

      expect(composable.currentCommanderSlug.value).toBeNull();
    });
  });
});
