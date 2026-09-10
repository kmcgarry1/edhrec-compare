import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const f = await import(
  "data:text/javascript;base64," +
    Buffer.from(await fs.readFile("tests/e2e/fixtures.ts", "utf8")).toString("base64")
);
const b = await chromium.launch({ headless: true, channel: "msedge" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const out = "artifacts/usability-review-2026-09-09";
const log = {};
p.setDefaultTimeout(7000);
try {
  await p.route("**/json.edhrec.com/pages/**", (r) => r.fulfill({ json: f.EDHREC_FIXTURE }));
  await p.route("**/api.scryfall.com/cards/collection**", (r) =>
    r.fulfill({ json: f.SCRYFALL_COLLECTION_RESPONSE })
  );
  await p.route("**/api.scryfall.com/cards/search**", (r) =>
    r.fulfill({ json: f.SCRYFALL_SEARCH_RESPONSE })
  );
  await p.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
  const search = p.getByRole("combobox", { name: /Search commanders/ });
  await search.fill("Atraxa");
  await p.getByRole("option").first().waitFor();
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(2500);
  log.keyboardSearchUrl = p.url();
  if (!p.url().includes("/commander/")) await p.getByRole("option").first().click();
  await p
    .locator("#new-cards")
    .getByText("Sol Ring", { exact: true })
    .first()
    .waitFor({ timeout: 15000 });
  await p.locator("#new-cards").scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${out}/loaded-results-desktop.png` });
  log.beforeUpload = await p.locator("#new-cards").innerText();
  await p.getByRole("button", { name: "Upload Collection", exact: true }).click();
  await p
    .locator("input[type=file]")
    .setInputFiles({
      name: "review.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("Name,Quantity\nSol Ring,1"),
    });
  await p.keyboard.press("Escape");
  await p.getByTestId("browse-rail-collection-toggle").click();
  await p.getByRole("button", { name: "Owned", exact: true }).click();
  await p.waitForTimeout(300);
  log.ownedFilter = await p.locator("#new-cards").innerText();
  await p.getByTestId("dashboard-utility-trigger").click();
  log.utilities = await p
    .getByTestId("dashboard-utility-sheet")
    .innerText()
    .catch(() => p.getByRole("dialog").innerText());
  const downloadPromise = p.waitForEvent("download");
  await p.getByTestId("header-download-decklist").click();
  const dl = await downloadPromise;
  log.download = await fs.readFile(await dl.path(), "utf8");
  await p.keyboard.press("Escape");
  await p.setViewportSize({ width: 390, height: 844 });
  await p.locator("#new-cards").scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${out}/loaded-results-mobile.png` });
  await p
    .locator("#new-cards")
    .getByRole("button", { name: /Sol Ring/ })
    .first()
    .click();
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/card-preview-mobile.png` });
  log.preview = await p.getByRole("dialog").innerText();
} catch (e) {
  log.error = String(e);
}
await fs.writeFile(`${out}/controlled-observations.json`, JSON.stringify(log, null, 2));
await b.close();
