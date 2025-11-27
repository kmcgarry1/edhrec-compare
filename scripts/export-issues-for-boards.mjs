#!/usr/bin/env node

/**
 * Export GitHub issues and derive Jira/Trello ready artifacts.
 *
 * Usage:
 *   node scripts/export-issues-for-boards.mjs --repo owner/name
 */

import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const DEFAULT_OUTPUT_DIR = "docs/issue-automation";
const SUPPORTED_STATES = new Set(["open", "closed", "all"]);

const argOptions = parseArgs(process.argv.slice(2));

const repo = argOptions.repo || process.env.GITHUB_REPOSITORY || detectRepoFromGit() || null;

if (!repo) {
  console.error(
    "Unable to determine repository. Provide --repo owner/name or set GITHUB_REPOSITORY."
  );
  process.exit(1);
}

const state =
  argOptions.state && SUPPORTED_STATES.has(argOptions.state) ? argOptions.state : "open";

const labels = argOptions.labels
  ? argOptions.labels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean)
  : [];

const outputDir = path.resolve(process.cwd(), argOptions.output || DEFAULT_OUTPUT_DIR);

const trelloList = argOptions.trelloList || "Backlog";
const jiraProjectKey = argOptions.jiraProject || "AUTO";

const token =
  argOptions.token ||
  process.env.GITHUB_TOKEN ||
  process.env.GH_TOKEN ||
  process.env.GITHUB_PAT ||
  null;

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "edhrec-compare-issue-exporter",
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

main().catch((error) => {
  console.error(`Issue export failed: ${error.message}`);
  process.exit(1);
});

async function main() {
  const issues = await fetchIssues(repo, state, labels, headers);

  const processedIssues = issues.map((issue) => {
    const body = issue.body || "";
    const implementationPhases = extractImplementationPhases(body);
    const acceptanceCriteria = extractAcceptanceCriteria(body);
    const description = buildDescription(issue, acceptanceCriteria);
    const labelNames = Array.isArray(issue.labels)
      ? issue.labels.map((label) => (typeof label === "string" ? label : label.name))
      : [];
    const assignees = Array.isArray(issue.assignees) ? issue.assignees : [];

    return {
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      state: issue.state,
      labels: labelNames,
      assignees: assignees.map((assignee) => ({
        login: assignee.login,
        url: assignee.html_url,
      })),
      milestone: issue.milestone ? issue.milestone.title : null,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      body,
      implementationPhases,
      acceptanceCriteria,
      description,
    };
  });

  await fs.mkdir(outputDir, { recursive: true });

  const exportFile = path.join(outputDir, "issue-export.json");
  const jiraFile = path.join(outputDir, "jira-import.csv");
  const trelloFile = path.join(outputDir, "trello-import.json");

  const exportPayload = {
    generatedAt: new Date().toISOString(),
    repository: repo,
    filters: {
      state,
      labels,
    },
    issues: processedIssues,
  };

  const jiraRows = buildJiraRows(processedIssues, jiraProjectKey);
  const trelloPayload = buildTrelloPayload(processedIssues, trelloList);

  await fs.writeFile(exportFile, JSON.stringify(exportPayload, null, 2), "utf8");
  await fs.writeFile(jiraFile, jiraRows.join("\r\n"), "utf8");
  await fs.writeFile(trelloFile, JSON.stringify(trelloPayload, null, 2), "utf8");

  console.log(`Exported ${processedIssues.length} issues from ${repo}`);
  console.log(`JSON summary: ${path.relative(process.cwd(), exportFile)}`);
  console.log(`Jira CSV: ${path.relative(process.cwd(), jiraFile)}`);
  console.log(`Trello JSON: ${path.relative(process.cwd(), trelloFile)}`);
  console.log(
    "Feed jira-import.csv into Jira CSV importer and trello-import.json into Trello's bulk API/Power-Up."
  );
}

