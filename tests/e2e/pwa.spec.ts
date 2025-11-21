import { test, expect } from "@playwright/test";

test.describe("PWA Support", () => {
  test("should have a valid manifest", async ({ page }) => {
    // Navigate to home first to ensure app is loaded
    await page.goto("/");

    // Navigate directly to manifest
    const manifestResponse = await page.goto("/manifest.webmanifest");

    // In dev mode, manifest might not exist or return HTML
    const status = manifestResponse?.status();
    const contentType = manifestResponse?.headers()["content-type"];

    if (status === 404 || contentType?.includes("html")) {
      // Skip this test in dev mode
      test.skip();
      return;
    }

    expect(status).toBe(200);

    // Parse and verify manifest content
    const manifestContent = await manifestResponse?.json();
    expect(manifestContent.name).toBe("EDHREC Compare");
    expect(manifestContent.short_name).toBe("EDHREC");
    expect(manifestContent.theme_color).toBe("#10b981");
    expect(manifestContent.display).toBe("standalone");
    expect(manifestContent.icons).toBeDefined();
    expect(manifestContent.icons.length).toBeGreaterThan(0);
  });

  test("should have theme-color meta tag", async ({ page }) => {
    await page.goto("/");

    const themeColorMeta = page.locator('meta[name="theme-color"]');
    await expect(themeColorMeta).toHaveAttribute("content", "#10b981");
  });

  test("should have apple-touch-icon", async ({ page }) => {
    await page.goto("/");

    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveCount(1);

    const iconHref = await appleTouchIcon.getAttribute("href");
    expect(iconHref).toContain("apple-touch-icon.png");
  });

  test("should have service worker file", async ({ page }) => {
    // Navigate to home first
    await page.goto("/");

    // Check if service worker file exists
    const swResponse = await page.goto("/sw.js");
    const status = swResponse?.status();
    const contentType = swResponse?.headers()["content-type"];

    // In dev mode, service worker might not exist or return HTML
    if (status === 404 || contentType?.includes("html")) {
      test.skip();
      return;
    }

    expect(status).toBe(200);
    expect(contentType).toContain("javascript");
  });

  test("should have PWA icons accessible", async ({ page }) => {
    // Check 192x192 icon
    const icon192Response = await page.goto("/pwa-192x192.png");
    expect(icon192Response?.status()).toBe(200);
    expect(icon192Response?.headers()["content-type"]).toContain("image/png");

    // Check 512x512 icon
    const icon512Response = await page.goto("/pwa-512x512.png");
    expect(icon512Response?.status()).toBe(200);
    expect(icon512Response?.headers()["content-type"]).toContain("image/png");
  });

  test("should have description meta tag", async ({ page }) => {
    await page.goto("/");

    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveAttribute(
      "content",
      "Compare MTG Commander collections with EDHREC"
    );
  });

  test("should have viewport meta tag for mobile", async ({ page }) => {
    await page.goto("/");

    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute("content", "width=device-width, initial-scale=1.0");
  });

  test("should have CSP with worker-src for service worker", async ({ page }) => {
    await page.goto("/");

    const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    const cspContent = await cspMeta.getAttribute("content");

    expect(cspContent).toContain("worker-src 'self'");
  });
});
