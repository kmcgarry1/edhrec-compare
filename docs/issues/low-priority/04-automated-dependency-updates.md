# 🔄 Set up automated dependency updates

**Labels:** `maintenance`, `low-priority`

## Problem
No automated dependency update process. Dependencies will become outdated over time.

## Impact
- Security vulnerabilities accumulate
- Miss out on bug fixes
- Manual update burden
- Breaking changes harder to track

## Proposed Solution

### Option 1: Dependabot (Recommended)
Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
    groups:
      development-dependencies:
        dependency-type: development
      production-dependencies:
        dependency-type: production
```

### Option 2: Renovate Bot
More configurable, can auto-merge non-breaking updates

### Option 3: Manual Schedule
Regular manual reviews (not recommended)

## Recommendations
- Enable Dependabot
- Group updates by type
- Auto-merge patch updates (after tests pass)
- Review minor/major updates manually

## Success Criteria
- Automated PRs for updates
- Updates happen weekly
- CI tests all updates
- Clear changelog in PRs
