#!/usr/bin/env node

/**
 * Create GitHub issues from the March 2026 visual audit source documents.
 *
 * Usage:
 *   node scripts/create-visual-audit-issues.mjs --dry-run
 *   node scripts/create-visual-audit-issues.mjs --create-legacy-comments
 */

import { existsSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_ISSUE_DIR = "docs/visual-audit-issues";
const DEFAULT_AUDIT_PATH = "docs/VISUAL_AUDIT_2026-03-24.md";
const DEFAULT_SOURCE_BRANCH = "main";

const PRIORITY_LABELS = {
  high: "high-priority",
  medium: "medium-priority",
  low: "low-priority",
};

const LABEL_DEFAULTS = {
  "ui-ux": {
    color: "a2eeef",
    description: "User interface and experience improvements",
  },
  design: {
    color: "f9d0c4",
    description: "Design system and visual design work",
  },
  "visual-audit-2026": {
    color: "1f6feb",
    description: "Backlog created from the March 2026 visual audit",
  },
  "high-priority": {
    color: "d73a4a",
    description: "High-priority work item",
  },
  "medium-priority": {
    color: "fbca04",
    description: "Medium-priority work item",
  },
  "low-priority": {
    color: "0e8a16",
    description: "Low-priority work item",
  },
};

const REQUIRED_HEADINGS = [
  "## Summary",
  "## Audit Evidence",
  "## Redesign Scope",
  "## Acceptance Criteria",
  "## Implementation Order / Dependencies",
];

const args = parseArgs(process.argv.slice(2));

const repo = args.repo || process.env.GITHUB_REPOSITORY || detectRepoFromGit();
const dryRun = Boolean(args["dry-run"]);
const createLegacyComments = Boolean(args["create-legacy-comments"]);
const issueDir = path.resolve(process.cwd(), args["issue-dir"] || DEFAULT_ISSUE_DIR);
const auditPath = args["source-path"] || DEFAULT_AUDIT_PATH;
const sourceBranch = args["source-branch"] || DEFAULT_SOURCE_BRANCH;
const ghExecutable = detectGhExecutable();
const githubToken = resolveGithubToken();

if (!repo) {
  console.error(
    "Unable to determine repository. Provide --repo owner/name or set GITHUB_REPOSITORY."
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(`Visual audit issue publish failed: ${error.message}`);
  process.exit(1);
});

async function main() {
  ensureGithubAccess();

  const headers = buildGitHubHeaders(githubToken);
  const specs = await loadIssueSpecs(issueDir);
  if (specs.length === 0) {
    throw new Error(`No markdown issue sources found in ${issueDir}`);
  }

  const [existingIssues, existingLabels] = await Promise.all([
    listExistingIssues(repo, headers),
    listExistingLabels(repo, headers),
  ]);
  const missingLabels = collectMissingLabels(specs, existingLabels);

  if (dryRun) {
    printDryRun(specs, existingIssues, missingLabels);
    return;
  }

  if (missingLabels.length > 0) {
    await ensureLabels(repo, existingLabels, missingLabels, headers);
  }

  const summary = {
    created: 0,
    skipped: 0,
    commented: 0,
    commentSkipped: 0,
  };

  for (const spec of specs) {
    const effectiveLabels = buildEffectiveLabels(spec);
    let issue = existingIssues.find((candidate) => candidate.title === spec.title) || null;

    if (!issue) {
      const body = renderIssueBody(spec, repo, sourceBranch, auditPath, effectiveLabels);
      issue = await createIssue(repo, spec.title, body, effectiveLabels, headers);
      existingIssues.push(issue);
      summary.created += 1;
      console.log(`Created #${issue.number}: ${issue.title}`);
    } else {
      summary.skipped += 1;
      console.log(`Skipped existing issue #${issue.number}: ${issue.title}`);
    }

    if (createLegacyComments && spec.legacyIssueRefs.length > 0) {
      const commentResult = await ensureLegacyIssueComments(
        repo,
        spec.legacyIssueRefs,
        issue,
        headers
      );
      summary.commented += commentResult.created;
      summary.commentSkipped += commentResult.skipped;
    }
  }

  console.log("");
  console.log("Summary");
  console.log(`  created: ${summary.created}`);
  console.log(`  skipped: ${summary.skipped}`);
  console.log(`  legacy comments created: ${summary.commented}`);
  console.log(`  legacy comments skipped: ${summary.commentSkipped}`);
}

async function loadIssueSpecs(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const specs = [];
  for (const fileName of files) {
    const absolutePath = path.join(rootDir, fileName);
    const contents = await fs.readFile(absolutePath, "utf8");
    const { frontMatter, body } = splitFrontMatter(contents, absolutePath);

    validateFrontMatter(frontMatter, absolutePath);
    validateBody(body, absolutePath);

    specs.push({
      fileName,
      filePath: absolutePath,
      title: frontMatter.title,
      labels: frontMatter.labels,
      priority: frontMatter.priority,
      sourceSections: frontMatter.source_sections,
      legacyIssueRefs: frontMatter.legacy_issue_refs,
      body: body.trim(),
    });
  }

  return specs;
}

function splitFrontMatter(contents, filePath) {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`${filePath} is missing YAML front matter.`);
  }

  return {
    frontMatter: parseSimpleYaml(match[1], filePath),
    body: match[2].trim(),
  };
}

