import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const f = await import(
  "data:text/javascript;base64," +
    Buffer.from(await fs.readFile("tests/e2e/fixtures.ts", "utf8")).toString("base64")
);
const b = await chromium.launch({ headless: true, channel: "msedge" });
const p = await b.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
p.setDefaultTimeout(6000);
const out = "artifacts/usability-review-2026-09-09";
const log = {};
try {
  await p.route("**/json.edhrec.com/pages/**", (r) => r.fulfill({ json: f.EDHREC_FIXTURE }));
  await p.route("**/api.scryfall.com/cards/collection**", (r) =>
    r.fulfill({ json: f.SCRYFALL_COLLECTION_RESPONSE })
  );
  await p.route("**/api.scryfall.com/cards/named**", (r) =>
    r.fulfill({ json: f.SCRYFALL_CARD_IMAGE })
  );
  await p.route("**/api.scryfall.com/cards/search**", (r) =>
    r.fulfill({ json: f.SCRYFALL_SEARCH_RESPONSE })
  );
  await p.goto("http://127.0.0.1:4173/commander/atraxa-grand-unifier", {
    waitUntil: "domcontentloaded",
  });
  await p
    .locator("#new-cards")
    .getByRole("button", { name: /Sol Ring/ })
    .first()
    .click();
  await p.getByText("Card Preview", { exact: true }).waitFor();
  await p.screenshot({ path: `${out}/card-preview-mobile.png` });
  log.previewVisible = true;
  log.dialogRoles = await p.getByRole("dialog").count();
  await p.keyboard.press("Escape");
  log.escapeCloses = !(await p.getByText("Card Preview", { exact: true }).isVisible());
  await p.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
  await p.locator("summary").filter({ hasText: "View" }).click();
  await p
    .getByRole("radio", { name: "130%" })
    .check({ timeout: 2500 })
    .catch((e) => (log.scaleInteraction = String(e)));
  log.menuEnd = await p.locator('[id^="view-menu-"]').first().boundingBox();
  await p.keyboard.press("Escape");
  await p.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await p.screenshot({ path: `${out}/text-scale-mobile.png` });
  log.scale200Overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
} catch (e) {
  log.error = String(e);
}
await fs.writeFile(`${out}/preview-observations.json`, JSON.stringify(log, null, 2));
await b.close();
