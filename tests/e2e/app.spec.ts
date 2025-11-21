import { test, expect, Page, Download } from "@playwright/test";
import path from "node:path";
import {
  EDHREC_FIXTURE,
  SCRYFALL_COLLECTION_RESPONSE,
  SCRYFALL_SEARCH_RESPONSE,
  SCRYFALL_SYMBOLS_RESPONSE,
  SCRYFALL_CARD_IMAGE,
} from "./fixtures";

const interceptNetwork = async (page: Page) => {
  await page.route("**/json.edhrec.com/pages/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(EDHREC_FIXTURE),
    })
  );

  await page.route("**/api.scryfall.com/cards/search**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SCRYFALL_SEARCH_RESPONSE),
    })
  );

  await page.route("**/api.scryfall.com/cards/collection**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SCRYFALL_COLLECTION_RESPONSE),
    })
  );

  await page.route("**/api.scryfall.com/symbology**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SCRYFALL_SYMBOLS_RESPONSE),
    })
  );

  await page.route("**/api.scryfall.com/cards/named**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SCRYFALL_CARD_IMAGE),
    })
  );
};

const stubClipboard = async (page: Page) => {
  await page.addInitScript(() => {
    window.__copiedDecklist = "";
    const clipboard = {
      writeText: (text: string) => {
        window.__copiedDecklist = text;
        return Promise.resolve();
      },
    };
    Object.defineProperty(navigator, "clipboard", {
      value: clipboard,
      configurable: true,
    });
  });
};

const setupApp = async (page: Page) => {
  await stubClipboard(page);
  await interceptNetwork(page);
  await page.goto("/");
};

test.describe("Onboarding and CSV upload", () => {
  test("prompts user and accepts CSV upload", async ({ page }) => {
    await setupApp(page);

    await expect(page.getByText("First-time setup")).toBeVisible();
    await page.getByRole("button", { name: /Upload CSV/ }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.resolve("src/assets/inventory.csv"));

    await expect(page.getByText("rows detected", { exact: false })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Import your CSV")).toBeHidden();
  });
});

test.describe("Commander workflow", () => {
  test("searches commanders and exports decklists", async ({ page }) => {
    await setupApp(page);
    await page.getByRole("button", { name: /Start searching/ }).click();

    await selectCommander(page);

    await expect(page.locator("#new-cards")).toContainText("Sol Ring");
    await ensureToolkitVisible(page);

    const copyButton = page.getByTestId("header-copy-decklist");
    await expect(copyButton).toBeEnabled({ timeout: 10_000 });
    await copyButton.click();
    await expect.poll(() =>
      page.evaluate(() => (window as { __copiedDecklist: string }).__copiedDecklist)
    ).toContain("Sol Ring");

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("header-download-decklist").click();
    const download = await downloadPromise;
    await assertDownloadContains(download, "Lightning Greaves");
  });
});

test.describe("Mobile card modal", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens modal with details and links to Scryfall", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-chromium",
      "Only run on the mobile project"
    );
    await setupApp(page);
    await page.getByRole("button", { name: /Start searching/ }).click();

    await selectCommander(page);

    const mobileRow = page
      .locator("#new-cards")
      .getByRole("button", { name: /Sol Ring/ })
      .first();
    await expect(mobileRow).toBeVisible();
    await mobileRow.click();

    await expect(page.getByText("Card Preview")).toBeVisible();
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "View on Scryfall" }).click();
    const popup = await popupPromise;
    expect(popup.url()).toContain("scryfall.com");
    await popup.close();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Card Preview")).toBeHidden();
  });
});

const assertDownloadContains = async (download: Download, text: string) => {
  const stream = await download.createReadStream();
  if (!stream) {
    throw new Error("Unable to read download stream");
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Uint8Array);
  }
  const payload = Buffer.concat(chunks).toString("utf-8");
  expect(payload).toContain(text);
};

const selectCommander = async (page: Page) => {
  const searchResponse = page.waitForResponse(
    (response) => response.url().includes("/cards/search"),
    { timeout: 10_000 }
  );
  await page.getByPlaceholder("Atraxa, Grand Unifier...").fill("Atraxa");
  await searchResponse;
  const option = page
    .locator("li", { hasText: "Atraxa, Grand Unifier" })
    .first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
};

const ensureToolkitVisible = async (page: Page) => {
  const showButton = page.getByRole("button", { name: "Show Toolkit" });
  if (await showButton.isVisible().catch(() => false)) {
    await showButton.click();
  }
};
