# Creating GitHub Issues for UI/UX Review

This guide explains how to create GitHub issues from the UI/UX design review findings.

## Quick Start

### Option 1: Automated Script (Recommended)

If you have the GitHub CLI (`gh`) installed and authenticated:

```bash
# Ensure you're authenticated
gh auth login

# Run the issue creation script
./create-ui-ux-issues.sh
```

This will create **7 issues** with appropriate labels:

- 3 high-priority issues (labels: `ui-ux`, `design`, `high-priority`)
- 3 medium-priority issues (labels: `ui-ux`, `design`, `medium-priority`)
- 1 low-priority issue (labels: `ui-ux`, `design`, `low-priority`)

### Option 2: Manual Creation

If you prefer to create issues manually or want to customize them:

1. Go to https://github.com/kmcgarry1/edhrec-compare/issues/new
2. Copy the title from the first line of each markdown file
3. Paste the entire file content as the issue body
4. Add labels: `ui-ux`, `design`, and the priority level
5. Submit

## Issues to Create

### High Priority (Create these first)

| #   | Title                                    | File                                                             | Labels                             |
| --- | ---------------------------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| 1   | Mobile Toolbar Responsiveness            | `docs/issues/high-priority/10-mobile-toolbar-responsiveness.md`  | `ui-ux`, `design`, `high-priority` |
| 2   | Visual Hierarchy in Toolkit Header       | `docs/issues/high-priority/11-visual-hierarchy-toolkit.md`       | `ui-ux`, `design`, `high-priority` |
| 3   | Information Density & Whitespace Balance | `docs/issues/high-priority/12-information-density-whitespace.md` | `ui-ux`, `design`, `high-priority` |

### Medium Priority

| #   | Title                                 | File                                                         | Labels                               |
| --- | ------------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| 4   | Empty State Design                    | `docs/issues/medium-priority/10-empty-state-design.md`       | `ui-ux`, `design`, `medium-priority` |
| 5   | Form Input Accessibility Improvements | `docs/issues/medium-priority/11-form-input-accessibility.md` | `ui-ux`, `design`, `medium-priority` |
| 6   | Loading State Visibility Enhancement  | `docs/issues/medium-priority/12-loading-state-visibility.md` | `ui-ux`, `design`, `medium-priority` |

### Low Priority

| #   | Title                              | File                                                       | Labels                            |
| --- | ---------------------------------- | ---------------------------------------------------------- | --------------------------------- |
| 7   | Micro-interactions & Visual Polish | `docs/issues/low-priority/09-micro-interactions-polish.md` | `ui-ux`, `design`, `low-priority` |

## Issue Template

If creating manually, use this template structure:

```markdown
# [Issue Title]

**Priority:** [High/Medium/Low]
**Type:** [UX Enhancement / UI Enhancement / Accessibility]
**Component:** [Component Name]
**Effort:** [Low/Medium/High (< 1 day / 1-3 days / 1+ week)]

## Problem

[Description of the current issue]

### Current Issues

- [Bullet points of specific problems]

### User Impact

- [Impact statement]

## Screenshots

[Links to relevant screenshots]

## Proposed Solution

[Detailed solution with code examples, mockups, or descriptions]

## Implementation Plan

[Step-by-step implementation phases]

## Acceptance Criteria

- [ ] [Testable criteria 1]
- [ ] [Testable criteria 2]

## Related Issues

[Links to related issues or documentation]

## References

[External resources, guidelines, best practices]
```

## Additional Labels to Consider

Beyond the required labels, you may want to add:

- `mobile` - For issues specific to mobile experience
- `accessibility` - For a11y-related improvements
- `performance` - For performance-impacting changes
- `help wanted` - If you'd like community contributions
- `good first issue` - For newcomer-friendly tasks

## Milestones

Consider creating milestones to group related issues:

### Milestone: "Mobile UX Improvements"

