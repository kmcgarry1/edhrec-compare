# Commander Scout (edhrec-compare)

Commander Scout is a Vue 3 + TypeScript + Vite application that compares EDHREC commander data with your personal card inventory. Upload a CSV of your collection, explore EDHREC cardlists, and layer in Scryfall pricing/images to quickly spot what you own versus what you still need.

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Development Workflow](#development-workflow)
6. [CSV Requirements](#csv-requirements)
7. [EDHREC & Scryfall Integrations](#edhrec--scryfall-integrations)
8. [Testing](#testing)
9. [Issue Automation](#issue-automation)
10. [Contributing](#contributing)
11. [Architecture](#architecture)

## Features

- ?? **Commander search** � fuzzy search EDHREC commanders (including partner combinations) and fetch the JSON decklists directly from `json.edhrec.com`.
- ??? **Inventory overlay** � upload a CSV export of your collection to highlight owned cards in every EDHREC cardlist, or filter to owned/unowned only.
- ?? **Scryfall enrichment** � bulk Scryfall requests (75 identifiers per batch) fetch mana costs, faces, oracle text, set, rarity, and live USD/EUR prices. Handles double-faced, adventure, split, and transform cards by normalizing both halves.
- ?? **Dynamic background** � nebula gradient changes with commander color identity but can be toggled off via the palette button (preference stored in `localStorage`).
- ?? **Global feedback** � unobtrusive toast notifications and bottom-of-screen loaders keep users informed while bulk Scryfall calls or CSV processing occurs.
- ?? **Toolkit header** � hideable control bar with bracket/budget/page-type filters, commander slug export, CSV upload controls, theme toggle, and background toggle.

## Project Structure

```
+-- src/
�   +-- api/               # Scryfall wrappers, EDHREC fetch helpers
�   +-- components/        # Vue components (CommanderSearch, EdhrecReader, etc.)
�   +-- composables/       # Reusable state (theme, background pref, commander colors)
�   +-- utils/             # Download helpers, slugify utilities, CSV parsing
�   +-- assets/            # Static assets (sample CSV, icons)
+-- docs/                  # Architecture review + issue templates
+-- tests/                 # Playwright end-to-end specs
+-- playwright-report/     # Generated on test runs (ignored)
+-- README.md
```

## Getting Started

```bash
# install dependencies
npm install

# run dev server
npm run dev

# build for production
npm run build

# preview production build locally
npm run preview
```

The Vite dev server defaults to `http://localhost:5173`.

## Environment Variables

### Optional Configuration

The following environment variables can be configured for production deployments:

#### Sentry Error Tracking (Production Only)

- **`VITE_SENTRY_DSN`** � Sentry Data Source Name for error tracking in production
  - Only active when `import.meta.env.PROD` is true
  - Automatically filters out sensitive data (CSV contents)
  - Generates source maps for readable stack traces
  - 10% sample rate for performance monitoring
  - To enable:
    1. Create a [Sentry account](https://sentry.io/) and project
    2. Copy `.env.example` to `.env`
    3. Set `VITE_SENTRY_DSN` to your project's DSN
    4. Build and deploy to production

### Local Development

No custom environment variables are required for local development. Network requests hit the public EDHREC and Scryfall APIs directly from the browser.

## Security Hardening

### Content Security Policy

- A strict CSP is shipped through both `index.html` and the production headers declared in `vercel.json`. It locks execution to the same origin by default and only whitelists the remote services the client actually talks to (EDHREC JSON endpoints, Scryfall APIs, Sentry ingestion, and Vercel analytics scripts).
- Violations are reported to the new serverless logger at `/api/csp-report`, which emits structured events to the deployment logs. Browsers that support `report-to` automatically leverage the `Report-To`/`NEL` headers to batch reports; legacy agents fall back to `report-uri`.
- If you deploy Commander Scout under a different domain or need extra allowances (for example, a CDN for fonts), update both the CSP string and the `Report-To` URL in `vercel.json` so the `report-to csp-endpoint` directive keeps pointing to a reachable HTTPS endpoint.

## Development Workflow

1. **Start Dev Server** � `npm run dev`.
2. **Run Linting (optional)** � if you add ESLint/Prettier, include commands here.
3. **E2E Testing** � `npm run test:e2e` executes Playwright against the built app.
4. **Feature Flags** � background toggle + theme toggle are persisted via `localStorage` (`edhrec-background-enabled`, `edhrec-color-scheme`). When debugging display issues, clear local storage or use your browser devtools.
5. **CSV Upload Loop** � the CSV parser lives in `src/composables/useCsvUpload.ts`. It auto-detects the `Name` column (defaults to first column) and produces normalized name variants so MDFCs or split cards match both faces.

## CSV Requirements

Commander Scout accepts any comma-delimited CSV that follows these rules:

- **Required column**
  - `Name` or `Card Name` – used to match EDHREC entries (case-insensitive).
- **Optional columns**
  - `Quantity` – number of copies (defaults to `1` if omitted).
  - `Foil` – `Yes` or `No` flag.
  - `Set` – three-letter set code.
  - Any other columns are ignored by the matcher but kept in memory if you want to build on them later.
- Entries can contain combined names with `//`. The app normalizes and stores all variants (`front`, `back`, and combined) to ensure matches.
- The uploader validates your CSV and surfaces warnings for missing `Name` headers, empty rows, or malformed column counts before importing any data.

Example CSV:

```
Name,Quantity,Foil,Set
Sol Ring,1,No,C21
Lightning Greaves,1,Yes,M19
```

- Sample template: `src/assets/inventory-template.csv` (downloadable in the upload modal).
- Full inventory sample: `src/assets/inventory.csv`.

## EDHREC & Scryfall Integrations

- **EDHREC** � Commander slugs are constructed via `slugifyCommander` and requests follow `https://json.edhrec.com/pages/{pageType}/{slug}/...`. Filters (bracket, modifier, companion) append extra path segments.
- **Scryfall**
  - Single-card lookups use `/cards/named?fuzzy=` with sanitized names (front face only).
  - Bulk lookups use `/cards/collection` with 75-card batches plus 300ms pause to respect rate limits.
  - Image previews favor `image_uris.normal` and fall back to per-face URIs.
  - Double-faced cards: we sanitize `//` names, register each face in the lookup map, and match whichever face EDHREC lists.

## Testing

- **Playwright** � `npm run test:e2e`
  - Uses fixtures under `tests/e2e`.
  - Generated artifacts live in `playwright-report/` and `test-results/` (gitignored).
- Add unit/component tests as needed (Vitest/Jest not currently configured).

## Issue Automation

Architecture and design review issues live under `docs/issues/high-priority|medium-priority|low-priority`. To convert them into GitHub issues:

```bash
chmod +x create-issues.sh
./create-issues.sh
```

The script expects the GitHub CLI (`gh`) to be installed and authenticated. Alternatively, follow the manual instructions in `docs/CREATE_GITHUB_ISSUES.md`.

**Available Issues:**

- **UI/UX Issues:** 7 issues (already created as #69-#75)
- **Architecture Issues:** 9 new issues covering performance, reliability, and maintenance

## Contributing

1. Fork + clone the repo.
2. Create a feature branch.
3. Run the dev server, verify CSV + EDHREC flows.
4. Add/update tests as needed.
5. Open a pull request describing the change, and reference any architecture issues if applicable.

## Architecture

For detailed information about the project's architecture, technology decisions, and design patterns, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Comprehensive Reviews

Commander Scout has undergone comprehensive reviews across multiple dimensions (November 2025):

**Completed Reviews:**

- ✅ **Code Review** - [Architecture Review Summary](./docs/ARCHITECTURE_REVIEW_SUMMARY.md) - 9 improvement opportunities identified
- ✅ **Design/UI/UX Review** - [Visual Design Review Summary](./VISUAL_DESIGN_REVIEW_SUMMARY.md) - 7 issues documented (#69-#75)
- ✅ **Accessibility Review** - [Accessibility Guide](./docs/ACCESSIBILITY.md) - WCAG 2.1 guidelines
- ✅ **Performance Review** - [Performance Analysis](./docs/PERFORMANCE_REVIEW.md) - Caching, optimization opportunities
- ✅ **Security Review** - [Security Assessment](./docs/SECURITY_REVIEW.md) - CSP, input sanitization recommendations
- ✅ **Functionality Review** - [Feature Testing](./docs/FUNCTIONALITY_REVIEW.md) - 98% test pass rate
- ✅ **Compatibility Review** - [Cross-Browser Testing](./docs/COMPATIBILITY_REVIEW.md) - Browser/device testing needs
- ✅ **Compliance Review** - [Legal & Standards](./docs/COMPLIANCE_REVIEW.md) - GDPR, WCAG, privacy policy needs
- ✅ **Monitoring Review** - [Analytics & Tracking](./docs/MONITORING_ANALYTICS_REVIEW.md) - Error tracking, analytics strategy
- ✅ **Marketing Review** - [Content & Messaging](./docs/CONTENT_MARKETING_REVIEW.md) - Documentation, SEO, branding

**Summary:** [Comprehensive Review Summary](./docs/COMPREHENSIVE_REVIEW_SUMMARY.md) - 51 issues identified across all reviews

**Implementation:** See [Creating Review Issues](./docs/CREATE_REVIEW_ISSUES.md) for GitHub issue creation instructions

---

Maintained by the Commander Scout team. Reach out via GitHub issues if you have questions or suggestions.
