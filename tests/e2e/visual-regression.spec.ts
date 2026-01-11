import { test, expect } from "@playwright/test";
import {
  disableAnimations,
  dismissOnboarding,
  selectCommander,
  setupApp,
} from "./test-helpers";

test.describe("Visual regression", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("onboarding modal snapshot", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Only run visual snapshots on chromium"
    );
    await page.addInitScript(() => {
      window.localStorage.setItem("edhrec-color-scheme", "light");
    });
    await setupApp(page);
    await disableAnimations(page);

    await expect(page.getByText("First-time setup")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveScreenshot(
      "onboarding-modal.png"
    );
  });

  test("cardlist section snapshot", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Only run visual snapshots on chromium"
    );
    await page.addInitScript(() => {
      window.localStorage.setItem("edhrec-color-scheme", "light");
    });
    await setupApp(page);
    await disableAnimations(page);
    await dismissOnboarding(page);
    await selectCommander(page, "Atraxa, Grand Unifier");

    const section = page.locator("article").filter({ hasText: "New Cards" }).first();
    await expect(section).toBeVisible();
    await expect(section).toHaveScreenshot("cardlist-new-cards.png", {
      maxDiffPixels: 100,
    });
  });
});
