# Commander Scout: usability and visual review

Reviewed 9 September 2026 against the running local application.

## Overall assessment

The interface has a recognizable palette and useful underlying functionality, but its layout repeatedly prioritizes explanatory panels, decoration, and status labels over the work users came to do. Search is below the fold, commander results are preceded by a miniature dashboard, and the ranking page spends its first screen explaining ranking. The result feels more like a presentation of a tool than an efficient tool.

This needs a structural simplification, not another layer of visual polish. Keep the warm palette, card artwork, ownership comparison, and direct commander links. Remove much of the framing around them. Several problems also come from component defaults and responsive breakpoints, rather than subjective design choices.

## Evidence and scope

Reviewed all four routes: home, commander detail, top commanders, and release notes. Browser inspection used local Vite and headless Microsoft Edge through Playwright at widths of 390, 768, 1100, and 1440 CSS pixels. Main viewport captures are 900 pixels high; mobile interaction checks used 390 × 844, including a touch-enabled context. Light and dark appearance were inspected.

Live EDHREC/Scryfall responses were used for the route and layout review. Controlled EDHREC and Scryfall collection fixtures were used to verify keyboard search, loaded rows, ownership filtering, and filtered export. A separate mobile preview check used fixture card metadata; its unavailable image is a fixture limitation, not a production image defect. A 503 response was injected to inspect error handling.

This is an expert review, not a user study or formal accessibility conformance audit. It does not establish production API reliability, cross-browser compatibility, complete partner legality, or correctness of a full top-50 ownership scan. A 200% CSS text-size stress check produced no document-width overflow; it is not equivalent to a complete browser-zoom test. The app's own 130% setting could not be clicked on mobile because of the View-menu defect below.

Screenshots, raw observations, and reproduction scripts are in [the evidence folder](../artifacts/usability-review-2026-09-09/). Full-page screenshots containing deferred rendering or in-progress enrichment should not be interpreted as proof of permanently blank content; the viewport and controlled loaded-state captures are the stronger layout evidence.

### Measured distance to useful content

Positions are CSS pixels from the document top at initial scroll position; the first section position is its header, not its first card.

| Viewport width | Sticky app header height | Home search top | Commander first section top |
| -------------- | -----------------------: | --------------: | --------------------------: |
| 390            |                      233 |            1309 |                        1511 |
| 768            |                      177 |             951 |                        1117 |
| 1100           |                      133 |            1047 |                        1011 |
| 1440           |                       90 |            1048 |                         948 |

Search misses the initial 900-pixel viewport at every tested width. This is the clearest evidence that the stated search-first intent is not reflected in the layout.

## Findings, ordered by priority

P1 means a blocked interaction, misleading comparison result, or substantial obstruction of the main task. P2 means meaningful friction or visual hierarchy debt. P3 means lower-impact polish. These are review priorities, not security severities.

### 1. P1 — Commander controls disappear between 1024 and 1279 pixels

At 1100 pixels, clicking **Change commander** leaves focus on that button and opens nothing. The browse rail switches to a sheet below 1280 pixels, but the masthead switches from **Browse rail** to **Change commander** at 1024 pixels. The latter attempts to focus a search component that is not mounted in the closed sheet. Users also lose the visible entry to route and ownership filters in this range.

**Fix:** use one breakpoint for rail visibility and its trigger. Below that breakpoint, explicitly open the sheet before focusing the search field. Verify at 1023, 1024, 1100, 1279, and 1280 pixels.

Evidence: [1100-pixel commander view](../artifacts/usability-review-2026-09-09/commander-1100-viewport.png), `change1100` in [interaction observations](../artifacts/usability-review-2026-09-09/interaction-observations.json). Sources: [masthead](../src/components/commander-route/CommanderRouteMasthead.vue), [browse rail](../src/components/dashboard/DashboardBrowseRail.vue).

### 2. P1 — Mobile display/accessibility settings are partly unreachable

At 390 × 844, the View panel starts at approximately y=228 and is 850 pixels tall. It has no bounded scrolling region. Its lower settings and closing controls extend below the screen; attempting to click the 130% text-size radio repeatedly fails because it remains outside the viewport. This is especially problematic for the very controls intended to improve accessibility.

