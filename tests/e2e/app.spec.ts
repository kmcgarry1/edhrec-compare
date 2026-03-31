import { test, expect, Page, Download } from "@playwright/test";
import path from "node:path";
import {
  EDHREC_FIXTURE,
  SCRYFALL_COLLECTION_RESPONSE,
  SCRYFALL_COMMANDER_RESPONSE,
  SCRYFALL_SEARCH_RESPONSE,
  SCRYFALL_SYMBOLS_RESPONSE,
  SCRYFALL_CARD_IMAGE,
  SCRYFALL_RANDOM_CARD_RESPONSE,
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

  await page.route("**/api.scryfall.com/cards/named**", (route) => {
    const url = route.request().url();
    const body = url.includes("Atraxa")
      ? SCRYFALL_COMMANDER_RESPONSE
      : SCRYFALL_CARD_IMAGE;

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });

  await page.route("**/api.scryfall.com/cards/random**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SCRYFALL_RANDOM_CARD_RESPONSE),
    })
  );

  await page.route("**/api.scryfall.com/cards/search?q=atraxa-printings", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [SCRYFALL_COMMANDER_RESPONSE],
        has_more: false,
      }),
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

const getLandingCommanderSearch = (page: Page) =>
  page.getByRole("combobox", { name: /Search commanders/i });

const getLandingUploadButton = (page: Page) =>
  page.getByRole("button", { name: /Upload collection CSV/i }).first();

const ensureDecklistActionsVisible = async (page: Page) => {
  const copyButton = page.getByTestId("header-copy-decklist");
  if (await copyButton.isVisible().catch(() => false)) {
    return copyButton;
  }

  const utilityTrigger = page.getByTestId("dashboard-utility-trigger");
  if (await utilityTrigger.isVisible().catch(() => false)) {
    await utilityTrigger.click();
  }

  await expect(copyButton).toBeVisible({ timeout: 10_000 });
  return copyButton;
};

const expectLandingReady = async (page: Page) => {
  await expect(getLandingCommanderSearch(page)).toBeVisible();
  await expect(getLandingUploadButton(page)).toBeVisible();
};

test.describe("Landing and CSV upload", () => {
  test("opens CSV upload from the landing page and accepts a file", async ({ page }) => {
    await setupApp(page);
    await expectLandingReady(page);

    await getLandingUploadButton(page).click();

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
    await expectLandingReady(page);

    await selectCommander(page);
    await expect(page).toHaveURL(/\/commander\/atraxa-grand-unifier$/);

    await expect(page.locator("#new-cards")).toContainText("Sol Ring");
    const copyButton = await ensureDecklistActionsVisible(page);
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toBeEnabled({ timeout: 10_000 });
    await copyButton.click();
    await expect
      .poll(() => page.evaluate(() => (window as { __copiedDecklist: string }).__copiedDecklist))
      .toContain("Sol Ring");

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("header-download-decklist").click();
    const download = await downloadPromise;
    await assertDownloadContains(download, "Lightning Greaves");
  });

  test("loads the dedicated commander route directly", async ({ page }) => {
    await stubClipboard(page);
    await interceptNetwork(page);
    await page.goto("/commander/atraxa-grand-unifier");

    await expect(page.getByTestId("commander-results-command-bar")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Atraxa, Grand Unifier/i })).toBeVisible();
    await expect(page.getByText("Commander destination", { exact: false })).toBeVisible();
    await expect(page.locator("#new-cards")).toContainText("Sol Ring");
  });
});

test.describe("Mobile card modal", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps browse controls and utilities in separate mobile sheets", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Only run on the mobile project");
    await setupApp(page);
    await expectLandingReady(page);

    await selectCommander(page);

    await page.getByTestId("dashboard-control-trigger").click();
    const browseSheet = page.getByTestId("dashboard-browse-sheet");
    await expect(browseSheet).toBeVisible();
    await browseSheet.getByRole("button", { name: "Close" }).click();
    await expect(browseSheet).toBeHidden();

    await page.getByTestId("dashboard-utility-trigger").click();
    const utilitySheet = page.getByTestId("dashboard-utility-sheet");
    await expect(utilitySheet).toBeVisible();
    await expect(page.getByTestId("header-copy-decklist")).toBeVisible();
    await utilitySheet.getByRole("button", { name: "Close" }).click();
    await expect(utilitySheet).toBeHidden();
  });

  test("opens modal with details and links to Scryfall", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Only run on the mobile project");
    await setupApp(page);
    await expectLandingReady(page);

    await selectCommander(page);

    const mobileRow = page
      .locator("#new-cards")
      .getByRole("button", { name: /Sol Ring/ })
      .first();
    await expect(mobileRow).toBeVisible();
    await mobileRow.click();

    const cardPreviewLabel = page.getByText("Card Preview", { exact: true });
    await expect(cardPreviewLabel).toBeVisible();
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "View on Scryfall" }).click();
    const popup = await popupPromise;
    expect(popup.url()).toContain("scryfall.com");
    await popup.close();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(cardPreviewLabel).toBeHidden();
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
  const primaryInput = getLandingCommanderSearch(page);
  await expect(primaryInput).toBeVisible();
  await primaryInput.fill("Atraxa");
  await searchResponse;
  const option = page.locator("li", { hasText: "Atraxa, Grand Unifier" }).first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
};