- Mobile Toolbar Responsiveness
- Information Density & Whitespace
- Form Input Accessibility

### Milestone: "Visual Polish Q1 2026"

- Visual Hierarchy in Toolkit
- Empty State Design
- Micro-interactions

### Milestone: "Loading & Feedback"

- Loading State Visibility
- (Future: Progress indicators)
- (Future: Error state improvements)

## Creating Milestones

```bash
# Via gh CLI
gh milestone create "Mobile UX Improvements" --due-on 2026-02-01

# Or manually at:
https://github.com/kmcgarry1/edhrec-compare/milestones/new
```

## Assigning Issues

If you want to assign issues to specific people or projects:

```bash
# Assign to yourself
gh issue edit ISSUE_NUMBER --add-assignee @me

# Add to project
gh issue edit ISSUE_NUMBER --add-project "UI/UX Roadmap"
```

## Verification

After creating issues, verify:

1. All 7 issues are created
2. Labels are correctly applied
3. Issue numbers are referenced in the main review doc
4. Issues are linked in project boards (if applicable)

Check the issues at:

```
https://github.com/kmcgarry1/edhrec-compare/issues?q=is%3Aissue+label%3Aui-ux
```

## Troubleshooting

### Error: "gh: command not found"

Install GitHub CLI:

```bash
# macOS
brew install gh

# Windows (Scoop)
scoop install gh

# Linux (Debian/Ubuntu)
sudo apt install gh
```

### Error: "You are not logged into any GitHub hosts"

Authenticate:

```bash
gh auth login
# Follow the prompts to authenticate
```

### Error: "Resource not accessible by integration"

Ensure you have write access to the repository. You may need to:

1. Be added as a collaborator
2. Use a personal access token with `repo` scope
3. Fork the repo and create issues there

### Issues Already Exist

If you've run the script multiple times and issues already exist:

```bash
# Check existing issues
gh issue list --label ui-ux

# Close duplicates
gh issue close ISSUE_NUMBER
```

## Next Steps After Creating Issues

1. **Update Main Review Doc**
   - Add issue numbers to findings in `UI_UX_DESIGN_REVIEW.md`
   - Link from README to specific issues

2. **Prioritize in Project Board**
   - Create columns: Backlog, To Do, In Progress, Done
   - Drag high-priority issues to "To Do"

3. **Break Down Large Issues**
   - Split complex issues into sub-tasks
   - Create checkboxes for multi-step implementations

4. **Schedule Implementation**
   - Assign issues to sprints/milestones
   - Estimate story points if using agile

5. **Start With Quick Wins**
   - Tackle low-effort, high-impact issues first
   - Build momentum with visible improvements

## Example Commands

```bash
# Create all issues automatically
./create-ui-ux-issues.sh

# Create a single issue manually
gh issue create \
  --title "Mobile Toolbar Responsiveness" \
  --body-file docs/issues/high-priority/10-mobile-toolbar-responsiveness.md \
  --label "ui-ux,design,high-priority"

# List all UI/UX issues
gh issue list --label ui-ux

# View specific issue
gh issue view 123

# Edit issue labels
gh issue edit 123 --add-label "help wanted"

# Close issue when complete
gh issue close 123 --comment "Resolved in PR #456"
```

## Success Criteria

You've successfully created all UI/UX issues when:

- [ ] All 7 markdown files have corresponding GitHub issues
- [ ] Issues are properly labeled (ui-ux, design, priority)
- [ ] Issues appear in the repository's issue tracker
- [ ] Issues are linked from the main review document
- [ ] Team members can filter and find issues easily

## Support

For questions or issues:

- Check the [GitHub CLI documentation](https://cli.github.com/manual/)
- Review [GitHub Issues documentation](https://docs.github.com/en/issues)
- Open a discussion in the repository

---

**Note:** These instructions assume you have write access to the repository. If you're a contributor, you may need to fork the repository and create a pull request instead of creating issues directly.
