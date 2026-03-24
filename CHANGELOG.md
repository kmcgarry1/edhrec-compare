# Changelog

This project did not previously maintain Git tags, GitHub Releases, or application version numbers in-repo.
The entries below formalize a release history from merged PR and mainline commit history through 2026-03-24.
Versions before `2.0.0` are retrospective milestone releases, and dependency-only updates are grouped into the nearest feature release instead of listed as standalone versions.

## [Unreleased]

- No unreleased changes recorded yet.

## [2.0.0] - 2026-03-24

### Changed

- Introduced the primitive UI layer and migrated shared loading, notices, dashboard surfaces, and Top Commanders route UI onto it (#156).
- Completed a broad UI architecture pass that consolidated presentation primitives ahead of future releases (#156).
- Folded in the latest development dependency refresh as part of the final pre-release stabilization window (#154).

### Fixed

- Fixed package and lockfile version inconsistencies and surfaced Top Commanders error notices as alerts (#155, #156).

## [1.8.0] - 2026-03-04

### Changed

- Carried forward late-cycle development dependency maintenance and tooling stabilization ahead of the primitive UI release line (#143, #149).

## [1.7.0] - 2026-02-09

### Added

- Improved large-list handling with row virtualization tuning and scrolling fixes for `CardTable` (#141).

### Changed

- Refined list height calculations and progressive scrolling behavior to make large result sets more reliable (#141).
- Folded in dependency maintenance and build stability work from the surrounding February updates (#137, #140).

## [1.6.0] - 2026-01-31

### Added

- Added the Top Commanders experience with scan workflows, filters, hero treatment, owned-card context, and supporting data helpers (#132, #133).
- Expanded unit and end-to-end coverage across refactored composables and Top Commanders flows (#133, #135).

### Changed

- Refactored dashboard, EDHREC reader, commander search, Scryfall row handling, and Top Commanders into smaller composables and components (#135).
- Cleaned up onboarding and test flows to match the restructured UI (#133, #135).

## [1.5.0] - 2026-01-22

### Added

- Added global accessibility preferences and UI controls for the application experience (#131).

### Changed

- Improved keyboard navigation, selectors, and accessible behavior across major screens (#131).
- Folded in January dependency refreshes that supported the updated accessibility layer (#129, #130).

## [1.4.0] - 2026-01-12

### Changed

- Reworked visual hierarchy in the toolkit header and broader page presentation with layout, color, and background updates (#128).
- Refreshed production and development dependencies during the same release window, including Vue Virtual updates (#124, #125, #126, #127).

## [1.3.0] - 2025-12-16

### Added

- Added URL and filter state persistence so shared views and repeated workflows survive navigation and reloads (#115).
- Added TypeDoc configuration plus API, composable, and utility documentation to make the codebase easier to extend (#114).

### Changed

- Increased information density and layout customization options for power users (#119).
- Folded in mid-December dependency updates alongside the documentation and state persistence work (#117, #118).

## [1.2.0] - 2025-12-09

### Added

- Added virtual scrolling for large card lists, code splitting, API request deduplication, and improved empty states (#109, #110, #111, #112).

### Changed

- Reduced initial bundle cost and improved repeat data loads through lazy loading and request-layer efficiency work (#110, #111).
- Included early December dependency refreshes as part of the performance-focused release (#107, #108).

## [1.1.0] - 2025-11-27

### Added

- Added IndexedDB-backed Scryfall caching and supporting automation for issue export workflows (#105, #106).

### Changed

- Folded in late November dependency updates around the caching release window (#103, #104).

## [1.0.0] - 2025-11-22

### Added

- Established the first production-ready foundation with unit testing, CI, bundle size monitoring, CSP headers, standardized error handling, and Sentry monitoring (#52, #55, #56, #57, #58, #67).
- Added keyboard and ARIA accessibility improvements, CSV validation, clearer loading states, and interface motion and polish (#59, #76, #77, #78).
- Added core project documentation including architecture notes, contribution guidance, review documents, and release-process supporting material (#26, #60, #62, #63, #68, #79, #80, #81).

### Changed

- Refactored large components into more maintainable structures and stabilized the build and lint pipeline as the app matured (#50, #51, #53, #54).
- Started regular dependency maintenance through Dependabot in the same release period (#61, #64).

### Security

- Closed an early dependency vulnerability and formalized application security headers and monitoring (#48, #55, #67).

## [0.3.0] - 2025-11-14

### Changed

- Reworked dropdowns, analytics integration, and text and layout presentation after the first round of real usage feedback (#22, #23, #24).

## [0.2.0] - 2025-11-12

### Added

- Added commander display support, navigation, floating header behavior, onboarding polish, CSV-driven owned-card workflows, and deck export support (#14, #15, #16, #18).

### Changed

- Improved mobile layout handling and early dashboard structure as the app expanded beyond the initial search prototype (#7, #8, #9, #17, #19, #21).

## [0.1.0] - 2025-11-10

### Added

- Initial public milestone with the proof of concept, commander search flow, EDHREC integration, and Scryfall hover previews (#1, #2, #3).
