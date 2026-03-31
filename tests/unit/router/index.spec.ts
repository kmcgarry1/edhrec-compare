import { describe, expect, it } from "vitest";
import router from "../../../src/router";

describe("router commander route split", () => {
  it("loads the landing dashboard and commander route from different components", async () => {
    const home = router.getRoutes().find((route) => route.name === "home");
    const commander = router.getRoutes().find((route) => route.name === "commander");

    const homeLoader = home?.components?.default as (() => Promise<{ default: { __name?: string } }>) | undefined;
    const commanderLoader = commander?.components?.default as (() => Promise<{ default: { __name?: string } }>) | undefined;

    expect(homeLoader).toBeTypeOf("function");
    expect(commanderLoader).toBeTypeOf("function");
    expect(homeLoader).not.toBe(commanderLoader);

    const homeComponent = await homeLoader?.();
    const commanderComponent = await commanderLoader?.();

    expect(homeComponent?.default.__name).toBe("Dashboard");
    expect(commanderComponent?.default.__name).toBe("CommanderRoutePage");
  });
});
