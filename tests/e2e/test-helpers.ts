import { expect, type Page } from "@playwright/test";
import {
  EDHREC_FIXTURE,
  SCRYFALL_CARD_IMAGE,
  SCRYFALL_COLLECTION_RESPONSE,
  SCRYFALL_SYMBOLS_RESPONSE,
} from "./fixtures";

type SearchResultsMap = Record<string, string[]>;

const DEFAULT_SEARCH_RESULTS: SearchResultsMap = {
  Atraxa: ["Atraxa, Grand Unifier", "Atraxa, Praetors' Voice"],
  Tymna: ["Tymna the Weaver"],
  Thrasios: ["Thrasios, Triton Hero"],
};

const buildSearchResponse = (names: string[]) => ({
  object: "list",
  data: names.map((name, index) => ({
    id: `${index}-${name.replace(/\s+/g, "-").toLowerCase()}`,
    name,
  })),
});

const matchSearchResults = (query: string, searchResults: SearchResultsMap) => {
  const normalized = query.toLowerCase();
  for (const [key, names] of Object.entries(searchResults)) {
    if (normalized.includes(key.toLowerCase())) {
      return names;
    }
  }
  return [];
};

export const stubClipboard = async (page: Page) => {
  await page.addInitScript(() => {
    window.__copiedText = "";
    const clipboard = {
      writeText: (text: string) => {
        window.__copiedText = text;
        return Promise.resolve();
      },
    };
    Object.defineProperty(navigator, "clipboard", {
      value: clipboard,
      configurable: true,
    });
  });
};

export const interceptApi = async (
  page: Page,
  options?: { searchResults?: SearchResultsMap }
) => {
  const searchResults = {
    ...DEFAULT_SEARCH_RESULTS,
    ...(options?.searchResults ?? {}),
  };

  await page.route("**/json.edhrec.com/pages/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(EDHREC_FIXTURE),
    })
  );

  await page.route("**/api.scryfall.com/cards/search**", (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get("q") ?? "";
    const names = matchSearchResults(query, searchResults);
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildSearchResponse(names)),
    });
  });

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

export const setupApp = async (
  page: Page,
  options?: { searchResults?: SearchResultsMap; clipboard?: boolean }
) => {
  if (options?.clipboard) {
    await stubClipboard(page);
  }
  await interceptApi(page, { searchResults: options?.searchResults });
  await page.goto("/");
};

export const dismissOnboarding = async (page: Page) => {
  const modal = page.getByText("First-time setup");
  if (await modal.isVisible().catch(() => false)) {
    await page
      .getByRole("button", { name: /Start searching/ })
      .click();
    await expect(modal).toBeHidden();
  }
};

export const ensureToolkitVisible = async (page: Page) => {
  const showButton = page.getByRole("button", { name: /Show toolkit/i });
  if (await showButton.isVisible().catch(() => false)) {
    await showButton.click();
  }
};

export const openCsvUploadModal = async (page: Page) => {
  const onboardingPrompt = page.getByText("First-time setup");
  await onboardingPrompt.waitFor({ state: "visible", timeout: 2000 }).catch(() => {});
  if (await onboardingPrompt.isVisible().catch(() => false)) {
    const onboardingDialog = page.getByRole("dialog", {
      name: /Upload your collection/i,
    });
    await onboardingDialog
      .getByRole("button", { name: /Upload CSV/i })
      .click();
  } else {
    await ensureToolkitVisible(page);
    await page.getByRole("button", { name: /Upload CSV/i }).click();
  }

  await expect(
    page.getByRole("dialog", { name: /Import your CSV/i })
  ).toBeVisible();
};

export const selectCommander = async (page: Page, name: string) => {
  const input = page.getByLabel("Search primary commander");
  await input.fill(name);
  const option = page.locator("li", { hasText: name }).first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
};

export const disableAnimations = async (page: Page) => {
  await page.addStyleTag({
    content: `*,
*::before,
*::after {
  animation: none !important;
  transition: none !important;
}`,
  });
};
