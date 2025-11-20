# Guide: Creating GitHub Issues from Architecture Review

This guide explains how to convert the markdown issue files into actual GitHub Issues.

## Quick Summary

**21 issues** have been documented in `docs/issues/`:
- 4 High Priority (🔴 security, testing, documentation, tooling)
- 9 Medium Priority (🟡 refactoring, features, improvements)
- 8 Low Priority (🟢 enhancements, monitoring, documentation)

## Option 1: Manual Creation (Recommended for now)

Since automated issue creation requires GitHub authentication, create issues manually:

### Steps:
1. Navigate to: https://github.com/kmcgarry1/edhrec-compare/issues/new

2. For each issue file in `docs/issues/`:
   - Copy the title (first line without `#`)
   - Copy the body content (skip the labels line)
   - Add labels as indicated in each file
   - Click "Submit new issue"

### Label Mapping:
Create these labels in your repository if they don't exist:

**Priority:**
- `high-priority` (red, #d73a4a)
- `medium-priority` (orange, #fb8500)
- `low-priority` (blue, #0969da)

**Category:**
- `security` (red, #d73a4a)
- `testing` (green, #0e8a16)
- `documentation` (blue, #0075ca)
- `tooling` (gray, #6e7781)
- `refactoring` (yellow, #fbca04)
- `code-quality` (yellow, #fbca04)
- `performance` (orange, #fb8500)
- `devops` (purple, #8250df)
- `feature` (green, #0e8a16)
- `accessibility` (blue, #0075ca)
- `enhancement` (green, #a2eeef)
- `maintenance` (gray, #6e7781)
- `monitoring` (purple, #8250df)
- `investigation` (gray, #6e7781)

## Option 2: Batch Creation with GitHub CLI

If you have `gh` CLI authenticated, you can use this script:

```bash
#!/bin/bash

# Create high priority issues
for file in docs/issues/high-priority/*.md; do
  title=$(head -1 "$file" | sed 's/# //')
  # Extract labels from file (second line)
  labels=$(sed -n '2p' "$file" | sed 's/**Labels:** //' | sed 's/`//g')
  
  gh issue create \
    --title "$title" \
    --body-file "$file" \
    --label "$labels"
done

# Create medium priority issues
for file in docs/issues/medium-priority/*.md; do
  title=$(head -1 "$file" | sed 's/# //')
  labels=$(sed -n '2p' "$file" | sed 's/**Labels:** //' | sed 's/`//g')
  
  gh issue create \
    --title "$title" \
    --body-file "$file" \
    --label "$labels"
done

# Create low priority issues
for file in docs/issues/low-priority/*.md; do
  title=$(head -1 "$file" | sed 's/# //')
  labels=$(sed -n '2p' "$file" | sed 's/**Labels:** //' | sed 's/`//g')
  
  gh issue create \
    --title "$title" \
    --body-file "$file" \
    --label "$labels"
done

echo "✅ All issues created!"
```

Save this as `create-issues.sh`, make it executable, and run:
```bash
chmod +x create-issues.sh
./create-issues.sh
```

## Option 3: Use GitHub API

You can also use the GitHub REST API with a personal access token:

```bash
#!/bin/bash

REPO="kmcgarry1/edhrec-compare"
TOKEN="your_github_token_here"

create_issue() {
  local file=$1
  local title=$(head -1 "$file" | sed 's/# //')
  local body=$(tail -n +4 "$file")  # Skip title and labels lines
  local labels=$2
  
  curl -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO/issues" \
    -d "{
      \"title\": \"$title\",
      \"body\": \"$body\",
      \"labels\": [$(echo $labels | sed 's/,/","/g' | sed 's/^/"/;s/$/"/')]
    }"
}

# Example usage:
create_issue "docs/issues/high-priority/01-security-glob-vulnerability.md" "security,high-priority"
```

## Verification

After creating issues, verify:
1. All 21 issues are created
2. Labels are correctly applied
3. Issue descriptions are complete
4. Links between related issues work

## Tracking Progress

Consider creating a GitHub Project board to track these issues:

1. Go to: https://github.com/kmcgarry1/edhrec-compare/projects
2. Create new project "Architecture Improvements"
3. Add columns: To Do, In Progress, Review, Done
4. Add all created issues to the board
5. Prioritize by moving high-priority issues to the top

## Milestones

You may want to create milestones for grouping:

- **Milestone 1: Foundation** (High Priority issues)
  - Security fixes
  - Basic testing
  - Documentation
  - Code quality tools

- **Milestone 2: Quality** (Medium Priority - Part 1)
  - Refactoring
  - Error handling
  - Test expansion

- **Milestone 3: Features** (Medium Priority - Part 2)
  - Performance improvements
  - Accessibility
  - CI/CD
  - URL state

- **Milestone 4: Polish** (Low Priority)
  - PWA support
  - Monitoring
  - Advanced documentation

## Questions?

Refer to the full architecture review at `docs/ARCHITECTURE_REVIEW.md` for context on any issue.
