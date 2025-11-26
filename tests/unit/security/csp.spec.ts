import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const POLICY =
  "default-src 'self'; base-uri 'self'; connect-src 'self' https://api.scryfall.com https://json.edhrec.com https://vitals.vercel-insights.com https://*.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://va.vercel-scripts.com https://vercel.com; font-src 'self' data:; frame-ancestors 'none'; frame-src 'none'; img-src 'self' data: blob: https://cards.scryfall.io https://c1.scryfall.com https://c2.scryfall.com https://c3.scryfall.com https://svgs.scryfall.io; manifest-src 'self'; media-src 'self' data:; object-src 'none'; script-src 'self' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint;";

const readRootFile = (relativePath: string) =>
  readFileSync(path.resolve(PROJECT_ROOT, relativePath), "utf-8");

describe("Content Security Policy", () => {
  it("keeps the HTML meta policy synchronized with the canonical value", () => {
    const html = readRootFile("index.html");
    expect(html).toContain(POLICY);
  });

  it("keeps the Vercel header policy synchronized with the canonical value", () => {
    const configRaw = readRootFile("vercel.json");
    const config = JSON.parse(configRaw) as {
      headers?: Array<{
        headers?: Array<{ key?: string; value?: string }>;
      }>;
    };

    const cspHeader = config.headers
      ?.flatMap((entry) => entry.headers ?? [])
      .find((header) => header.key?.toLowerCase() === "content-security-policy");

    expect(cspHeader?.value).toBe(POLICY);
  });
});
