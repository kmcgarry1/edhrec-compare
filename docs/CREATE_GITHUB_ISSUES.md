# Creating GitHub Issues from Review Documentation

This guide provides instructions for creating GitHub issues from the UI/UX design review documentation stored in `docs/issues/`.

## Prerequisites

- GitHub account with access to the repository
- GitHub CLI (`gh`) installed (for automated method)
- Write access to create issues and labels

## Automated Method (Recommended)

### Step 1: Install GitHub CLI

If not already installed:

**macOS:**

```bash
brew install gh
```

**Windows:**

```bash
winget install --id GitHub.cli
```

**Linux:**

```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora/RHEL
sudo dnf install gh
```

Or download from: https://cli.github.com/

### Step 2: Authenticate

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

### Step 3: Run the Script

```bash
# From the repository root
chmod +x create-issues.sh
./create-issues.sh
```

The script will:

- ✅ Check that GitHub CLI is installed and authenticated
- ✅ Process all markdown files in `docs/issues/`
- ✅ Create issues with appropriate labels and priorities
- ✅ Display progress and results

### Step 4: Verify

```bash
# View created issues
gh issue list --label ui-ux

# Or visit in browser
gh repo view --web
```

## Manual Method

If you prefer to create issues manually or the script fails:

### Step 1: Prepare Labels

Create the following labels if they don't exist:

| Label             | Description                         | Color     |
| ----------------- | ----------------------------------- | --------- |
| `ui-ux`           | UI/UX design review items           | `#00A8E8` |
| `design`          | Design system or visual polish work | `#D946EF` |
| `high-priority`   | Highest-priority follow-ups         | `#DC2626` |
| `medium-priority` | Medium-priority items               | `#F59E0B` |
| `low-priority`    | Nice-to-have improvements           | `#10B981` |

**To create labels:**

```bash
gh label create "ui-ux" --description "UI/UX design review items" --color "00A8E8"
gh label create "design" --description "Design system or visual polish work" --color "D946EF"
gh label create "high-priority" --description "Highest-priority follow-ups" --color "DC2626"
gh label create "medium-priority" --description "Medium-priority items" --color "F59E0B"
gh label create "low-priority" --description "Nice-to-have improvements" --color "10B981"
```

Or create them via the GitHub web interface: `Settings` → `Issues` → `Labels`

### Step 2: Create Issues Manually

For each markdown file in `docs/issues/`:

1. **Open the markdown file** (e.g., `docs/issues/high-priority/10-mobile-toolbar-responsiveness.md`)

2. **Go to GitHub Issues** in your browser:

   ```
   https://github.com/kmcgarry1/edhrec-compare/issues/new
   ```

3. **Extract the title** from the first `# Heading` in the markdown file

4. **Copy the entire file content** into the issue body

5. **Add labels** based on the priority folder:
   - High priority: `ui-ux`, `design`, `high-priority`
   - Medium priority: `ui-ux`, `design`, `medium-priority`
   - Low priority: `ui-ux`, `design`, `low-priority`

6. **Click "Submit new issue"**

7. **Repeat** for all 7 markdown files

### File Mapping

Here's what you need to create:

**High Priority:**

- `docs/issues/high-priority/10-mobile-toolbar-responsiveness.md` → Issue #69
- `docs/issues/high-priority/11-visual-hierarchy-toolkit.md` → Issue #70
- `docs/issues/high-priority/12-information-density-whitespace.md` → Issue #71

**Medium Priority:**

- `docs/issues/medium-priority/10-empty-state-design.md` → Issue #72
- `docs/issues/medium-priority/11-form-input-accessibility.md` → Issue #73
- `docs/issues/medium-priority/12-loading-state-visibility.md` → Issue #74

**Low Priority:**

- `docs/issues/low-priority/09-micro-interactions-polish.md` → Issue #75

## Troubleshooting

### "gh: command not found"

GitHub CLI is not installed. Follow installation instructions above.

### "gh: Not authenticated"

Run `gh auth login` and follow the prompts.

### "Permission denied" when running script

Make the script executable:

```bash
chmod +x create-issues.sh
```

### Issues already exist

If issues #69-#75 already exist (as indicated in VISUAL_DESIGN_REVIEW_SUMMARY.md), you can:

1. **Skip creation** - The issues are already there
2. **Update existing issues** - Add details from markdown files to existing issues:
   ```bash
   gh issue edit 69 --body-file docs/issues/high-priority/10-mobile-toolbar-responsiveness.md
   ```

### Script fails with "404 Not Found"

Ensure you're authenticated with an account that has write access to the repository:

```bash
gh auth status
gh auth refresh
```

## Verification Checklist

After creating issues:

- [ ] All 7 issues created (#69-#75)
- [ ] Each issue has correct labels (`ui-ux`, `design`, priority label)
- [ ] Issue titles match markdown file headings
- [ ] Issue bodies contain full markdown content
- [ ] Screenshots are visible (GitHub renders image links)
- [ ] Issues are searchable by labels
- [ ] Issues appear in the correct priority groups

## Bulk Operations

### List all UI/UX issues

```bash
gh issue list --label ui-ux
```

### Close all UI/UX issues (use with caution!)

```bash
gh issue list --label ui-ux --json number -q '.[].number' | xargs -I {} gh issue close {}
```

### Add assignee to all issues

```bash
gh issue list --label ui-ux --json number -q '.[].number' | xargs -I {} gh issue edit {} --add-assignee @me
```

## Next Steps

After creating issues:

1. **Review and prioritize** in a project board
2. **Assign owners** for each issue
3. **Create milestones** for tracking progress
4. **Link related issues** using GitHub's linking syntax
5. **Break down large issues** into sub-tasks if needed

## Additional Resources

- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [VISUAL_DESIGN_REVIEW_SUMMARY.md](../VISUAL_DESIGN_REVIEW_SUMMARY.md)
- [docs/issues/README.md](issues/README.md)

---

**Questions?** Open an issue or check the [CONTRIBUTING.md](../CONTRIBUTING.md) guide.