**Fix:** use a mobile sheet with a fixed header and a scrollable body, or constrain the popover to available viewport height. Keep Close reachable at all times. Check with increased text size and a short landscape viewport.

Evidence: [View menu](../artifacts/usability-review-2026-09-09/view-menu-mobile.png), [preview and text-size observations](../artifacts/usability-review-2026-09-09/preview-observations.json). Source: [AppUtilityMenu.vue](../src/components/AppUtilityMenu.vue).

### 3. P1 — The main search action is buried beneath the introduction

The home page places a long display headline, explanatory paragraph, three instructional cards, and generous gaps above search. Desktop devotes roughly half the composition to quick-pick art and unused space while squeezing the headline into multiple lines. Mobile removes the artwork but retains the entire preamble and stacks the three instruction cards.

The primary filled action is Upload Collection, even though the copy says to start with a commander. “Search is the fastest entry” appears underneath a search input that users have already had to scroll to find.

**Fix:** put a short heading, one sentence, and search at the top. Place upload and top-commanders discovery beside or immediately below it. Move instructions into optional help or a compact single line. Keep quick picks beneath the input or in a genuinely secondary desktop column. Target a visible, usable search field in the first 390 × 844 and 1440 × 900 screen.

Evidence: [desktop home](../artifacts/usability-review-2026-09-09/home-1440.png), [mobile first screen](../artifacts/usability-review-2026-09-09/home-390-viewport.png). Sources: [selection stage](../src/components/dashboard/DashboardSelectionStage.vue), [Dashboard.vue](../src/components/Dashboard.vue).

### 4. P1 — Mobile sticky chrome consumes too much of the reading area

The mobile app header is about 233 pixels tall: branding and tagline, two rows of navigation, and a collection/action row. It remains sticky while users read results. The separate results bar sticks at `top: 1rem` beneath a higher-z-index app header, so parts of it disappear behind the header. A bottom loading banner can obscure more of the remaining space.

Section navigation also uses a fixed 80-pixel scroll offset, which does not account for the mobile header or results bar. These systems do not share a coherent positioning model.

**Fix:** make the mobile header one compact row, move secondary navigation into a menu, and combine results navigation and filtering into one compact sticky control strip. Derive section scrolling from the actual sticky stack height. Do not leave the whole explanatory results panel sticky.

Evidence: [mobile scrolled results](../artifacts/usability-review-2026-09-09/commander-390-scrolled.png), [desktop overlap](../artifacts/usability-review-2026-09-09/commander-1440-scrolled.png). Sources: [app header](../src/components/AppShellHeader.vue), [results bar](../src/components/commander-route/CommanderResultsCommandBar.vue), [section navigation](../src/composables/useEdhrecCardlists.ts).

### 5. P1 — “No collection” is presented as “you own nothing”

Before upload, commander sections report “0% owned,” “0 owned | 2 missing,” and unchecked ownership boxes. There has been no comparison. This turns unknown information into a definitive result and conflicts with the top-commanders page, which uses an unknown ownership value.

Filtering introduces another ambiguity: in a two-card fixture with one owned card, selecting Owned changes the section to “100% owned” and “1 owned | 0 missing.” That is true of the filtered subset, but easily mistaken for completion of the original section.

**Fix:** show “Upload a collection to compare” before import and suppress ownership percentages. Keep full-section coverage stable when filtering, with a separate “Showing 1 owned card of 2 recommendations” count. Explicitly distinguish visible-result counts from collection coverage.

Evidence: [loaded section before upload](../artifacts/usability-review-2026-09-09/loaded-results-desktop.png), [filtered section](../artifacts/usability-review-2026-09-09/loaded-results-mobile.png), [controlled observations](../artifacts/usability-review-2026-09-09/controlled-observations.json). Source: [CommanderCardlistSection.vue](../src/components/commander-route/CommanderCardlistSection.vue).

### 6. P1 — Ranking-card sizing breaks the primary information hierarchy

The Owned badge occupies most of the card width, forcing commander names into very narrow columns. “The Ur-Dragon” wraps across multiple short lines. Artwork intended to be a small portrait stretches into a wide strip. The empty ownership placeholder is visually more prominent than the commander being ranked.

