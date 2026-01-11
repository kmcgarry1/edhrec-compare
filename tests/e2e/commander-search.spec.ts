import { test, expect } from "@playwright/test";
import { dismissOnboarding, selectCommander, setupApp } from "./test-helpers";

test.describe("Commander search", () => {
  test("searches and selects a commander", async ({ page }) => {
    await setupApp(page);
    await dismissOnboarding(page);

    await selectCommander(page, "Atraxa, Grand Unifier");

    await expect(page.getByLabel("Search primary commander")).toHaveValue(
      "Atraxa, Grand Unifier"
    );
    await expect(
      page.getByRole("heading", { name: "Atraxa, Grand Unifier" })
    ).toBeVisible();
    await page.waitForURL(/commander\/atraxa-grand-unifier/);
    expect(new URL(page.url()).pathname).toContain(
      "/commander/atraxa-grand-unifier"
    );
  });

  test("supports partner commanders", async ({ page }) => {
    await setupApp(page);
    await dismissOnboarding(page);

    await page.getByLabel("This commander has partner").click();
    const partnerInput = page.getByLabel("Search partner commander");
    await expect(partnerInput).toBeVisible();
    await expect(partnerInput).toBeDisabled();
    await expect(
      page.getByText("Select a primary commander before choosing a partner.")
    ).toBeVisible();

    await selectCommander(page, "Tymna the Weaver");
    await expect(partnerInput).toBeEnabled();

    await partnerInput.fill("Thrasios");
    const partnerOption = page
      .locator("li", { hasText: "Thrasios, Triton Hero" })
      .first();
    await expect(partnerOption).toBeVisible();
    await partnerOption.click();

    await expect(
      page.getByRole("heading", { name: "Tymna the Weaver" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Thrasios, Triton Hero" })
    ).toBeVisible();
    await page.waitForURL(/commander\/thrasios-triton-hero-tymna-the-weaver/);
    expect(new URL(page.url()).pathname).toContain(
      "commander/thrasios-triton-hero-tymna-the-weaver"
    );
  });

  test("handles typos in commander search", async ({ page }) => {
    await setupApp(page, {
      searchResults: {
        Atraxxa: ["Atraxa, Grand Unifier"],
      },
    });
    await dismissOnboarding(page);

    await page.getByLabel("Search primary commander").fill("Atraxxa");
    await expect(
      page.locator("li", { hasText: "Atraxa, Grand Unifier" }).first()
    ).toBeVisible();
  });
});
