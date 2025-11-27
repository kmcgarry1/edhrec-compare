# Issue Automation Bridge

This repository uses GitHub Issues as the source of truth, but the feature team often needs mirrored Jira tickets or Trello cards. The `scripts/export-issues-for-boards.mjs` CLI reads the structured markdown we already keep in each issue and emits three artifacts that can be consumed by Jira or Trello automations without any copy/paste work.

## What the exporter does

- Fetches GitHub issues (optionally filtered by state or labels) via the public REST API.
- Parses the `## Implementation Plan` and `## Acceptance Criteria` sections to derive stories, sub-tasks, and checklists.
- Generates `docs/issue-automation/issue-export.json` (raw data), `jira-import.csv` (Jira-friendly CSV with Epics + Stories + Sub-tasks), and `trello-import.json` (cards with nested checklists ready for Trello's API, Butler, or import Power-Ups).
- Preserves labels, assignees, milestones, and backlinks to the canonical GitHub issue.

The JSON output doubles as an audit trail and can be pushed to S3/Artifacts if you want a historical ledger of how issues were mirrored into other systems.

## Prerequisites

- Node 18+ (for the built-in `fetch` API).
- Optional but recommended: a personal access token with the `repo` scope exported as `GITHUB_TOKEN` or `GH_TOKEN` to avoid hitting the 60 req/hr unauthenticated limit.
- Network access to `api.github.com`.

## Usage

```bash
# Basic usage (defaults to docs/issue-automation output directory)
npm run issues:export -- --repo your-org/edhrec-compare

# Filter down to high-priority design issues, change output directory, and
# customise the default Trello list + Jira project key.
npm run issues:export -- \
  --repo your-org/edhrec-compare \
  --labels high-priority,design \
  --state open \
  --output docs/issue-automation/high-priority \
  --trelloList "Q1 Backlog" \
  --jiraProject ENG
```

Supported flags:

| Flag                     | Description                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------- |
| `--repo owner/name`      | Repository to read issues from (falls back to `GITHUB_REPOSITORY` env or the current git remote). |
| `--state open            | closed                                                                                            | all` | GitHub issue state filter (default `open`). |
| `--labels label1,label2` | Comma-separated label filter applied server-side.                                                 |
| `--output path`          | Directory for all generated files (default `docs/issue-automation`).                              |
| `--trelloList name`      | Logical list name recorded in each Trello card payload (default `Backlog`).                       |
| `--jiraProject key`      | Project key column to include in the Jira CSV (default `AUTO`).                                   |
| `--includePullRequests`  | Include pull requests in the export (default skips them).                                         |
| `--token ...`            | Explicit GitHub token; otherwise the CLI reads `GITHUB_TOKEN`, `GH_TOKEN`, or `GITHUB_PAT`.       |

## Consuming the outputs

### Jira

1. Open **Jira Settings -> System -> External System Import -> CSV**.
2. Upload `docs/issue-automation/jira-import.csv`.
3. Map the CSV columns as follows: `Issue ID` -> _Issue ID_, `Work Item ID` -> _Work Item ID_ (required by the new Jira importer), `Issue Type` -> _Issue Type_, `Summary` -> _Summary_, `Description` -> _Description_, `Parent ID` -> _Parent ID_, `Project Key` -> _Project_ (if prompted), `Labels` -> _Labels_, `External Link` -> _Web Link_, `Acceptance Criteria` -> a custom multi-line field if desired.
   - **Missing field?** Jira’s CSV importer lets you leave a column unmapped or delete it entirely. If your project doesn’t expose `Web Link` or a text field for acceptance criteria, simply skip those columns (or remove them from `jira-import.csv`) and re-run the import—the rest of the hierarchy will still be created correctly.
4. Complete the import. Jira will create an Epic for each GitHub issue, Stories for each implementation phase, and Sub-tasks for every bullet in the plan.

Because the CSV contains deterministic `Issue ID` values (e.g., `gh-123-epic`), rerunning an import in Update mode lets you sync changes without duplicating tickets.

### Trello

The Trello payload is intentionally API-friendly so you can choose your own automation channel:

- **PowerShell/Node script**: Loop over the `cards` array and `POST` to `https://api.trello.com/1/cards` (and `.../checklists`) using your `key` + `token`. Each entry already includes the desired list name, card description (with GitHub backlinks), and pre-grouped checklists by implementation phase.
- **Butler/Trello CLI**: Import the JSON into your tooling of choice or transform it into CSV if you prefer Butler automations.

Example snippet:

```jsonc
{
  "name": "[GH#101] Implement IndexedDB Caching for Scryfall API",
  "desc": "GitHub issue: https://github.com/your-org/edhrec-compare/issues/101\n...",
  "labels": ["architecture", "high-priority"],
  "listName": "Q1 Backlog",
  "urlSource": "https://github.com/your-org/edhrec-compare/issues/101",
  "checklists": [
    { "name": "Phase 1: Core Cache Infrastructure", "items": ["Create IndexedDB wrapper", "..."] },
    { "name": "Acceptance Criteria", "items": ["Scryfall API calls reduced by 80%+", "..."] },
  ],
}
```

### JSON ledger

`issue-export.json` mirrors the structure we parse (labels, assignees, implementation phases, acceptance criteria). It is useful for additional tooling (for example syncing to Notion, generating status dashboards, or diffing exports inside CI).

## Automating the sync

- Add a scheduled GitHub Action that runs `npm run issues:export -- --repo ${{ github.repository }} --state open` and uploads the `docs/issue-automation` directory as an artifact or pushes it to your infra bucket.
- Feed `jira-import.csv` into an Atlassian automation or cron job that runs Jira's CSV import in update mode.
- Pipe `trello-import.json` through a small script that uses Trello's REST API to keep your board aligned with GitHub.

Because the exporter is deterministic, you can safely rerun it whenever an issue body changes - downstream automations can diff the JSON to decide whether a Jira story or Trello checklist item needs updating.