The shared `CSurface` defaults to `fullWidth: true`, adding `w-full`. Its use for the nonshrinking Owned badge is inappropriate. The thumbnail also combines this default with an explicit width. The inner grid uses `sm:grid-cols-[5rem,minmax(0,1fr)]`; its comma-separated value should be checked because grid track lists require valid separation. These are concrete implementation problems in addition to a poor comparison format.

**Fix:** correct width and grid behavior first. Then use compact ranking rows with aligned rank, commander, color identity, deck count, and ownership. Make name the dominant text; keep the artwork a fixed thumbnail. A gallery can remain optional.

Evidence: [ranking cards](../artifacts/usability-review-2026-09-09/top-ranking-desktop.png), [full live ranking page](../artifacts/usability-review-2026-09-09/top-1440.png). Sources: [TopCommanderCard.vue](../src/components/top-commanders/TopCommanderCard.vue), [CSurface.vue](../src/components/core/CSurface.vue).

### 7. P1 — Card previews lack an accessible modal contract; desktop rows lack keyboard activation

A touch-enabled mobile check opened Card Preview, but the accessibility tree contained no dialog role and Escape did not close it. The preview source has no dialog semantics or focus-trap integration. In desktop table mode, the clickable row is a plain `tr` with pointer handlers and no keyboard activation; its checkbox is disabled. Mobile rows, by contrast, do have button semantics and Enter/Space handlers.

**Fix:** provide an explicit, keyboard-focusable card-details button or link in each desktop row. Use the shared modal/focus-management behavior for previews, including a name, dialog semantics, Escape, initial focus, and focus restoration.

Evidence: [mobile preview](../artifacts/usability-review-2026-09-09/card-preview-mobile.png), [preview observations](../artifacts/usability-review-2026-09-09/preview-observations.json). Sources: [preview](../src/components/scryfall/ScryfallCardPreview.vue), [desktop row](../src/components/scryfall/ScryfallCardRowTable.vue).

### 8. P2 — The commander masthead delays the actual comparison

The masthead contains status chips, five statistic panels, upload advice, a printing panel, prices, large artwork, and several actions. Active sections, visible cards, and deck view then reappear in the results bar. The first section begins around y=948 on desktop and y=1511 on mobile; its cards are farther down.

Printing choice and release date are useful secondary details, but they currently outrank the owned/missing comparison. The bright Change commander action also asks users to undo the selection they just made.

**Fix:** reduce the masthead to commander name, small art, compact metadata, and a details disclosure. Put All / Owned / Missing and Export directly above results. Treat Change commander as secondary. Aim for actual card rows within the first desktop screen.

Evidence: [commander first screen](../artifacts/usability-review-2026-09-09/commander-1440-viewport.png). Sources: [CommanderRoutePage.vue](../src/components/CommanderRoutePage.vue), [masthead](../src/components/commander-route/CommanderRouteMasthead.vue).

### 9. P2 — Top commanders is arranged as a landing page rather than a ranking tool

The first desktop viewport shows the hero, an “Editorial brief,” nested instruction panels, upload status, and scan support. No ranked commander appears. At 1440 pixels, an individual ranking card is approximately 409 pixels tall even before meaningful ownership data is present. The same “Upload CSV” explanation and rainbow ownership scale repeat throughout the list.

**Fix:** replace the hero and support panels with a short title, a single collection-status message, and compact range/sort/color controls. Show ranked entries immediately. Explain ownership once. Suppress the spectrum when ownership is unknown, and use a simple labeled percentage/bar once available.

Evidence: [top-commanders first screen](../artifacts/usability-review-2026-09-09/top-1440-viewport.png). Sources: [TopCommandersPage.vue](../src/components/TopCommandersPage.vue), [hero](../src/components/top-commanders/TopCommandersHero.vue).

### 10. P2 — Product copy exposes internal design terminology

Examples include “Dashboard-first workflow,” “Commander destination,” “Results command bar,” “Section scan and deck context,” “Browse rail,” “Collection lens,” “Page lens,” and “Editorial brief.” Some paragraphs literally instruct users about how the layout is supposed to work: “Keep the masthead focused on route identity…” and “Secondary actions stay in the utility tray…”

This wording makes simple actions sound technical and asks users to understand the application's structure. The problem is especially acute for **Browse rail**, which hides the everyday task of changing filters.

