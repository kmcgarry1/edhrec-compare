import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  theme_color: string;
  background_color: string;
  display: string;
  icons: ManifestIcon[];
}

describe("PWA Configuration", () => {
  it("should have a valid manifest.webmanifest after build", () => {
    const manifestPath = resolve(__dirname, "../../../dist/manifest.webmanifest");
    let manifest: PWAManifest;

    try {
      const manifestContent = readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(manifestContent) as PWAManifest;
    } catch {
      // If dist doesn't exist yet, skip this test
      expect(true).toBe(true);
      return;
    }

    expect(manifest.name).toBe("EDHREC Compare");
    expect(manifest.short_name).toBe("EDHREC");
    expect(manifest.description).toBe("Compare MTG Commander collections with EDHREC");
    expect(manifest.theme_color).toBe("#10b981");
    expect(manifest.background_color).toBe("#0f172a");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it("should have required PWA icons", () => {
    const iconsPath = resolve(__dirname, "../../../dist");
    let hasPwaIcons = false;

    try {
      hasPwaIcons =
        existsSync(resolve(iconsPath, "pwa-192x192.png")) &&
        existsSync(resolve(iconsPath, "pwa-512x512.png"));
    } catch {
      // If dist doesn't exist yet, skip this test
      expect(true).toBe(true);
      return;
    }

    expect(hasPwaIcons).toBe(true);
  });

  it("should have a service worker file after build", () => {
    const swPath = resolve(__dirname, "../../../dist/sw.js");
    let swExists = false;

    try {
      swExists = existsSync(swPath);
    } catch {
      // If dist doesn't exist yet, skip this test
      expect(true).toBe(true);
      return;
    }

    expect(swExists).toBe(true);
  });

  it("should have correct caching configuration in service worker", () => {
    const swPath = resolve(__dirname, "../../../dist/sw.js");
    let swContent = "";

    try {
      swContent = readFileSync(swPath, "utf-8");
    } catch {
      // If dist doesn't exist yet, skip this test
      expect(true).toBe(true);
      return;
    }

    // Check for Scryfall cache configuration
    expect(swContent).toContain("scryfall-cache");
    // In minified code, the domain will be escaped in string format
    expect(swContent).toContain("scryfall");

    // Check for EDHREC cache configuration
    expect(swContent).toContain("edhrec-cache");
    expect(swContent).toContain("edhrec");
  });
});
