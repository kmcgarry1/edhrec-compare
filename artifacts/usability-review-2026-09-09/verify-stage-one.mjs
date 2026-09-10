import { chromium } from "@playwright/test";

const browser = await chromium.launch({ channel: "msedge" });

for (const [width, height] of [
  [390, 844],
  [768, 900],
  [1440, 900],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  const input = page.locator("input").first();
  const box = await input.boundingBox();
  console.log(
    JSON.stringify({
      viewport: `${width}x${height}`,
      searchTop: box ? Math.round(box.y) : null,
      searchBottom: box ? Math.round(box.y + box.height) : null,
      visible: Boolean(box && box.y >= 0 && box.y < height && box.y + box.height <= height),
    })
  );
  await page.close();
}

const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
const settingsButton = page.getByRole("button", { name: /settings/i });
if (await settingsButton.count()) {
  await settingsButton.first().click();
} else {
  await page.getByText("Menu").click();
  await page.getByRole("button", { name: /settings/i }).click();
}
const dialog = page.getByRole("dialog", { name: /settings/i });
const dialogBox = await dialog.boundingBox();
console.log(
  JSON.stringify({
    settingsDialogVisible: await dialog.isVisible(),
    dialogBottom: dialogBox ? Math.round(dialogBox.y + dialogBox.height) : null,
    closeButtons: await page.getByRole("button", { name: /close/i }).count(),
  })
);
await page.keyboard.press("Escape");
console.log(
  JSON.stringify({
    settingsDialogAfterEscape: await dialog.isVisible().catch(() => false),
  })
);

const topPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await topPage.goto("http://localhost:5173/top-commanders", { waitUntil: "networkidle" });
const firstCommanderLink = topPage.locator("a[href*='/commander/']").first();
const firstCommanderBox = await firstCommanderLink.boundingBox().catch(() => null);
console.log(
  JSON.stringify({
    topCommandersTitle: await topPage.getByRole("heading", { name: "Top Commanders" }).isVisible(),
    firstRankedEntryTop: firstCommanderBox ? Math.round(firstCommanderBox.y) : null,
    firstRankedEntryVisible: Boolean(
      firstCommanderBox && firstCommanderBox.y >= 0 && firstCommanderBox.y < 900
    ),
  })
);
await topPage.close();

const commanderPage = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await commanderPage.goto("http://localhost:5173/commander/atraxa-grand-unifier", {
  waitUntil: "domcontentloaded",
});
await commanderPage.getByRole("button", { name: /change commander/i }).click();
console.log(
  JSON.stringify({
    commanderControlsAt1100: await commanderPage
      .getByTestId("dashboard-browse-sheet")
      .isVisible()
      .catch(() => false),
  })
);
await commanderPage.close();

const desktopCommanderPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktopCommanderPage.goto("http://localhost:5173/commander/atraxa-grand-unifier", {
  waitUntil: "domcontentloaded",
});
const persistentBrowseRail = desktopCommanderPage.locator("aside", {
  hasText: "Search, change filters, and jump to result sections.",
});
await desktopCommanderPage.getByRole("button", { name: /change commander/i }).click();
console.log(
  JSON.stringify({
    commanderPersistentRailAt1440: await persistentBrowseRail.count(),
    commanderControlsAt1440: await desktopCommanderPage
      .getByTestId("dashboard-browse-sheet")
      .isVisible()
      .catch(() => false),
  })
);
await desktopCommanderPage.close();

const galleryPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await galleryPage.goto("http://localhost:5173/commander/atraxa-grand-unifier", {
  waitUntil: "domcontentloaded",
});
await galleryPage.getByRole("button", { name: /^Gallery$/ }).click({ timeout: 15000 });
await galleryPage.getByTestId("commander-gallery-card").first().waitFor({ timeout: 20000 });
const galleryCards = await galleryPage.getByTestId("commander-gallery-card").count();
const galleryImages = await galleryPage.locator("article img").count();
console.log(
  JSON.stringify({
    galleryControlVisible: await galleryPage.getByRole("button", { name: /^Gallery$/ }).isVisible(),
    galleryCards,
    galleryImages,
  })
);
await galleryPage.close();

const changelogPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await changelogPage.goto("http://localhost:5173/changelog", { waitUntil: "networkidle" });
const releaseDetails = changelogPage.locator("#main-content > details");
console.log(
  JSON.stringify({
    releaseNotesTitle: await changelogPage
      .getByRole("heading", { name: "Release Notes" })
      .isVisible(),
    releaseCount: await releaseDetails.count(),
    latestOpen: await releaseDetails.first().evaluate((node) => node.hasAttribute("open")),
    secondOpen: await releaseDetails.nth(1).evaluate((node) => node.hasAttribute("open")),
  })
);
await changelogPage.close();

await browser.close();
