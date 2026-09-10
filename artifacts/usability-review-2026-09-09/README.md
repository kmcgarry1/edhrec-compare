# Review evidence

Read the [review](../../docs/USABILITY_VISUAL_REVIEW_2026-09-09.md) for findings and interpretation.

Screenshots ending in `-viewport` show initial browser viewports. `-scrolled` captures show sticky behavior. `loaded-results-*` use the repository's four-card response fixture. `card-preview-mobile.png` uses fixture metadata and intentionally unavailable fixture imagery. Full-page images may include deferred content or enrichment in progress.

The JSON files contain raw measurements and diagnostic observations. A recorded timeout is not automatically an application defect: the report distinguishes failed diagnostic selectors from reproduced UI failures. In particular, `additional-observations.json` attempted a nonexistent 200% app setting; the separate preview script checks the real 130% control and applies a CSS 200% stress check afterward. The first controlled preview attempt resized a desktop context; the dedicated touch-context script supplies the confirmed preview findings.

Reproduction scripts are exploratory browser probes, not additions to the project's regression suite. Run from the repository root with Vite listening on port 4173, for example:

```powershell
npm run dev -- --port 4173
node artifacts/usability-review-2026-09-09/audit-preview.mjs
```

They use the installed `@playwright/test` package and local Microsoft Edge (`channel: 'msedge'`). They overwrite their corresponding evidence files. Live probes contact EDHREC and Scryfall; fixture probes intercept the response types described in the report. No collection from the user was used: imports were small synthetic CSVs.
