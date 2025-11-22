# Set Up Automated Dependency Updates

**Priority:** Low  
**Type:** DevOps / Maintenance  
**Component:** CI/CD, Dependencies  
**Effort:** Small (1 day)

## Problem

Dependencies are not automatically updated, leading to security vulnerabilities and outdated packages:

### Current Issues

- Manual dependency updates are time-consuming
- Security vulnerabilities may go unnoticed
- Missing out on bug fixes and performance improvements
- No automated testing of dependency updates
- Breaking changes discovered too late

### User Impact

- **Low:** Does not directly affect users immediately
- Security vulnerabilities in dependencies pose risk
- Missing performance improvements
- Technical debt accumulates over time

## Proposed Solution

### Dependabot Configuration

Enable GitHub Dependabot for automated dependency updates:

```yaml
# .github/dependabot.yml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    reviewers:
      - "kmcgarry1"
    assignees:
      - "kmcgarry1"
    commit-message:
      prefix: "chore"
      include: "scope"
    labels:
      - "dependencies"
      - "automated"

    # Group minor/patch updates
    groups:
      development-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"
      production-dependencies:
        dependency-type: "production"
        update-types:
          - "minor"
          - "patch"

    # Ignore specific packages
    ignore:
      # Wait for stable releases
      - dependency-name: "vue"
        update-types: ["version-update:semver-major"]
      - dependency-name: "vite"
        update-types: ["version-update:semver-major"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "ci"
      - "automated"
```

### Renovate Bot Alternative

More powerful than Dependabot with better configuration:

```json
// renovate.json
{
  "extends": ["config:base"],
  "schedule": ["before 10am on monday"],
  "labels": ["dependencies"],
  "assignees": ["kmcgarry1"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "groupName": "all non-major dependencies",
      "groupSlug": "all-minor-patch",
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchPackagePatterns": ["^eslint", "^prettier"],
      "groupName": "linters",
      "automerge": true
    },
    {
      "matchPackagePatterns": ["^@types/"],
      "groupName": "TypeScript types",
      "automerge": true
    }
  ],
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"],
    "assignees": ["kmcgarry1"]
  },
  "prCreation": "not-pending",
  "prConcurrentLimit": 5,
  "prHourlyLimit": 0
}
```

### CI Pipeline for Dependency PRs

```yaml
# .github/workflows/dependency-test.yml
name: Test Dependency Updates

on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - "package.json"
      - "package-lock.json"

jobs:
  test-dependencies:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run build

      - name: Run unit tests
        run: npm run test:unit:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Check bundle size
        run: npm run size

      - name: Comment on PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const coverage = fs.readFileSync('coverage/coverage-summary.json', 'utf8');
            const { total } = JSON.parse(coverage);

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Dependency Update Test Results
              
              ✅ All tests passed
              📊 Coverage: ${total.lines.pct}%
              📦 Bundle size: within limits
              `
            });
```

### Auto-merge for Safe Updates

```yaml
# .github/workflows/auto-merge-dependabot.yml
name: Auto-merge Dependabot PRs

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Check PR labels
        id: check-labels
        uses: actions/github-script@v7
        with:
          script: |
            const labels = context.payload.pull_request.labels.map(l => l.name);
            const isMinorOrPatch = labels.includes('dependencies') && 
                                   !context.payload.pull_request.title.includes('major');
            return isMinorOrPatch;

      - name: Auto-approve PR
        if: steps.check-labels.outputs.result == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.pulls.createReview({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.payload.pull_request.number,
              event: 'APPROVE'
            });

      - name: Enable auto-merge
        if: steps.check-labels.outputs.result == 'true'
        run: gh pr merge --auto --squash "${{ github.event.pull_request.number }}"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Technical Considerations

### Files to Create

- `.github/dependabot.yml` - Dependabot configuration
- `renovate.json` - Renovate configuration (alternative)
- `.github/workflows/dependency-test.yml` - Test pipeline
- `.github/workflows/auto-merge-dependabot.yml` - Auto-merge workflow

### Update Strategy

**Auto-merge (Safe):**

- Patch updates (1.0.x → 1.0.y)
- Minor updates for dev dependencies
- Type definition updates

**Manual Review (Risky):**

- Major version bumps
- Production dependency minors
- Framework updates (Vue, Vite)

**Security Alerts:**

- Always create immediate PR
- High priority review
- Auto-merge after CI passes

## Implementation Plan

### Phase 1: Dependabot Setup (Day 1)

1. Create `.github/dependabot.yml`
2. Configure update schedule
3. Set up grouping rules
4. Test with a few dependencies

### Phase 2: CI Integration (Day 1)

1. Create dependency-test workflow
2. Add bundle size checks
3. Configure auto-merge for safe updates
4. Test auto-merge pipeline

### Phase 3: Monitoring (Ongoing)

1. Review weekly dependency PRs
2. Monitor for breaking changes
3. Adjust ignore rules as needed
4. Update docs with process

## Acceptance Criteria

- [ ] Dependabot creates weekly PRs
- [ ] CI runs on all dependency PRs
- [ ] Minor/patch updates auto-merge
- [ ] Security alerts create urgent PRs
- [ ] Bundle size verified in CI
- [ ] Breaking changes detected before merge
- [ ] Documentation updated

## Benefits

**Security:**

- Automatic security patch updates
- Faster response to CVEs
- Reduced attack surface

**Maintenance:**

- Less manual work
- Stay current with ecosystem
- Catch breaking changes early

**Performance:**

- Access to latest optimizations
- Bug fixes automatically applied
- Framework improvements

## Related Issues

- Security improvements
- Developer experience
- CI/CD enhancements

## References

- [Dependabot - GitHub](https://docs.github.com/en/code-security/dependabot)
- [Renovate Bot](https://docs.renovatebot.com/)
- [npm Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
