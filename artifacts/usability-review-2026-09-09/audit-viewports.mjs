import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const out = "artifacts/usability-review-2026-09-09";
const log = [];
for (const width of [1440, 390, 768, 1100]) {
  const p = await browser.newPage({ viewport: { width, height: 900 } });
  for (const [name, path] of [
    ["home", "/"],
    ["commander", "/commander/atraxa-grand-unifier"],
    ["top", "/top-commanders"],
  ]) {
    await p.goto("http://127.0.0.1:4173" + path, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(3500);
    await p.screenshot({ path: `${out}/${name}-${width}-viewport.png` });
    log.push({
      width,
      name,
      metrics: await p.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        headerHeight: document.querySelector("header").getBoundingClientRect().height,
        search: [...document.querySelectorAll("input")].map((e) => ({
          y: e.getBoundingClientRect().top,
          placeholder: e.placeholder,
        })),
        firstSection: document.querySelector('[id="new-cards"]')?.getBoundingClientRect().top,
        text: document.body.innerText.slice(0, 14000),
      })),
    });
    if (name === "commander") {
      await p.evaluate(() => window.scrollTo(0, 1200));
      await p.waitForTimeout(1000);
      await p.screenshot({ path: `${out}/commander-${width}-scrolled.png` });
    }
  }
  await p.close();
}
await fs.writeFile(`${out}/viewport-observations.json`, JSON.stringify(log, null, 2));
await browser.close();