**Fix:** use task labels: “Find a commander,” “Cards,” “Filters,” “Collection,” and “Export.” Remove design explanations. Replace “Collection pending” with “No collection uploaded”; pending otherwise suggests background work. Release notes should explain user-visible changes rather than how the repository renders the page.

Sources: [selection stage](../src/components/dashboard/DashboardSelectionStage.vue), [results bar](../src/components/commander-route/CommanderResultsCommandBar.vue), [top hero](../src/components/top-commanders/TopCommandersHero.vue), [release notes](../src/components/ChangelogPage.vue).

### 11. P2 — Nested surfaces and shadows obscure hierarchy

Page, masthead, inset border, statistic card, badge, content wrapper, section, and table all receive rounded containers. Nearly every element looks raised. Broad green/beige glows and heavy shadows make the light theme feel muddy; the same elevation treatment makes passive facts resemble controls. Section titles and ownership percentages are repeated within each section.

**Fix:** establish three simple layers: page background, main content surface, overlay. Use whitespace and separators inside content. Reserve shadows for overlays and restrained major elevation. Use smaller radii for controls and tables; eliminate most inner boxes and redundant percentage decorations. Keep artwork as the main source of visual richness.

Evidence: [loaded desktop results](../artifacts/usability-review-2026-09-09/loaded-results-desktop.png), [home](../artifacts/usability-review-2026-09-09/home-1440.png). Sources: [surface defaults](../src/components/core/CSurface.vue), [shared visual configuration](../src/components/core/config.ts).

### 12. P2 — Typography defaults undermine the intended visual system

The home headline measured 86.4 pixels of line height, contributing heavily to its height. `CText` adds `leading-normal` by default alongside the display variant's tight leading. Its scoped `font-family: inherit` also overrides the heading font rule, while directly authored modal headings use the serif display treatment. The app therefore mixes typography behaviors according to component implementation rather than information hierarchy.

Small, widely tracked uppercase labels are overused for information users need to scan quickly. “CURRENT PRINTING,” “PAGE LENS,” and other minor labels are given the same stylistic attention as meaningful structure.

**Fix:** let each text variant define its default leading and font; apply overrides only when explicitly supplied. Shorten headlines, use normal case for most labels, and make important card names and values easier to read than decorative captions.

Sources: [CText.vue](../src/components/core/CText.vue), [text variants](../src/components/core/config.ts), [global typography](../src/style.css). Evidence: [dark appearance](../artifacts/usability-review-2026-09-09/home-dark.png), [upload typography](../artifacts/usability-review-2026-09-09/upload-mobile.png).

### 13. P2 — Too many controls compete for primary emphasis

Filled upload actions recur in the shell and landing page. Every expanded section gets a filled Download button. Passive badges, segmented filters, navigation links, and action buttons all use similar pill shapes. Section export can appear more important than inspecting the cards, while whole-result export is hidden in Utilities.

**Fix:** choose the main action for each state: search initially, compare/filter after selection, export after reviewing results. Put one whole-result Export action next to ownership filters, with an explicit count and scope. Make per-section exports a quieter action menu. Reduce duplicate upload calls to action after import.

Sources: [app header](../src/components/AppShellHeader.vue), [section actions](../src/components/commander-route/CommanderCardlistSection.vue), [utility content](../src/components/dashboard/DashboardUtilityContent.vue).

### 14. P2 — Upload asks an unnecessary workflow question and ends weakly

Before file selection, users must parse “Compare commander decks” versus “Top 50 scan.” Both use the same collection. The choice appears to govern data usage, while the top-commanders route independently starts scanning uploaded rows. The utility panel can tell users to return to the upload modal and choose Top 50 scan despite a collection already being loaded.

Success says “Valid CSV,” “Found 3 cards,” and “3 rows detected,” with only Close as the next action. A file with an unrecognized first-column header was accepted with both a green Valid CSV message and a warning that the first column would be used. That is recoverable behavior, but the mapping decision deserves clearer confirmation.

**Fix:** import the collection once, then offer “Compare a commander” and “Find commanders I can build.” Add a compact import summary, explicit mapped name column, and “Done — use collection” action. Keep the session-only behavior visible in ordinary language. Put Close in a consistently reachable header, especially after warnings expand the modal.

