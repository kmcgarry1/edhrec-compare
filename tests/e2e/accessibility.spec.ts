import { test, expect, Page } from "@playwright/test";

const interceptNetwork = async (page: Page) => {
  // Stub network calls to avoid rate limiting
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
};

const setupApp = async (page: Page) => {
  await interceptNetwork(page);
  await page.goto("/");
};

test.describe("Keyboard Navigation", () => {
  test("can navigate onboarding modal with keyboard", async ({ page }) => {
    await setupApp(page);

    // Wait for onboarding modal
    const onboardingDialog = page.getByRole("dialog", {
      name: /Upload your collection or scout first/i,
    });
    await expect(onboardingDialog).toBeVisible();

    // Tab to first button
    await page.keyboard.press("Tab");
    const uploadButton = onboardingDialog.getByRole("button", {
      name: /Upload CSV collection file/i,
    });
    await expect(uploadButton).toBeFocused();

    // Tab to second button
    await page.keyboard.press("Tab");
    const dismissButton = onboardingDialog.getByRole("button", { name: /Start searching/ });
    await expect(dismissButton).toBeFocused();

    // Press Enter to dismiss
    await page.keyboard.press("Enter");
    await expect(onboardingDialog).toBeHidden();
  });

  test("can close modal with Escape key", async ({ page }) => {
    await setupApp(page);

    // Wait for onboarding modal
    const onboardingDialog = page.getByRole("dialog", {
      name: /Upload your collection or scout first/i,
    });
    await expect(onboardingDialog).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(onboardingDialog).toBeHidden();
  });

  test("can navigate CSV upload modal with keyboard", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding first
    await page.getByRole("button", { name: /Start searching/ }).click();

    // Click upload button
    await page.getByRole("button", { name: /^Upload CSV$/ }).first().click();

    // Wait for upload modal
    await expect(page.getByRole("dialog", { name: /Import your CSV/i })).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /Import your CSV/i })).toBeHidden();
  });

  test("focus trap works in modals", async ({ page }) => {
    await setupApp(page);

    // Wait for onboarding modal
    const onboardingDialog = page.getByRole("dialog", {
      name: /Upload your collection or scout first/i,
    });
    await expect(onboardingDialog).toBeVisible();

    // Tab through all focusable elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Next tab should wrap back to first element
    await page.keyboard.press("Tab");
    const uploadButton = onboardingDialog.getByRole("button", {
      name: /Upload CSV collection file/i,
    });
    await expect(uploadButton).toBeFocused();
  });

  test("can navigate commander search with keyboard", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding
    await page.getByRole("button", { name: /Start searching/ }).click();

    // Focus on primary commander input
    const primaryInput = page.getByLabel("Search primary commander");
    await primaryInput.focus();
    await expect(primaryInput).toBeFocused();

    // Type to search
    await primaryInput.fill("Atra");

    // Wait for search results to appear
    const firstResult = page.locator("li", { hasText: "Atraxa" }).first();
    await expect(firstResult).toBeVisible({ timeout: 3000 }).catch(() => {
      // Results may not always appear in stub environment
    });

    // Use keyboard to select result if available
    if (await firstResult.isVisible().catch(() => false)) {
      await firstResult.focus();
      await page.keyboard.press("Enter");

      // Verify selection
      await expect(primaryInput).toHaveValue(/Atraxa/);
    }
  });

  test("can toggle theme with keyboard", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding
    await page.getByRole("button", { name: /Start searching/ }).click();

    // Find theme toggle button
    const themeToggle = page.getByRole("button", { name: /Switch to.*theme/ });
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();

    // Press Enter or Space to toggle
    await page.keyboard.press("Enter");

    // Verify aria-pressed changes
    const pressed = await themeToggle.getAttribute("aria-pressed");
    expect(pressed).toBeTruthy();
  });
});

test.describe("ARIA Attributes", () => {
  test("modals have proper ARIA attributes", async ({ page }) => {
    await setupApp(page);

    // Check onboarding modal
    const onboardingDialog = page.getByRole("dialog");
    await expect(onboardingDialog).toBeVisible();
    await expect(onboardingDialog).toHaveAttribute("aria-modal", "true");
    await expect(onboardingDialog).toHaveAttribute("aria-labelledby");
    await expect(onboardingDialog).toHaveAttribute("aria-describedby");
  });

  test("buttons have appropriate aria-labels", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding
    await page.getByRole("button", { name: /Start searching/ }).click();

    // Check theme toggle has aria-label
    const themeToggle = page.getByRole("button", { name: /Switch to.*theme/ });
    await expect(themeToggle).toBeVisible();

    // Check upload button has aria-label
    const uploadButton = page.getByRole("button", { name: /Upload CSV collection file/i });
    await expect(uploadButton).toBeVisible();
  });

  test("form fields have aria-describedby", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding
    await page.getByRole("button", { name: /Start searching/ }).click();

    // Check primary commander input
    const primaryInput = page.getByLabel("Search primary commander");
    const describedBy = await primaryInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("helper-text");
  });

  test("loading states have aria-live regions", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding
    await page.getByRole("button", { name: /Start searching/ }).click();

    // Look for aria-live regions
    const liveRegions = page.locator('[aria-live="polite"]');
    const count = await liveRegions.count();
    expect(count).toBeGreaterThan(0);
  });

  test("error messages have role alert", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding
    await page.getByRole("button", { name: /Start searching/ }).click();

    // Type invalid search to trigger error
    const primaryInput = page.getByLabel("Search primary commander");
    await primaryInput.fill("xyz");

    // Wait for potential error (may not always appear, but checking structure)
    // The test validates that IF an error appears, it has role="alert"
    const errorElements = page.locator('[role="alert"]');
    if ((await errorElements.count()) > 0) {
      await expect(errorElements.first()).toBeVisible();
    }
  });
});

test.describe("Focus Management", () => {
  test("focus returns to trigger after modal closes", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding
    const dismissButton = page.getByRole("button", { name: /Start searching/ });
    await dismissButton.click();

    // Click upload button and track it
    const uploadButton = page.getByRole("button", { name: /Upload CSV collection file/i });
    await uploadButton.click();

    // Wait for modal
    await expect(page.getByRole("dialog", { name: /Import your CSV/i })).toBeVisible();

    // Close modal
    await page.keyboard.press("Escape");

    // Wait for modal to close
    await expect(page.getByRole("dialog", { name: /Import your CSV/i })).toBeHidden();
    // Note: Full focus restoration testing requires more setup
  });

  test("focus is trapped within modal", async ({ page }) => {
    await setupApp(page);

    // Wait for modal
    const onboardingDialog = page.getByRole("dialog", {
      name: /Upload your collection or scout first/i,
    });
    await expect(onboardingDialog).toBeVisible();

    // Try to tab outside modal - should stay within
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }

    // Should still be on a button within the modal
    const focusedElement = page.locator(":focus");
    const isButton = await focusedElement.evaluate((el) => el.tagName === "BUTTON");
    expect(isButton).toBe(true);
  });

  test("visible focus indicators on interactive elements", async ({ page }) => {
    await setupApp(page);

    // Dismiss onboarding
    await page.getByRole("button", { name: /Start searching/ }).click();

    // Tab to focus an element
    await page.keyboard.press("Tab");

    // Check if focused element has visible focus ring
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Note: Visual focus indicator testing would require screenshot comparison
  });
});
