import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const b = await chromium.launch({ headless: true, channel: "msedge" });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const out = "artifacts/usability-review-2026-09-09";
const log = {};
await p.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(1200);
await p.locator("summary").filter({ hasText: "View" }).click();
await p.screenshot({ path: `${out}/view-menu-mobile.png` });
log.viewMenu = await p.locator('[id^="view-menu-"]').first().boundingBox();
await p.keyboard.press("Escape");
await p.getByRole("button", { name: "Upload Collection", exact: true }).click();
await p.waitForTimeout(600);
await p.screenshot({ path: `${out}/upload-mobile.png` });
log.uploadBefore = await p.getByRole("dialog").innerText();
await p
  .locator("input[type=file]")
  .setInputFiles({
    name: "invalid.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Wrong,Quantity\nSol Ring,1"),
  });
await p.waitForTimeout(300);
log.invalid = await p.getByRole("dialog").innerText();
await p
  .locator("input[type=file]")
  .setInputFiles({
    name: "review.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Name,Quantity\nSol Ring,1\nArcane Signet,1\nLightning Greaves,1"),
  });
await p.waitForTimeout(500);
log.valid = await p.getByRole("dialog").innerText();
await p.screenshot({ path: `${out}/upload-success-mobile.png` });
await p.keyboard.press("Escape");
log.escapeClosed = (await p.getByRole("dialog").count()) === 0;
await p.goto("http://127.0.0.1:4173/commander/atraxa-grand-unifier", {
  waitUntil: "domcontentloaded",
});
await p.waitForTimeout(5000);
await p.getByTestId("dashboard-control-trigger").click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/browse-sheet-mobile.png` });
log.browse = await p.getByTestId("dashboard-browse-sheet").innerText();
await p.keyboard.press("Escape");
await p.setViewportSize({ width: 1100, height: 900 });
await p.waitForTimeout(300);
await p.getByRole("button", { name: "Change commander", exact: true }).click();
log.change1100 = await p.evaluate(() => ({
  focused: document.activeElement?.outerHTML,
  sheets: [...document.querySelectorAll("[role=dialog]")].map((e) => e.textContent),
}));
await p.setViewportSize({ width: 1440, height: 900 });
await p.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(800);
await p.locator("summary").filter({ hasText: "View" }).click();
await p.getByRole("button", { name: /Theme Light/ }).click();
await p.keyboard.press("Escape");
await p.screenshot({ path: `${out}/home-dark.png` });
await fs.writeFile(`${out}/interaction-observations.json`, JSON.stringify(log, null, 2));
await b.close();
