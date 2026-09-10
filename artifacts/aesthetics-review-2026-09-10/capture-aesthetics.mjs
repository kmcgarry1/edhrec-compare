import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve("artifacts/aesthetics-review-2026-09-10");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 900 },
  { name: "wide-tablet", width: 1100, height: 900 },
  { name: "desktop", width: 1440, height: 900 },
];
const themes = ["light", "dark"];

const edhrecFixture = {
  container: {
    json_dict: {
      card: { name: "Atraxa, Grand Unifier" },
      cardlists: [
        {
          header: "New Cards",
          cardviews: [
            { id: "sr", name: "Sol Ring" },
            { id: "lg", name: "Lightning Greaves" },
            { id: "as", name: "Arcane Signet" },
          ],
        },
        {
          header: "High Synergy Cards",
          cardviews: [
            { id: "st", name: "Smothering Tithe" },
            { id: "ct", name: "Command Tower" },
            { id: "be", name: "Beast Within" },
          ],
        },
      ],
    },
  },
};

const topCommandersFixture = {
  header: "Top Commanders (Past 2 Years)",
  cardviews: [
    { name: "Atraxa, Grand Unifier", sanitized: "atraxa-grand-unifier", rank: 1, num_decks: 15420 },
    {
      name: "Korvold, Fae-Cursed King",
      sanitized: "korvold-fae-cursed-king",
      rank: 2,
      num_decks: 12350,
    },
    {
      name: "Jetmir, Nexus of Revels",
      sanitized: "jetmir-nexus-of-revels",
      rank: 3,
      num_decks: 10890,
    },
    {
      name: "Muldrotha, the Gravetide",
      sanitized: "muldrotha-the-gravetide",
      rank: 4,
      num_decks: 9870,
    },
    {
      name: "Chulane, Teller of Tales",
      sanitized: "chulane-teller-of-tales",
      rank: 5,
      num_decks: 9450,
    },
  ],
};

const commanderCard = {
  id: "atraxa-grand-unifier",
  name: "Atraxa, Grand Unifier",
  mana_cost: "{G}{W}{U}{B}",
  cmc: 7,
  type_line: "Legendary Creature",
  colors: ["G", "W", "U", "B"],
  color_identity: ["W", "U", "B", "G"],
  set: "one",
  set_name: "Phyrexia: All Will Be One",
  collector_number: "196",
  released_at: "2023-02-03",
  prices: { usd: "12.00", eur: "11.00" },
  prints_search_uri: "https://api.scryfall.com/cards/search?q=atraxa-printings",
  image_uris: {
    normal: "https://images.example/atraxa.svg",
    art_crop: "https://images.example/atraxa-art.svg",
  },
  scryfall_uri: "https://scryfall.com/card/one/196/atraxa-grand-unifier",
};

const scryfallCards = [
  commanderCard,
  {
    id: "sol-ring-id",
    name: "Sol Ring",
    mana_cost: "{1}",
    type_line: "Artifact",
    set: "cmm",
    rarity: "rare",
    prices: { usd: "2.00", eur: "1.80" },
    scryfall_uri: "https://scryfall.com/card/test/sol-ring",
    image_uris: { normal: "https://images.example/sol-ring.svg" },
  },
  {
    id: "lightning-greaves-id",
    name: "Lightning Greaves",
    mana_cost: "{2}",
    type_line: "Artifact - Equipment",
    set: "cmm",
    rarity: "rare",
    prices: { usd: "3.50", eur: "3.10" },
    scryfall_uri: "https://scryfall.com/card/test/lightning-greaves",
    image_uris: { normal: "https://images.example/lightning-greaves.svg" },
  },
  {
    id: "arcane-signet-id",
    name: "Arcane Signet",
    mana_cost: "{2}",
    type_line: "Artifact",
    set: "cmm",
    rarity: "uncommon",
    prices: { usd: "0.50", eur: "0.40" },
    scryfall_uri: "https://scryfall.com/card/test/arcane-signet",
    image_uris: { normal: "https://images.example/arcane-signet.svg" },
  },
  {
    id: "smothering-tithe-id",
    name: "Smothering Tithe",
    mana_cost: "{3}{W}",
    type_line: "Enchantment",
    set: "rna",
    rarity: "rare",
    prices: { usd: "34.00", eur: "31.00" },
    scryfall_uri: "https://scryfall.com/card/test/smothering-tithe",
    image_uris: { normal: "https://images.example/smothering-tithe.svg" },
  },
];