function parseSimpleYaml(block, filePath) {
  const result = {};
  let currentKey = null;

  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch) {
      if (!currentKey || !Array.isArray(result[currentKey])) {
        throw new Error(`${filePath} has a list item without a list key.`);
      }
      result[currentKey].push(parseYamlValue(listMatch[1].trim()));
      continue;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      throw new Error(`${filePath} has invalid front matter line: ${line}`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    if (!key) {
      throw new Error(`${filePath} has an empty front matter key.`);
    }

    if (!rawValue) {
      result[key] = [];
      currentKey = key;
      continue;
    }

    result[key] = parseYamlValue(rawValue);
    currentKey = null;
  }

  return result;
}

function parseYamlValue(value) {
  if (value === "[]") {
    return [];
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) {
      return [];
    }
    return inner.split(",").map((item) => parseYamlValue(item.trim()));
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (/^[0-9]+$/.test(value)) {
    return Number(value);
  }

  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }

  return value;
}

function validateFrontMatter(frontMatter, filePath) {
  const requiredFields = ["title", "labels", "priority", "source_sections", "legacy_issue_refs"];

  for (const field of requiredFields) {
    if (!(field in frontMatter)) {
      throw new Error(`${filePath} is missing required front matter field "${field}".`);
    }
  }

  if (typeof frontMatter.title !== "string" || frontMatter.title.trim().length === 0) {
    throw new Error(`${filePath} must provide a non-empty title.`);
  }

  if (!Array.isArray(frontMatter.labels) || frontMatter.labels.length === 0) {
    throw new Error(`${filePath} must provide at least one label.`);
  }

  if (!frontMatter.labels.every((label) => typeof label === "string" && label.trim().length > 0)) {
    throw new Error(`${filePath} has an invalid labels list.`);
  }

  if (!Object.hasOwn(PRIORITY_LABELS, frontMatter.priority)) {
    throw new Error(
      `${filePath} has unsupported priority "${frontMatter.priority}". Expected one of ${Object.keys(
        PRIORITY_LABELS
      ).join(", ")}.`
    );
  }

  if (
    !Array.isArray(frontMatter.source_sections) ||
    frontMatter.source_sections.length === 0 ||
    !frontMatter.source_sections.every(
      (section) => typeof section === "string" && section.trim().length > 0
    )
  ) {
    throw new Error(`${filePath} must provide one or more source_sections values.`);
  }

  if (
    !Array.isArray(frontMatter.legacy_issue_refs) ||
    !frontMatter.legacy_issue_refs.every((value) => Number.isInteger(value) && value > 0)
  ) {
    throw new Error(`${filePath} has invalid legacy_issue_refs values.`);
  }
}

function validateBody(body, filePath) {
  if (!body.trim()) {
    throw new Error(`${filePath} must include markdown body content.`);
  }

  for (const heading of REQUIRED_HEADINGS) {
    if (!body.includes(heading)) {
      throw new Error(`${filePath} is missing required section heading "${heading}".`);
    }
  }
}

function buildEffectiveLabels(spec) {
  return [...new Set([...spec.labels, PRIORITY_LABELS[spec.priority]])];
}

function collectMissingLabels(specs, existingLabels) {
  const neededLabels = new Set(specs.flatMap((spec) => buildEffectiveLabels(spec)));
  return [...neededLabels].filter((label) => !existingLabels.has(label));
}