Evidence: [upload](../artifacts/usability-review-2026-09-09/upload-mobile.png), [upload observations](../artifacts/usability-review-2026-09-09/interaction-observations.json). Sources: [CSVUpload.vue](../src/components/CSVUpload.vue), [TopCommandersPage.vue](../src/components/TopCommandersPage.vue), [scan panel](../src/components/TopCommanderScanPanel.vue).

### 15. P2 — Loading and failure feedback interrupt the task without enough recovery

Live commander enrichment showed a large fixed loading banner while every expanded section displayed five large skeleton cards. Card names are already known from EDHREC, yet the section replaces its useful content until bulk enrichment finishes. This exaggerates perceived waiting and creates very long temporary pages.

With an injected EDHREC 503, the page retained a full metadata masthead, “0 of 0” statistics, an Expand all control, and “while results finish loading” text above the eventual error. There was no inline Retry action in the commander error notice. Failure and loading were not cleanly distinguished.

**Fix:** render names immediately and fill prices/images progressively. Use small local loading indicators. Give errors a concise explanation, Retry, and the existing external EDHREC link as a fallback. Hide loading language and irrelevant summary controls when the request has failed.

Evidence: [live loading](../artifacts/usability-review-2026-09-09/commander-1440-scrolled.png), [injected error observations](../artifacts/usability-review-2026-09-09/additional-observations.json). Sources: [section rendering](../src/components/commander-route/CommanderCardlistSection.vue), [CommanderRoutePage.vue](../src/components/CommanderRoutePage.vue).

### 16. P2 — The table uses visual affordances that suggest editing

Ownership is shown with disabled checkboxes. These resemble controls for selecting cards or editing a collection, but neither action is available. Meanwhile, clicking the row opens details, an interaction not obvious from the checkbox. Two currencies, rarity, and an often-empty status column compete with card name and ownership; mobile puts several tiny badges around a name that can truncate.

**Fix:** use a labeled Owned/Missing/Unknown status, not a disabled form control. Make card details discoverable through the name. Offer a preferred currency and move rarity/secondary pricing to details when space is tight. Prioritize name, ownership, mana, and relevant price in the default view.

Evidence: [desktop table](../artifacts/usability-review-2026-09-09/loaded-results-desktop.png), [mobile card](../artifacts/usability-review-2026-09-09/loaded-results-mobile.png). Sources: [desktop row](../src/components/scryfall/ScryfallCardRowTable.vue), [mobile row](../src/components/scryfall/ScryfallCardRowCard.vue).

### 17. P2 — Settings and collection actions are scattered

Display preferences live in the global View popover and again in the route utility tray. Collection access appears in the global header, landing action, Collection + settings, and Utilities. Terminology varies between Settings and Utilities. Whole-list export shares a long tray with display preferences and scanning instructions.

**Fix:** maintain one global display-settings entry. Give Collection its own clear status/action. Keep Filters and Export next to results. Do not require users to remember which drawer contains a particular part of the same task.

Sources: [AppUtilityMenu.vue](../src/components/AppUtilityMenu.vue), [DashboardUtilityContent.vue](../src/components/dashboard/DashboardUtilityContent.vue), [DashboardBrowseRail.vue](../src/components/dashboard/DashboardBrowseRail.vue).

### 18. P2 — Dark mode changes surfaces more coherently than controls

Dark surfaces and light body text appear, but cream navigation pills and a plum primary action remain visually prominent. The root dark palette defines a teal accent, while the inspected upload button still resolved to plum. The result is a mixed appearance rather than a deliberate dark control hierarchy. Background glows further complicate the low-emphasis text hierarchy.

**Fix:** audit resolved component tokens across themes, including locally scoped surface tokens. Define intentional neutral, selected, primary, and disabled states for each theme. Verify contrast on actual composite surfaces after simplifying them; no numeric contrast-conformance claim is made by this review.

Evidence: [dark home](../artifacts/usability-review-2026-09-09/home-dark.png), [computed observations](../artifacts/usability-review-2026-09-09/additional-observations.json). Sources: [theme tokens](../src/style.css), [shared component configuration](../src/components/core/config.ts).

