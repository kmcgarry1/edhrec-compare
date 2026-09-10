import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const output = "artifacts/usability-review-2026-09-09";
const results = [];
for (const width of [1440, 390, 768]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const [name, path] of [
    ["home", "/"],
    ["commander", "/commander/atraxa-grand-unifier"],
    ["top", "/top-commanders"],
    ["changelog", "/changelog"],
  ]) {
    await page.goto("http://127.0.0.1:4173" + path);
    await page.waitForTimeout(6500);
    await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true });
    results.push({
      name,
      width,
      text: await page.locator("body").innerText(),
      metrics: await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        headings: [...document.querySelectorAll("h1,h2")].map((e) => ({
          text: e.textContent,
          y: e.getBoundingClientRect().top,
        })),
        inputs: [...document.querySelectorAll("input")].map((e) => ({
          label: e.getAttribute("aria-label"),
          placeholder: e.placeholder,
          y: e.getBoundingClientRect().top,
        })),
      })),
    });
  }
  await page.close();
}
await fs.writeFile(`${output}/live-observations.json`, JSON.stringify(results, null, 2));
await browser.close();