function printDryRun(specs, existingIssues, missingLabels) {
  console.log(`Dry run for ${repo}`);
  console.log(`Issue source directory: ${path.relative(process.cwd(), issueDir)}`);
  console.log("");

  if (missingLabels.length > 0) {
    console.log(
      `Missing labels that would be created during a live run: ${missingLabels.join(", ")}`
    );
    console.log("");
  }

  for (const spec of specs) {
    const existingIssue =
      existingIssues.find((candidate) => candidate.title === spec.title) || null;
    console.log(spec.title);
    console.log(`  labels: ${buildEffectiveLabels(spec).join(", ")}`);
    console.log(`  priority: ${spec.priority}`);
    console.log(
      `  legacy comment targets: ${
        spec.legacyIssueRefs.length > 0 ? spec.legacyIssueRefs.join(", ") : "none"
      }`
    );
    console.log(
      `  existing issue: ${existingIssue ? `#${existingIssue.number} ${existingIssue.url}` : "none"}`
    );
    console.log("");
  }
}

function renderIssueBody(spec, repository, branch, sourcePathname, effectiveLabels) {
  const sourceUrl = `https://github.com/${repository}/blob/${branch}/${sourcePathname}`;

  const lines = [
    `**Priority:** ${capitalize(spec.priority)}`,
    `**Labels:** ${effectiveLabels.join(", ")}`,
    `**Source Sections:** ${spec.sourceSections.join(", ")}`,
    "",
    spec.body,
    "",
    "## Source Link",
    `- Audit document: [${sourcePathname}](${sourceUrl})`,
    `- Source sections: ${spec.sourceSections.join("; ")}`,
  ];

  return `${lines.join("\n").trim()}\n`;
}

function ensureGithubAccess() {
  if (!ghExecutable) {
    throw new Error("GitHub CLI (gh) is not installed or could not be located on this machine.");
  }

  if (!githubToken) {
    throw new Error(
      "GitHub authentication was not found. Run `gh auth login` or set GITHUB_TOKEN/GH_TOKEN."
    );
  }
}

function buildGitHubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "edhrec-compare-visual-audit-issues",
  };
}

async function listExistingIssues(repository, headers) {
  const issues = await paginateGitHub(
    `https://api.github.com/repos/${repository}/issues?state=all&per_page=100`,
    headers
  );

  return issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
    }));
}

async function listExistingLabels(repository, headers) {
  const labels = await paginateGitHub(
    `https://api.github.com/repos/${repository}/labels?per_page=100`,
    headers
  );
  return new Set(labels.map((label) => label.name));
}

async function ensureLabels(repository, existingLabels, labelsToCreate, headers) {
  for (const labelName of labelsToCreate) {
    const labelConfig = LABEL_DEFAULTS[labelName] || {
      color: "ededed",
      description: "Repository label created by visual audit issue automation",
    };

    await apiRequest(`https://api.github.com/repos/${repository}/labels`, {
      method: "POST",
      headers,
      body: {
        name: labelName,
        color: labelConfig.color,
        description: labelConfig.description,
      },
    });

    existingLabels.add(labelName);
    console.log(`Created missing label: ${labelName}`);
  }
}

async function createIssue(repository, title, body, labels, headers) {
  const issue = await apiRequest(`https://api.github.com/repos/${repository}/issues`, {
    method: "POST",
    headers,
    body: {
      title,
      body,
      labels,
    },
  });

  return {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
  };
}

async function ensureLegacyIssueComments(repository, legacyIssueRefs, issue, headers) {
  let created = 0;
  let skipped = 0;

  for (const legacyIssueRef of legacyIssueRefs) {
    const targetComment = buildLegacyComment(issue.number);
    const comments = await paginateGitHub(
      `https://api.github.com/repos/${repository}/issues/${legacyIssueRef}/comments?per_page=100`,
      headers
    );

    const alreadyPresent = comments.some(
      (comment) => typeof comment.body === "string" && comment.body.includes(targetComment)
    );

    if (alreadyPresent) {
      skipped += 1;
      console.log(`Skipped existing legacy comment on #${legacyIssueRef} for #${issue.number}`);
      continue;
    }

    await apiRequest(
      `https://api.github.com/repos/${repository}/issues/${legacyIssueRef}/comments`,
      {
        method: "POST",
        headers,
        body: {
          body: targetComment,
        },
      }
    );

    created += 1;
    console.log(`Commented on legacy issue #${legacyIssueRef} for #${issue.number}`);
  }

  return { created, skipped };
}

function buildLegacyComment(issueNumber) {
  return `Tracking moved to #${issueNumber} as part of the March 2026 visual audit.`;
}

async function paginateGitHub(url, headers) {
  const items = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers });
    if (!response.ok) {
      const details = await safeReadJson(response);
      throw new Error(
        `GitHub API error (${response.status} ${response.statusText}): ${
          details?.message || "Request failed."
        }`
      );
    }

    const chunk = await response.json();
    if (!Array.isArray(chunk)) {
      throw new Error(`Expected an array response from ${nextUrl}.`);
    }

    items.push(...chunk);
    nextUrl = parseNextLink(response.headers.get("link"));
  }

  return items;
}

