import path from "node:path";
import { test, expect } from "@playwright/test";
import { openCsvUploadModal, setupApp } from "./test-helpers";

test.describe("CSV upload", () => {
  test("uploads a valid CSV and shows summary", async ({ page }) => {
    await setupApp(page);
    await openCsvUploadModal(page);

    const dialog = page.getByRole("dialog", { name: /Import your CSV/i });
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.resolve("tests/fixtures/inventory-valid.csv")
    );

    await expect(page.getByText("Valid CSV")).toBeVisible();
    await expect(page.getByText("Found 3 cards")).toBeVisible();
    await expect(page.getByText("3 rows detected")).toBeVisible();
  });

  test("warns when Name column is missing", async ({ page }) => {
    await setupApp(page);
    await openCsvUploadModal(page);

    const dialog = page.getByRole("dialog", { name: /Import your CSV/i });
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.resolve("tests/fixtures/inventory-no-name.csv")
    );

    await expect(page.getByText("Valid CSV")).toBeVisible();
    await expect(
      page.getByText('No "Name" column found. Using first column.')
    ).toBeVisible();
  });

  test("handles large CSV uploads", async ({ page }) => {
    await setupApp(page);
    await openCsvUploadModal(page);

    const dialog = page.getByRole("dialog", { name: /Import your CSV/i });
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.resolve("tests/fixtures/inventory-large.csv")
    );

    await expect(page.getByText("Valid CSV")).toBeVisible();
    await expect(page.getByText("Found 200 cards")).toBeVisible();
  });

  test("shows validation errors for malformed CSVs", async ({ page }) => {
    await setupApp(page);
    await openCsvUploadModal(page);

    const dialog = page.getByRole("dialog", { name: /Import your CSV/i });
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.resolve("tests/fixtures/inventory-mismatched.csv")
    );

    await expect(
      page.getByText("We couldn't process that CSV. Fix the errors below and try again.")
    ).toBeVisible();
    await expect(
      page.getByText(
        "Rows 2 have a different number of columns than the header."
      )
    ).toBeVisible();
  });

  test("rejects non-CSV uploads", async ({ page }) => {
    await setupApp(page);
    await openCsvUploadModal(page);

    const dialog = page.getByRole("dialog", { name: /Import your CSV/i });
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.resolve("tests/fixtures/inventory-invalid.txt")
    );

    await expect(
      page.getByText("Please select a valid CSV file")
    ).toBeVisible();
  });

  test("replaces previous upload data", async ({ page }) => {
    await setupApp(page);
    await openCsvUploadModal(page);

    const dialog = page.getByRole("dialog", { name: /Import your CSV/i });
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.resolve("tests/fixtures/inventory-valid.csv")
    );

    await expect(page.getByText("Found 3 cards")).toBeVisible();

    await fileInput.setInputFiles(
      path.resolve("tests/fixtures/inventory-valid-2.csv")
    );

    await expect(page.getByText("Found 2 cards")).toBeVisible();
    await expect(page.getByText("2 rows detected")).toBeVisible();
  });
});
