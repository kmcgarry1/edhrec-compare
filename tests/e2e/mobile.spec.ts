import { test, expect } from "@playwright/test";
import { dismissOnboarding, selectCommander, setupApp } from "./test-helpers";

test.describe("Mobile experience", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("toolkit can be expanded and collapsed", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-chromium",
      "Only run on the mobile project"
    );
    await setupApp(page);
    await dismissOnboarding(page);

    const showToolkit = page.getByRole("button", { name: /Show toolkit/i });
    await expect(showToolkit).toBeVisible();
    await showToolkit.click();

    const hideToolkit = page.getByRole("button", { name: /Hide toolkit/i });
    await expect(hideToolkit).toBeVisible();
    await hideToolkit.click();

    await expect(showToolkit).toBeVisible();
  });

  test("renders mobile card rows instead of the table", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-chromium",
      "Only run on the mobile project"
    );
    await setupApp(page);
    await dismissOnboarding(page);
    await selectCommander(page, "Atraxa, Grand Unifier");

    await expect(page.getByRole("button", { name: /Sol Ring/i })).toBeVisible();
    await expect(page.getByRole("table")).toBeHidden();
  });
});
