# Expand E2E Test Coverage

**Priority:** Low  
**Type:** Testing  
**Component:** Playwright Tests  
**Effort:** Medium (2-3 days)

## Problem

E2E test coverage is limited, with only basic scenarios tested:

### Current Issues

- Only 2 E2E test files (app.spec.ts, accessibility.spec.ts)
- Missing tests for critical user workflows
- No visual regression testing
- CSV upload edge cases not tested
- Filter combinations not thoroughly tested
- Mobile-specific scenarios untested

### User Impact

- **Low:** Does not affect users directly
- Increased risk of bugs in production
- Regressions may go undetected
- Manual testing burden on developers
- Lower confidence in releases

## Proposed Solution

### Comprehensive E2E Test Suite

Add thorough E2E tests covering all user workflows:

```typescript
// tests/e2e/commander-search.spec.ts
import { test, expect } from "@playwright/test";

describe("Commander Search", () => {
  test("searches and selects commander", async ({ page }) => {
    await page.goto("/");

    // Type commander name
    await page.fill('input[placeholder*="Search"]', "Atraxa");

    // Wait for autocomplete
    await page.waitForSelector(".autocomplete-results");

    // Select first result
    await page.click(".autocomplete-results >> nth=0");

    // Verify commander displayed
    await expect(page.locator(".commander-display")).toBeVisible();
    await expect(page.locator(".commander-name")).toContainText("Atraxa");
  });

  test("handles partner commanders", async ({ page }) => {
    await page.goto("/");

    // Search for partner commander
    await page.fill('input[placeholder*="Search"]', "Tymna");
    await page.click(".autocomplete-results >> text=Tymna the Weaver");

    // Should show partner selection
    await expect(page.locator(".partner-search")).toBeVisible();

    // Select second partner
    await page.fill(".partner-search input", "Thrasios");
    await page.click(".autocomplete-results >> text=Thrasios");

    // Verify both partners
    await expect(page.locator(".commander-display")).toContainText("Tymna");
    await expect(page.locator(".commander-display")).toContainText("Thrasios");
  });

  test("handles typos with fuzzy search", async ({ page }) => {
    await page.goto("/");

    // Search with typo
    await page.fill('input[placeholder*="Search"]', "Atraxxa");

    // Should still find Atraxa
    await expect(page.locator(".autocomplete-results")).toContainText("Atraxa");
  });
});
```

### CSV Upload Workflow Tests

```typescript
// tests/e2e/csv-upload.spec.ts
import { test, expect } from "@playwright/test";

describe("CSV Upload", () => {
  test("uploads valid CSV file", async ({ page }) => {
    await page.goto("/");

    // Open upload modal
    await page.click('[data-testid="upload-csv-button"]');
    await expect(page.locator(".csv-upload-modal")).toBeVisible();

    // Upload file
    await page.setInputFiles('input[type="file"]', "tests/fixtures/inventory-valid.csv");

    // Verify success
    await expect(page.locator(".upload-success")).toBeVisible();
    await expect(page.locator(".csv-stats")).toContainText("150 cards");
  });

  test("validates CSV headers", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="upload-csv-button"]');

    // Upload CSV without Name column
    await page.setInputFiles('input[type="file"]', "tests/fixtures/inventory-no-name.csv");

    // Should show error
    await expect(page.locator(".error-message")).toContainText("Name column");
  });

  test("handles large CSV files", async ({ page }) => {
    await page.goto("/");
    await page.click('[data-testid="upload-csv-button"]');

    // Upload 10k card CSV
    await page.setInputFiles('input[type="file"]', "tests/fixtures/inventory-large.csv");

    // Should show progress
    await expect(page.locator(".upload-progress")).toBeVisible();

    // Eventually succeed
    await expect(page.locator(".upload-success")).toBeVisible({
      timeout: 10000,
    });
  });

  test("clears previous CSV data", async ({ page }) => {
    await page.goto("/");

    // Upload first CSV
    await uploadCSV(page, "tests/fixtures/inventory-1.csv");
    const firstCount = await page.locator(".csv-stats").textContent();

    // Upload second CSV
    await uploadCSV(page, "tests/fixtures/inventory-2.csv");
    const secondCount = await page.locator(".csv-stats").textContent();

    // Counts should be different
    expect(firstCount).not.toBe(secondCount);
  });
});
```

### Filter and Export Tests

