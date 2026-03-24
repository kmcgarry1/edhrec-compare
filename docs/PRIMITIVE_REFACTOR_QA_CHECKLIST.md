# Primitive Refactor QA Checklist

Run this checklist after migrating a route or shared UI component onto the core primitive layer.

Reference docs:

- `src/components/core/README.md`
- `src/style.css`
- `src/components/core/config.ts`

## Visual modes

- Light mode renders without unreadable text or washed-out surfaces.
- Dark mode preserves contrast for notices, progress bars, and pill controls.
- High contrast mode keeps borders, focus states, and status colors legible.
- Comfortable, cozy, and compact density settings still align correctly.

## Primitive-specific checks

- `CText` variants still preserve readable hierarchy and line length.
- `CSurface` variants still communicate the right weight between masthead, command, content, and utility shells.
- `CBadge` remains legible at both sizes and across soft, solid, and outline treatments.
- `CButton` variants still have clear primary vs secondary emphasis and visible disabled states.
- `CNotice` tone, icon, and border treatment still align with status severity.
- `CFieldShell` still keeps label, helper, and status text aligned with the underlying control.

## Interaction

- Keyboard navigation reaches all buttons, tabs, dropdowns, and modal actions.
- Focus rings remain visible on primitive-based buttons and field shells.
- Loading banners appear and disappear correctly for global and scoped loading.
- Error, warning, and success notices announce with the expected `aria-live` behavior.
- Dropdowns and segmented controls still respond correctly to keyboard input.

## Layout breakpoints

- `320px`: mobile controls wrap without clipped labels or overlapping actions.
- `768px`: tablet layouts preserve hierarchy and spacing.
- `1280px`: desktop route shells and card grids align without excessive whitespace.
- Wide desktop: hero sections, banners, and grids still cap width appropriately.

## Route checks

- Dashboard hero, toolbar, collection panels, and export panel still render in sequence.
- EDHREC route still loads commander data, error states, and card list sections.
- Top commanders route still loads filters, status card, loading/error states, and commander cards.
- CSV upload still accepts valid files, rejects invalid files, and loads the sample inventory.

## Documentation follow-up

- Primitive API changes are reflected in `src/components/core/README.md`.
- Repo-level workflow notes still point contributors at the primitive docs and checklist.