### 19. P2 — Ranking empty states and unavailable sorting need clearer behavior

Highest owned is offered before a collection/scan exists; without scan values it cannot provide meaningful ownership ordering. The results template has loading and error branches, but no explicit empty-filter state when the filtered list is empty. A blank results surface gives no explanation or reset path.

**Fix:** explain or disable Highest owned until there is usable scan data. Show “No commanders match these colors” with Clear filters when appropriate. Distinguish no collection, scanning, partial scan, no matches, and failed load.

This is supported by source inspection; a complete live scan and every empty-filter combination were not exercised. Sources: [sort controls](../src/components/top-commanders/TopCommandersControls.vue), [results branches](../src/components/TopCommandersPage.vue).

### 20. P3 — Navigation and secondary pages deserve less prominence

Release Notes takes a full primary-navigation pill and wraps onto its own mobile row. Top commanders repeats Back to dashboard and Release notes below the global navigation. The top-commanders page also renders SiteNotice locally while App renders it again. The release history is a long stack of heavily framed entries with repeated Back to top controls.

**Fix:** move release notes and project information into a secondary menu/footer. Keep one project notice. Use a compact release list, expand older entries on demand, and reserve primary navigation for finding and comparing commanders. Align route content widths so switching pages feels consistent.

Sources: [app header](../src/components/AppShellHeader.vue), [TopCommandersPage.vue](../src/components/TopCommandersPage.vue), [App.vue](../src/App.vue), [ChangelogPage.vue](../src/components/ChangelogPage.vue).

## Recommended target layout

| Page           | First screen                                                                                   | Secondary content                                           |
| -------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Home           | Compact header; “Find cards for your commander”; search; upload/status; browse-top link        | Quick picks; optional CSV help                              |
| Commander      | Small commander identity block; All / Owned / Missing; active filters; Export; first card rows | Printing details; advanced route filters; artwork expansion |
| Top commanders | Title; collection/scan status; range, sort, color filters; ranking rows                        | Method explanation; scan details                            |
| Mobile         | One-row shell; direct Search/Filters and Export access; compact content                        | Scrollable sheets with persistent Close                     |

For commander sections, use a single header such as “Artifacts · 8 of 20 owned,” a collapse affordance, and a quiet action menu. Follow immediately with rows. Do not repeat the title as a badge or the percentage as both text and a dotted progress strip.

## Suggested implementation order and acceptance criteria

1. **Repair functional defects and misleading state:** responsive trigger mismatch, View-menu scrolling, keyboard/modal preview behavior, unknown ownership, filtered coverage semantics, and ranking-card widths. Verify the exact reproductions in findings 1–7.
2. **Reorder the main workflows:** make home search visible without scrolling; move commander rows and ranked entries into the initial desktop screen; expose ownership filters and whole-result export directly.
3. **Simplify the visual system:** fix text-variant defaults, remove nested surfaces and repeated status content, rationalize button emphasis, and make theme states intentional.
4. **Finish recovery and secondary flows:** progressive enrichment, actionable errors, scan/empty states, clearer import completion, and simpler navigation.

Useful acceptance checks:

- Search is visible and usable at 390 × 844, 768 × 900, and 1440 × 900.
- Commander search and filters remain reachable at every width around 1024 and 1280 pixels.
- Mobile settings can reach every control by touch and keyboard, including text size and Close.
- Sticky controls never cover section headings or active controls after a section jump.
- With no collection, ownership is unknown; filtering does not imply a change in full-list completion.
- Card previews open and close with keyboard, expose a named dialog, and return focus to the invoking control.
- Ranking names retain enough width for readable scanning; badges and images do not expand unexpectedly.
- One failed data source leaves a clear recovery action and does not masquerade as continued loading.

## What is worth preserving

Keyboard autocomplete successfully selected a commander and navigated to its direct route. A valid CSV imported successfully, Escape closed the upload dialog, Owned filtering returned the expected card, and the downloaded filtered list contained exactly `1 Sol Ring` in the controlled check. Collection state is shared across the app, and session-only handling is explicitly explained. Table columns and mobile card representations provide a useful foundation.

The warm visual identity and recognizable card imagery can stay. The main improvement is to give the actual search, comparison, and ranking content much more space and attention than the interface's explanation of itself.
