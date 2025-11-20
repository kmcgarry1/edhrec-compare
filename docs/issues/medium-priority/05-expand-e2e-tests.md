# ✅ Expand E2E test coverage

**Labels:** `testing`, `medium-priority`

## Problem
Only 3 E2E test scenarios exist:
1. Onboarding and CSV upload
2. Commander workflow
3. Mobile card modal

Many critical flows are untested.

## Missing Test Coverage
1. **Filter Functionality**
   - Owned/Unowned/Show All filter
   - Bracket selection
   - Budget modifier
   - Page type selection
   - Companion selection

2. **Theme & Background**
   - Dark/Light mode toggle
   - Background enable/disable
   - Preference persistence

3. **Commander Search**
   - Search with no results
   - Search with multiple results
   - Selecting different commanders

4. **Export Functionality**
   - Copy individual cardlist
   - Download individual cardlist
   - Export with filters applied

5. **Error Scenarios**
   - EDHREC API failure
   - Scryfall API failure
   - Invalid CSV upload
   - Network timeout

6. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - Focus management

## Proposed Test Structure
```
tests/e2e/
  app.spec.ts (existing)
  filters.spec.ts (new)
  theme.spec.ts (new)
  search.spec.ts (new)
  export.spec.ts (new)
  errors.spec.ts (new)
  accessibility.spec.ts (new)
```

## Success Criteria
- At least 15 E2E test scenarios
- All critical user flows covered
- Error scenarios tested
- Mobile and desktop coverage
- Tests run in CI pipeline