```typescript
// tests/e2e/filters-export.spec.ts
import { test, expect } from "@playwright/test";

describe("Filters and Export", () => {
  test("applies bracket filter", async ({ page }) => {
    await page.goto("/");
    await selectCommander(page, "Atraxa, Praetors' Voice");

    // Select bracket
    await page.selectOption('[data-testid="bracket-filter"]', "cedh");

    // Wait for data reload
    await page.waitForResponse(/json\.edhrec\.com/);

    // Verify URL includes bracket
    expect(page.url()).toContain("cedh");
  });

  test("combines multiple filters", async ({ page }) => {
    await page.goto("/");
    await selectCommander(page, "Atraxa, Praetors' Voice");

    // Apply multiple filters
    await page.selectOption('[data-testid="bracket-filter"]', "core");
    await page.selectOption('[data-testid="modifier-filter"]', "budget");
    await page.selectOption('[data-testid="page-type"]', "average-decks");

    // Verify all filters reflected
    await page.waitForResponse(/json\.edhrec\.com.*core.*budget/);
  });

  test("exports decklist", async ({ page }) => {
    await page.goto("/");
    await selectCommander(page, "Atraxa, Praetors' Voice");

    // Wait for cards to load
    await page.waitForSelector(".card-table");

    // Click export
    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="export-decklist"]');
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toContain("atraxa");
    expect(download.suggestedFilename()).toContain(".txt");
  });

  test("copies decklist to clipboard", async ({ page }) => {
    await page.goto("/");
    await selectCommander(page, "Atraxa, Praetors' Voice");
    await page.waitForSelector(".card-table");

    // Click copy
    await page.click('[data-testid="copy-decklist"]');

    // Verify success notification
    await expect(page.locator(".notice")).toContainText("Copied");

    // Verify clipboard (requires clipboard permissions)
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("Sol Ring");
  });
});
```

### Mobile-Specific Tests

```typescript
// tests/e2e/mobile.spec.ts
import { test, expect, devices } from "@playwright/test";

test.use(devices["iPhone 13"]);

describe("Mobile Experience", () => {
  test("toolbar is accessible on mobile", async ({ page }) => {
    await page.goto("/");

    // Toolbar should be visible
    await expect(page.locator(".toolkit-header")).toBeVisible();

    // Buttons should be tappable (44x44px minimum)
    const buttons = page.locator(".toolkit-header button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("card table scrollable on mobile", async ({ page }) => {
    await page.goto("/");
    await selectCommander(page, "Atraxa, Praetors' Voice");

    // Wait for table
    await page.waitForSelector(".card-table");

    // Should be scrollable
    const isScrollable = await page.evaluate(() => {
      const table = document.querySelector(".card-table");
      return table.scrollHeight > table.clientHeight;
    });

    expect(isScrollable).toBe(true);
  });
});
```

### Visual Regression Tests

```typescript
// tests/e2e/visual-regression.spec.ts
import { test, expect } from "@playwright/test";

test("homepage matches snapshot", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png");
});

test("commander display matches snapshot", async ({ page }) => {
  await page.goto("/");
  await selectCommander(page, "Atraxa, Praetors' Voice");
  await page.waitForSelector(".commander-display");

  await expect(page.locator(".commander-display")).toHaveScreenshot("commander-display.png");
});

test("card table matches snapshot", async ({ page }) => {
  await page.goto("/");
  await selectCommander(page, "Atraxa, Praetors' Voice");
  await page.waitForSelector(".card-table");

  await expect(page.locator(".card-table")).toHaveScreenshot(
    "card-table.png",
    { maxDiffPixels: 100 } // Allow minor rendering differences
  );
});
```

## Technical Considerations

### Files to Create

- `tests/e2e/commander-search.spec.ts` - Search workflows
- `tests/e2e/csv-upload.spec.ts` - CSV upload scenarios
- `tests/e2e/filters-export.spec.ts` - Filters and export
- `tests/e2e/mobile.spec.ts` - Mobile-specific tests
- `tests/e2e/visual-regression.spec.ts` - Screenshot comparisons
- `tests/fixtures/` - Test data files

### Test Data Fixtures

```csv
<!-- tests/fixtures/inventory-valid.csv -->
Name,Quantity,Foil,Set
Sol Ring,1,No,C21
Command Tower,1,No,C21
Arcane Signet,1,No,C21
```

### Playwright Configuration Updates

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "firefox", use: devices["Desktop Firefox"] },
    { name: "webkit", use: devices["Desktop Safari"] },
    { name: "mobile-chrome", use: devices["Pixel 5"] },
    { name: "mobile-safari", use: devices["iPhone 13"] },
  ],
});
```

## Implementation Plan

### Phase 1: Core Workflows (Day 1)

1. Commander search tests
2. CSV upload tests
3. Filter application tests

### Phase 2: Edge Cases (Day 2)

1. Error scenarios
2. Mobile-specific tests
3. Large dataset tests

### Phase 3: Visual Regression (Day 3)

1. Screenshot baselines
2. Component snapshots
3. Cross-browser testing

## Acceptance Criteria

- [ ] 80%+ coverage of user workflows
- [ ] All critical paths tested
- [ ] Mobile-specific tests pass
- [ ] Visual regression tests baseline created
- [ ] CI runs all E2E tests
- [ ] Tests run in < 5 minutes
- [ ] Flaky tests identified and fixed

## Related Issues

- Testing infrastructure
- CI/CD improvements
- Quality assurance

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Visual Testing - Playwright](https://playwright.dev/docs/test-snapshots)
- [Mobile Testing - Playwright](https://playwright.dev/docs/emulation)
