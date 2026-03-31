# Commander Scout (`edhrec-compare`)

Commander Scout is a Vue 3 + TypeScript + Vite application for comparing EDHREC commander data against your personal collection. Upload a CSV, explore EDHREC cardlists, and enrich them with Scryfall pricing, imagery, and card metadata.

## Features

- Commander search with EDHREC route filters and partner support
- Collection overlay with owned and missing card views
- Scryfall enrichment for prices, mana costs, oracle text, printings, and images
- Virtualized card tables for dense cardlist browsing
- Top-commanders scan against your uploaded collection
- Theme, density, accessibility, and background preferences persisted locally
- Global notices and loading feedback for long-running fetches

## Project Structure

```text
src/
|-- api/                 # EDHREC and Scryfall clients, caching, request dedupe
|-- components/          # Route shells, feature UI, and core primitives
|   |-- core/            # Primitive design system
|   |-- dashboard/       # Dashboard route surfaces
|   `-- top-commanders/  # Top-commanders route surfaces
|-- composables/         # Shared reactive state and feature logic
|-- router/              # Vue Router definitions
|-- types/               # Shared TypeScript types
|-- utils/               # Pure helpers and infrastructure utilities
`-- style.css            # Global tokens, themes, and layout rules

docs/                    # Reviews, architecture notes, QA, and issue archive
tests/
|-- unit/                # Vitest unit and component coverage
`-- e2e/                 # Playwright flows
```

## Getting Started

```bash
npm install
npm run dev
```

Additional commands:

```bash
npm run build
npm run preview
npm run lint
npm run test:unit
npm run test:e2e
```

The dev server defaults to `http://localhost:5173`.

## Environment Variables

### Optional

- `VITE_SENTRY_DSN`: enables production Sentry error tracking

### Notes

- Sentry only initializes in production builds.
- CSV-related context is filtered before telemetry is sent.
- No custom environment variables are required for local development.

## Security Hardening

- A real Content Security Policy is shipped through both [index.html](./index.html) and [vercel.json](./vercel.json).
- CSP violations are reported to [api/csp-report.ts](./api/csp-report.ts).
- CSV collection data stays in browser memory and is not persisted.
- User-controlled content is rendered as text; there is no `v-html` usage in `src/`.

For the current security review, see [docs/SECURITY_REVIEW.md](./docs/SECURITY_REVIEW.md).

## Development Workflow

1. Run `npm run dev`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Run `npm run test:unit`.
5. Run `npm run test:e2e`.

Useful supporting commands:

- `npm run bundle:analyze`
- `npm run size`
- `npm run docs`

## CSV Requirements

Commander Scout accepts comma-delimited CSV files with these conventions:

- Required column: `Name` or `Card Name`
- Optional columns: `Quantity`, `Foil`, `Set`
- Combined names like `Front // Back` are normalized for matching
- Validation catches missing headers, malformed rows, and blank imports before data is loaded

Example:

```csv
Name,Quantity,Foil,Set
Sol Ring,1,No,C21
Lightning Greaves,1,Yes,M19
```

Sample assets:

- [src/assets/inventory-template.csv](./src/assets/inventory-template.csv)
- [src/assets/inventory.csv](./src/assets/inventory.csv)

## EDHREC And Scryfall Integrations

- EDHREC deck data is fetched from `https://json.edhrec.com/pages/...`
- Scryfall card data is fetched from `https://api.scryfall.com`
- Scryfall card responses are cached in IndexedDB with TTL-based expiry
- In-flight API requests are deduplicated to reduce duplicate network work

Implementation references:

- [src/api/edhrecApi.ts](./src/api/edhrecApi.ts)
- [src/api/scryfallApi.ts](./src/api/scryfallApi.ts)
- [src/api/indexedDbCache.ts](./src/api/indexedDbCache.ts)
- [src/api/requestCache.ts](./src/api/requestCache.ts)

## Testing

- Vitest: `npm run test:unit`
- Playwright: `npm run test:e2e`
- Bundle analysis: `npm run bundle:analyze`
- Size budgets: `npm run size`

CI also runs build, bundle analysis, size checks, unit tests, and Playwright coverage via [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Issue Automation

Historical architecture and design review issues live under `docs/issues/`.

If you need to export issue docs for Jira or Trello:

```bash
npm run issues:export -- --repo your-org/edhrec-compare
```

See [docs/ISSUE_AUTOMATION.md](./docs/ISSUE_AUTOMATION.md) for details.

Important: several archived issue files describe work that has already landed, especially around caching, request deduplication, virtualization, code splitting, and CSP. Check [docs/REVIEWS_COMPLETE.md](./docs/REVIEWS_COMPLETE.md) before recreating backlog items.

## Contributing

1. Fork and clone the repo.
2. Create a feature branch.
3. Verify the CSV, commander search, and EDHREC flows locally.
4. Add or update tests when behavior changes.
5. Open a pull request with a focused summary of the change.

## Architecture

For the current technical architecture, see:

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/ARCHITECTURE_REVIEW_SUMMARY.md](./docs/ARCHITECTURE_REVIEW_SUMMARY.md)
- [src/components/core/README.md](./src/components/core/README.md)

## Active Reviews

Start with [docs/REVIEWS_COMPLETE.md](./docs/REVIEWS_COMPLETE.md).

Current lead reviews:

- Architecture: [docs/ARCHITECTURE_REVIEW_SUMMARY.md](./docs/ARCHITECTURE_REVIEW_SUMMARY.md)
- Security: [docs/SECURITY_REVIEW.md](./docs/SECURITY_REVIEW.md)
- UI/UX: [VISUAL_DESIGN_REVIEW_SUMMARY.md](./VISUAL_DESIGN_REVIEW_SUMMARY.md)
- Route audit: [docs/VISUAL_AUDIT_2026-03-24.md](./docs/VISUAL_AUDIT_2026-03-24.md)

Historical November 2025 review documents remain in `docs/` for context, but they are not the current source of truth for implementation status.

---

Maintained by the Commander Scout team.
