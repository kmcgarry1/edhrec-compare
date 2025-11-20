# 🔧 Refactor large components for better maintainability

**Labels:** `refactoring`, `medium-priority`

## Problem
Two components are significantly large:
- `Dashboard.vue` - 421 lines
- `EdhrecReader.vue` - 760 lines

## Impact
- Difficult to maintain and understand
- Hard to test in isolation
- Violates Single Responsibility Principle
- Increases cognitive load

## Proposed Solution

### Dashboard.vue Refactoring
Split into smaller components:
- `ToolkitHeader.vue` - The collapsible header with controls
- `OnboardingModal.vue` - First-time setup modal
- `CsvUploadModal.vue` - CSV upload dialog
- `DecklistExport.vue` - Export controls

### EdhrecReader.vue Refactoring
Split into:
- `CommanderFilters.vue` - Bracket/Budget/PageType/Companion filters
- `CardlistSection.vue` - Individual cardlist with export buttons
- `CardlistNavigation.vue` - Already exists as FloatingCardlistNav
- Keep `EdhrecReader.vue` as orchestrator

## Success Criteria
- No component over 300 lines
- Each component has single, clear responsibility
- Easier to test each component
- Improved code readability
