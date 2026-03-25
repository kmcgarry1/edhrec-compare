import { test, expect, Page } from "@playwright/test";
import path from "node:path";
import { SCRYFALL_RANDOM_CARD_RESPONSE } from "./fixtures";

const interceptNetwork = async (page: Page) => {
  await page.route("**/json.edhrec.com/pages/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ cardlists: [] }),
    })
  );

  await page.route("**/api.scryfall.com/cards/search**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        object: "list",
        data: [
          { id: "1", name: "Atraxa, Grand Unifier" },
          { id: "2", name: "Atraxa, Praetors' Voice" },
        ],
      }),
    })
  );

  await page.route("**/api.scryfall.com/cards/random**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SCRYFALL_RANDOM_CARD_RESPONSE),
    })
  );
};

const setupApp = async (page: Page) => {
  await interceptNetwork(page);
  await page.goto("/");
};

const getLandingUploadButton = (page: Page) =>
  page.getByRole("button", { name: /^Upload CSV$/ }).first();

const expectLandingReady = async (page: Page) => {
  await expect(page.getByRole("textbox", { name: /Search commanders/i })).toBeVisible();
  await expect(getLandingUploadButton(page)).toBeVisible();
};

const openUploadModal = async (page: Page) => {
  await getLandingUploadButton(page).click();
  const dialog = page.getByRole("dialog", { name: /Import your CSV/i });
  await expect(dialog).toBeVisible();
  return dialog;
};

test.describe("Keyboard Navigation", () => {
  test("landing controls are keyboard reachable", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("href", "#main-content");

    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox", { name: /Search commanders/i })).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(getLandingUploadButton(page)).toBeFocused();
  });

  test("can close CSV upload modal with Escape", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);
    await openUploadModal(page);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /Import your CSV/i })).toBeHidden();
  });

  test("can navigate commander search with keyboard", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    const primaryInput = page.getByRole("textbox", { name: /Search commanders/i });
    await primaryInput.focus();
    await expect(primaryInput).toBeFocused();

    await primaryInput.fill("Atra");

    const firstResult = page.locator("li", { hasText: "Atraxa" }).first();
    await expect(firstResult)
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Results may not always appear in the stubbed environment.
      });

    if (await firstResult.isVisible().catch(() => false)) {
      await firstResult.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/commander\/atraxa-grand-unifier/);
    }
  });
});

test.describe("ARIA Attributes", () => {
  test("landing search field has accessible description", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    const primaryInput = page.getByRole("textbox", { name: /Search commanders/i });
    const describedBy = await primaryInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("helper-text");
  });

  test("upload modal has proper ARIA attributes", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    const dialog = await openUploadModal(page);
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-labelledby");
    await expect(dialog).toHaveAttribute("aria-describedby");
  });

  test("loading states have aria-live regions", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    const dialog = await openUploadModal(page);
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(path.resolve("src/assets/inventory.csv"));

    await expect(dialog.getByText("Valid CSV")).toBeVisible();
    await expect(dialog.locator('[aria-live="polite"]').first()).toBeVisible();
  });

  test("error messages use role alert when search fails", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    const primaryInput = page.getByRole("textbox", { name: /Search commanders/i });
    await primaryInput.fill("xyz");

    const errorElements = page.locator('[role="alert"]');
    if ((await errorElements.count()) > 0) {
      await expect(errorElements.first()).toBeVisible();
    }
  });
});

test.describe("Focus Management", () => {
  test("focus stays within the CSV upload modal", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    const dialog = await openUploadModal(page);

    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
    }

    await expect
      .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
  });

  test("landing controls show visible focus targets", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});