async function fetchIssues(repo, state, labels, headers) {
  const issues = [];
  const params = new URLSearchParams({
    per_page: "100",
    state,
  });
  if (labels.length) {
    params.set("labels", labels.join(","));
  }

  let page = 1;
  while (true) {
    params.set("page", String(page));
    const url = `https://api.github.com/repos/${repo}/issues?${params.toString()}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const details = await safeReadJson(response);
      throw new Error(
        `GitHub API error (${response.status}): ${details?.message || response.statusText}`
      );
    }

    const chunk = await response.json();
    if (!Array.isArray(chunk) || chunk.length === 0) {
      break;
    }

    for (const issue of chunk) {
      if (issue.pull_request && !argOptions.includePullRequests) {
        continue;
      }
      issues.push(issue);
    }

    if (chunk.length < 100) {
      break;
    }
    page += 1;
  }
  return issues;
}

function extractSection(markdown, header) {
  if (!markdown) {
    return null;
  }
  const normalizedHeader = header.trim().toLowerCase();
  const lines = markdown.split(/\r?\n/);
  let inSection = false;
  const buffer = [];

  for (const line of lines) {
    const match = line.match(/^##\s+(.*)$/);
    if (match) {
      const heading = match[1].trim().toLowerCase();
      if (heading === normalizedHeader) {
        inSection = true;
        continue;
      }
      if (inSection) {
        break;
      }
    }
    if (inSection) {
      buffer.push(line);
    }
  }

  if (!buffer.length) {
    return null;
  }
  return buffer.join("\n").trim();
}

function extractImplementationPhases(markdown) {
  const section = extractSection(markdown, "Implementation Plan");
  if (!section) {
    return [];
  }

  const lines = section.split(/\r?\n/);
  const phases = [];
  let current = null;
  let insideCodeBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }
    if (insideCodeBlock || !line.trim()) {
      continue;
    }

    const headingMatch = line.match(/^###\s+(.*)$/);
    if (headingMatch) {
      if (current) {
        phases.push(current);
      }
      current = { title: headingMatch[1].trim(), tasks: [] };
      continue;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.*)$/);
    const orderedMatch = line.match(/^[0-9]+[.)]\s+(.*)$/);
    if (!current && (unorderedMatch || orderedMatch)) {
      current = { title: "Implementation Tasks", tasks: [] };
    }

    if (unorderedMatch && current) {
      current.tasks.push(unorderedMatch[1].trim());
    } else if (orderedMatch && current) {
      current.tasks.push(orderedMatch[1].trim());
    }
  }

  if (current) {
    phases.push(current);
  }

  return phases.filter((phase) => phase.tasks.length > 0);
}

function extractAcceptanceCriteria(markdown) {
  const section = extractSection(markdown, "Acceptance Criteria");
  if (!section) {
    return [];
  }
  const lines = section.split(/\r?\n/);
  const items = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const checkboxMatch = line.match(/^- \[( |x)\]\s+(.*)$/i);
    if (checkboxMatch) {
      items.push({
        text: checkboxMatch[2].trim(),
        done: checkboxMatch[1].trim().toLowerCase() === "x",
      });
      continue;
    }
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      items.push({ text: bulletMatch[1].trim(), done: false });
    }
  }

  return items;
}

function buildDescription(issue, acceptanceCriteria) {
  const summaryLines = [];
  summaryLines.push(`GitHub issue: ${issue.html_url}`);
  if (issue.milestone) {
    summaryLines.push(`Milestone: ${issue.milestone.title}`);
  }
  if (issue.assignees.length) {
    summaryLines.push(`Assignees: ${issue.assignees.map((assignee) => assignee.login).join(", ")}`);
  }
  if (issue.labels.length) {
    summaryLines.push(`Labels: ${issue.labels.join(", ")}`);
  }
  summaryLines.push("");
  summaryLines.push(issue.body || "No description provided.");
  if (acceptanceCriteria.length) {
    summaryLines.push("");
    summaryLines.push("Acceptance Criteria:");
    acceptanceCriteria.forEach((item, index) => {
      summaryLines.push(`  ${index + 1}. ${item.text}`);
    });
  }
  return summaryLines.join("\n").trim();
}

function buildJiraRows(issues, projectKey) {
  const header = [
    "Issue ID",
    "Work Item ID",
    "Project Key",
    "Issue Type",
    "Summary",
    "Description",
    "Parent ID",
    "Labels",
    "External Link",
    "Acceptance Criteria",
  ];
  const rows = [toCsvRow(header)];

  for (const issue of issues) {
    const epicId = `gh-${issue.number}-epic`;
    const labelString = issue.labels.join(";");
    const acceptanceText = issue.acceptanceCriteria
      .map((item, index) => `${index + 1}. ${item.text}`)
      .join(" | ");

    rows.push(
      toCsvRow([
        epicId,
        epicId,
        projectKey,
        "Epic",
        `[GH#${issue.number}] ${issue.title}`,
        issue.description,
        "",
        labelString,
        issue.url,
        acceptanceText,
      ])
    );

    issue.implementationPhases.forEach((phase, phaseIndex) => {
      const storyId = `${epicId}-story-${phaseIndex + 1}`;
      const storySummary =
        phase.title && phase.title.length
          ? `${phase.title} - ${issue.title}`
          : `Phase ${phaseIndex + 1} - ${issue.title}`;
      const storyDescription = [
        `Parent GitHub issue: ${issue.url}`,
        "",
        ...phase.tasks.map((task, idx) => `${idx + 1}. ${task}`),
      ]
        .join("\n")
        .trim();

      rows.push(
        toCsvRow([
          storyId,
          storyId,
          projectKey,
          "Story",
          storySummary,
          storyDescription,
          epicId,
          labelString,
          issue.url,
          acceptanceText,
        ])
      );

      phase.tasks.forEach((task, taskIndex) => {
        const taskId = `${storyId}-task-${taskIndex + 1}`;
        rows.push(
          toCsvRow([
            taskId,
            taskId,
            projectKey,
            "Sub-task",
            task,
            `Derived from ${phase.title || `Phase ${phaseIndex + 1}`}`,
            storyId,
            labelString,
            issue.url,
            "",
          ])
        );
      });
    });
  }

  return rows;
}

function buildTrelloPayload(issues, listName) {
  const cards = issues.map((issue) => {
    const checklists = issue.implementationPhases.map((phase, idx) => ({
      name: phase.title || `Phase ${idx + 1}`,
      items: phase.tasks,
    }));

    if (issue.acceptanceCriteria.length) {
      checklists.push({
        name: "Acceptance Criteria",
        items: issue.acceptanceCriteria.map((item) => item.text),
      });
    }

    return {
      name: `[GH#${issue.number}] ${issue.title}`,
      desc: issue.description,
      labels: issue.labels,
      listName,
      urlSource: issue.url,
      checklists,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    listName,
    cards,
  };
}

function toCsvRow(values) {
  return values.map(toCsvValue).join(",");
}

function toCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const [key, rawValue] = arg.includes("=")
      ? arg.slice(2).split(/=(.+)/)
      : [arg.slice(2), argv[i + 1]];

    if (rawValue === undefined || rawValue.startsWith("--")) {
      options[key] = true;
      if (rawValue && rawValue.startsWith("--")) {
        i -= 1;
      }
    } else {
      options[key] = rawValue;
      i += 1;
    }
  }
  return options;
}

function detectRepoFromGit() {
  try {
    const remote = execSync("git config --get remote.origin.url", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!remote) {
      return null;
    }
    const normalized = remote.replace(/\.git$/, "");
    const match = normalized.match(/github\.com[:/](.+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function safeReadJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
