import path from "node:path";
import { test, expect, type Download, type Page } from "@playwright/test";
import {
  dismissOnboarding,
  ensureToolkitVisible,
  openCsvUploadModal,
  selectCommander,
  setupApp,
} from "./test-helpers";

const selectDropdownOption = async (
  page: Page,
  label: string,
  optionLabel: string
) => {
  await page.getByLabel(label).click();
  const option = page
    .getByRole("option", { name: new RegExp(optionLabel, "i") })
    .first();
  await expect(option).toBeVisible();
  await option.click();
};

const readDownload = async (download: Download) => {
  const stream = await download.createReadStream();
  if (!stream) {
    throw new Error("Unable to read download stream");
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Uint8Array);
  }
  return Buffer.concat(chunks).toString("utf-8");
};

test.describe("Filters and exports", () => {
  test("applies multiple filters and updates the URL", async ({ page }) => {
    await setupApp(page);
    await dismissOnboarding(page);
    await selectCommander(page, "Atraxa, Grand Unifier");
    await expect(
      page.getByRole("heading", { name: "New Cards" })
    ).toBeVisible();

    await selectDropdownOption(page, "Select bracket", "2 - Core");
    await selectDropdownOption(page, "Select budget modifier", "Budget");
    await selectDropdownOption(page, "Select page type", "Average Decks");

    const requestPromise = page.waitForRequest((request) => {
      const url = request.url();
      return (
        url.includes("json.edhrec.com/pages/") &&
        url.includes("average-decks") &&
        url.includes("core") &&
        url.includes("budget") &&
        url.includes("gyruda-companion")
      );
    });

    await selectDropdownOption(page, "Select companion", "Gyruda");
    await requestPromise;

    const url = new URL(page.url());
    expect(url.searchParams.get("pageType")).toBe("average-decks");
    expect(url.searchParams.get("bracket")).toBe("core");
    expect(url.searchParams.get("modifier")).toBe("budget");
    expect(url.searchParams.get("companion")).toBe("gyruda-companion");
  });

  test("downloads a decklist from a cardlist section", async ({ page }) => {
    await setupApp(page);
    await dismissOnboarding(page);
    await selectCommander(page, "Atraxa, Grand Unifier");

    await expect(
      page.getByRole("heading", { name: "New Cards" })
    ).toBeVisible();

    const section = page.locator("article").filter({ hasText: "New Cards" }).first();
    const downloadPromise = page.waitForEvent("download");
    await section
      .getByRole("button", { name: /Download decklist\.txt/i })
      .click();
    const download = await downloadPromise;

    const payload = await readDownload(download);
    expect(payload).toContain("Sol Ring");
  });

  test("copies a decklist from a cardlist section", async ({ page }) => {
    await setupApp(page, { clipboard: true });
    await dismissOnboarding(page);
    await selectCommander(page, "Atraxa, Grand Unifier");

    const section = page.locator("article").filter({ hasText: "New Cards" }).first();
    const copyButton = section.getByRole("button", {
      name: /Copy for Archidekt\/Moxfield/i,
    });
    await expect(copyButton).toBeEnabled();
    await copyButton.click();
    await expect(copyButton).toHaveText("Copied!");

    await expect.poll(() =>
      page.evaluate(
        () => (window as Window & { __copiedText: string }).__copiedText
      )
    ).toContain("Sol Ring");
  });

  test("filters owned versus unowned cards", async ({ page }) => {
    await setupApp(page);
    await openCsvUploadModal(page);

    const dialog = page.getByRole("dialog", { name: /Import your CSV/i });
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.resolve("tests/fixtures/inventory-owned.csv")
    );
    await expect(page.getByText("Found 1 card")).toBeVisible();
    await dialog.getByRole("button", { name: /Close/i }).click();
    await expect(dialog).toBeHidden();

    await dismissOnboarding(page);
    await selectCommander(page, "Atraxa, Grand Unifier");
    await ensureToolkitVisible(page);

    await expect(page.getByText("Sol Ring")).toBeVisible();
    await expect(page.getByText("Smothering Tithe")).toBeVisible();

    await page
      .getByRole("button", { name: /Show owned cards/i })
      .click();
    await expect(page.getByText("Sol Ring")).toBeVisible();
    await expect(page.locator("text=Smothering Tithe")).toHaveCount(0);

    await page
      .getByRole("button", { name: /Show unowned cards/i })
      .click();
    await expect(page.getByText("Smothering Tithe")).toBeVisible();
    await expect(page.locator("text=Sol Ring")).toHaveCount(0);
  });
});
