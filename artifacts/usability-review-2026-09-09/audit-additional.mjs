import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const b = await chromium.launch({ headless: true, channel: "msedge" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.setDefaultTimeout(6000);
const out = "artifacts/usability-review-2026-09-09";
const log = {};
await p.goto("http://127.0.0.1:4173/top-commanders", { waitUntil: "domcontentloaded" });
await p.locator('a[href*="/commander/"]').first().waitFor({ timeout: 20000 });
await p.locator('a[href*="/commander/"]').first().scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/top-ranking-desktop.png` });
log.top = await p
  .locator('a[href*="/commander/"]')
  .first()
  .evaluate((e) => ({
    rect: e.getBoundingClientRect().toJSON(),
    text: e.innerText,
    image: e.querySelector("img")?.getBoundingClientRect().toJSON(),
  }));
await p.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
await p.locator("summary").filter({ hasText: "View" }).click();
await p.getByRole("button", { name: /Theme Light/ }).click();
await p.keyboard.press("Escape");
log.dark = await p.evaluate(() => ({
  root: document.documentElement.className,
  headline: getComputedStyle(document.querySelector("h1")).lineHeight,
  muted: [...document.querySelectorAll("p")]
    .slice(0, 8)
    .map((e) => ({ text: e.innerText, color: getComputedStyle(e).color })),
  primary: getComputedStyle(
    [...document.querySelectorAll("button")].find((e) => e.innerText === "Upload Collection")
  ).backgroundColor,
}));
await p.setViewportSize({ width: 390, height: 844 });
await p.locator("summary").filter({ hasText: "View" }).click();
await p
  .getByRole("radio", { name: "200%" })
  .check()
  .catch((e) => {
    log.textScaleError = String(e);
  });
await p.keyboard.press("Escape");
await p.screenshot({ path: `${out}/text-scale-mobile.png` });
await p.route("**/json.edhrec.com/pages/**", (r) =>
  r.fulfill({ status: 503, json: { error: "Unavailable" } })
);
await p.goto("http://127.0.0.1:4173/commander/atraxa-grand-unifier", {
  waitUntil: "domcontentloaded",
});
await p.waitForTimeout(5000);
log.errorText = await p.locator("main").innerText();
await p.screenshot({ path: `${out}/commander-error-mobile.png` });
await fs.writeFile(`${out}/additional-observations.json`, JSON.stringify(log, null, 2));
await b.close();