const installRoutes = async (page) => {
  await page.route("**/json.edhrec.com/pages/commanders/year.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(topCommandersFixture),
    })
  );
  await page.route("**/json.edhrec.com/pages/commanders/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(edhrecFixture),
    })
  );
  await page.route("**/api.scryfall.com/cards/search**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [commanderCard] }),
    })
  );
  await page.route("**/api.scryfall.com/cards/collection**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: scryfallCards }),
    })
  );
  await page.route("**/api.scryfall.com/cards/named**", (route) => {
    const url = decodeURIComponent(route.request().url()).toLowerCase();
    const card =
      scryfallCards.find((item) => url.includes(item.name.toLowerCase())) || commanderCard;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(card),
    });
  });
  await page.route("**/api.scryfall.com/symbology**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          { symbol: "{G}", svg_uri: "https://images.example/mana-g.svg" },
          { symbol: "{W}", svg_uri: "https://images.example/mana-w.svg" },
          { symbol: "{U}", svg_uri: "https://images.example/mana-u.svg" },
          { symbol: "{B}", svg_uri: "https://images.example/mana-b.svg" },
          { symbol: "{1}", svg_uri: "https://images.example/mana-1.svg" },
          { symbol: "{2}", svg_uri: "https://images.example/mana-2.svg" },
        ],
      }),
    })
  );
  await page.route("**/api.scryfall.com/cards/random**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(commanderCard),
    })
  );
  await page.route("https://images.example/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 880"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#6e1558"/><stop offset="1" stop-color="#32c0b4"/></linearGradient></defs><rect width="630" height="880" rx="36" fill="url(#g)"/><circle cx="480" cy="170" r="120" fill="#f8f0e4" opacity=".24"/></svg>`,
    })
  );
};

const capture = async (page, name, options = {}) => {
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: options.fullPage ?? false,
  });
};

const clickFirstVisible = async (page, locators) => {
  for (const locator of locators) {
    if (
      await locator
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await locator.first().click();
      return true;
    }
  }
  return false;
};

const openHome = async (page, theme = "light") => {
  await page.addInitScript(
    (value) => window.localStorage.setItem("edhrec-color-scheme", value),
    theme
  );
  await installRoutes(page);
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");
};

const run = async () => {
  const browser = await chromium.launch(
    fs.existsSync(edgePath) ? { executablePath: edgePath } : undefined
  );
  for (const viewport of viewports) {
    for (const theme of themes) {
      const suffix = theme === "dark" ? `${viewport.name}-dark` : viewport.name;
      const page = await browser.newPage({ viewport });
      await openHome(page, theme);
      await capture(page, `home-${suffix}`);
      if (
        await clickFirstVisible(page, [
          page.getByRole("button", { name: /Settings/i }),
          page.getByRole("button", { name: /View/i }),
          page.getByRole("button", { name: /Menu/i }),
          page.locator("summary", { hasText: /View|Settings|Menu/i }),
        ])
      ) {
        await capture(page, `settings-${suffix}`);
        await page
          .getByRole("button", { name: /Close/i })
          .first()
          .click()
          .catch(() => {});
        await page.keyboard.press("Escape").catch(() => {});
      }
      if (
        await clickFirstVisible(page, [
          page.getByRole("button", { name: /Upload collection/i }),
          page.getByRole("button", { name: /Upload CSV/i }),
        ])
      ) {
        await capture(page, `upload-${suffix}`);
        await page
          .getByRole("button", { name: /Close/i })
          .first()
          .click()
          .catch(() => {});
        await page.keyboard.press("Escape").catch(() => {});
      }
      await page.goto(`${baseURL}/commander/atraxa-grand-unifier`);
      await page.waitForLoadState("networkidle");
      await capture(page, `commander-${suffix}`);
      await page.goto(`${baseURL}/top-commanders`);
      await page.waitForLoadState("networkidle");
      await capture(page, `top-commanders-${suffix}`);
      await page.goto(`${baseURL}/changelog`);
      await page.waitForLoadState("networkidle");
      await capture(page, `changelog-${suffix}`);
      await page.close();
    }
  }

  await browser.close();
};

await run();