async function apiRequest(url, { method = "GET", headers, body } = {}) {
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const details = await safeReadJson(response);
    throw new Error(
      `GitHub API error (${response.status} ${response.statusText}): ${
        details?.message || "Request failed."
      }`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function parseNextLink(linkHeader) {
  if (!linkHeader) {
    return null;
  }

  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match && match[2] === "next") {
      return match[1];
    }
  }

  return null;
}

async function safeReadJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      continue;
    }

    const [key, maybeValue] = arg.includes("=")
      ? arg.slice(2).split(/=(.+)/)
      : [arg.slice(2), argv[index + 1]];

    if (maybeValue === undefined || maybeValue.startsWith("--")) {
      options[key] = true;
      if (maybeValue && maybeValue.startsWith("--")) {
        index -= 1;
      }
      continue;
    }

    options[key] = maybeValue;
    index += 1;
  }

  return options;
}

function detectRepoFromGit() {
  const configPath = resolveGitConfigPath();
  if (!configPath) {
    return null;
  }

  try {
    const contents = readFileSync(configPath, "utf8");
    const remoteBlockMatch = contents.match(/\[remote "origin"\]([\s\S]*?)(?:\r?\n\[|$)/);
    if (!remoteBlockMatch) {
      return null;
    }

    const urlMatch = remoteBlockMatch[1].match(/^\s*url\s*=\s*(.+)$/m);
    if (!urlMatch) {
      return null;
    }

    const normalized = urlMatch[1].trim().replace(/\.git$/, "");
    const match = normalized.match(/github\.com[:/](.+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function resolveGitConfigPath() {
  const dotGitPath = path.resolve(process.cwd(), ".git");

  try {
    if (!existsSync(dotGitPath)) {
      return null;
    }

    const dotGitContents = readFileSync(dotGitPath, "utf8");
    const match = dotGitContents.match(/^gitdir:\s*(.+)$/im);
    if (!match) {
      return path.join(dotGitPath, "config");
    }

    const gitDir = path.resolve(process.cwd(), match[1].trim());
    return path.join(gitDir, "config");
  } catch {
    return path.join(dotGitPath, "config");
  }
}

function detectGhExecutable() {
  const candidates = [
    process.env.GH_PATH,
    process.platform === "win32"
      ? path.join(process.env.ProgramFiles || "C:\\Program Files", "GitHub CLI", "gh.exe")
      : null,
    process.platform === "win32" && process.env.ProgramW6432
      ? path.join(process.env.ProgramW6432, "GitHub CLI", "gh.exe")
      : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const pathEntries = (process.env.PATH || "")
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const executableNames = process.platform === "win32" ? ["gh.exe", "gh.cmd", "gh.bat"] : ["gh"];

  for (const entry of pathEntries) {
    for (const executableName of executableNames) {
      const candidate = path.join(entry, executableName);
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function resolveGithubToken() {
  const envToken =
    process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_PAT || null;
  if (envToken) {
    return envToken.trim();
  }

  const hostsPath = detectGhHostsPath();
  if (!hostsPath || !existsSync(hostsPath)) {
    return null;
  }

  try {
    const contents = readFileSync(hostsPath, "utf8");
    return extractGithubTokenFromHosts(contents);
  } catch {
    return null;
  }
}

function detectGhHostsPath() {
  const candidates = [
    process.env.APPDATA ? path.join(process.env.APPDATA, "GitHub CLI", "hosts.yml") : null,
    process.env.AppData ? path.join(process.env.AppData, "GitHub CLI", "hosts.yml") : null,
    process.env.HOME ? path.join(process.env.HOME, ".config", "gh", "hosts.yml") : null,
    process.env.USERPROFILE
      ? path.join(process.env.USERPROFILE, ".config", "gh", "hosts.yml")
      : null,
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate)) || null;
}

function extractGithubTokenFromHosts(contents) {
  const lines = contents.split(/\r?\n/);
  let inGithubBlock = false;

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    if (!/^[ \t]/.test(line)) {
      inGithubBlock = line.trim() === "github.com:";
      continue;
    }

    if (!inGithubBlock) {
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith("oauth_token:")) {
      continue;
    }

    const token = trimmed.slice("oauth_token:".length).trim();
    if (!token) {
      return null;
    }

    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      return token.slice(1, -1);
    }

    return token;
  }

  return null;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
