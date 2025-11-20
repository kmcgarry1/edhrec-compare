# 🗺️ Consider implementing proper Vue Router

**Labels:** `enhancement`, `low-priority`

## Problem
`vue-router` stub exists but no actual routing implemented. App is single-page without navigation.

## Current State
- `src/stubs/vue-router.ts` exists as alias
- All content in single view
- No route-based navigation

## Proposed Solution

### Option 1: Keep Simple (Recommended)
- Remove router stub to avoid confusion
- Use URL query params for state (see URL persistence issue)
- Stay as single-page app

### Option 2: Add Full Routing
Routes could be:
- `/` - Home/Dashboard
- `/commander/:slug` - Commander detail view
- `/collection` - Collection management
- `/settings` - App settings
- `/about` - About page

## Decision Needed
Evaluate if routing adds value vs. complexity. Current single-page approach works well for the use case.

## Related Issues
- URL state persistence
- Deep linking support
