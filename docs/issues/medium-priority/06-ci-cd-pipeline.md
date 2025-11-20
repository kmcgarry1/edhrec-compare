# 🔄 Add CI/CD pipeline with GitHub Actions

**Labels:** `devops`, `medium-priority`

## Problem
No CI/CD pipeline exists, meaning:
- No automated builds on PR
- No automated tests
- Manual deployment process
- No quality gates

## Impact
- Risk of breaking changes merged
- Manual deployment errors
- Slow feedback loop
- No deployment automation

## Proposed Solution

### 1. Create `.github/workflows/ci.yml`
```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test:unit
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 2. Create `.github/workflows/deploy.yml`
For automatic deployment to Vercel/Netlify/etc.

### 3. Add Status Badges to README
Show build status, test coverage, etc.

## Success Criteria
- All PRs run CI checks
- Tests must pass before merge
- Automated deployment on merge to main
- Build status visible in README
