export interface ChangelogSection {
  title: string;
  items: string[];
}

export interface ChangelogRelease {
  version: string;
  date: string | null;
  sections: ChangelogSection[];
}

export interface ChangelogTextSegment {
  text: string;
  href?: string;
}

const releaseHeadingPattern = /^## \[(.+?)\](?: - (\d{4}-\d{2}-\d{2}))?$/;
const sectionHeadingPattern = /^### (.+)$/;
const bulletPattern = /^- (.+)$/;
const referencePattern = /#(\d+)/g;

export function parseChangelog(markdown: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let currentRelease: ChangelogRelease | null = null;
  let currentSection: ChangelogSection | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    const releaseMatch = line.match(releaseHeadingPattern);
    if (releaseMatch) {
      const version = releaseMatch[1];
      const date = releaseMatch[2] ?? null;

      if (!version) {
        continue;
      }

      if (version === "Unreleased") {
        currentRelease = null;
        currentSection = null;
        continue;
      }

      const nextRelease: ChangelogRelease = {
        version,
        date,
        sections: [],
      };
      currentRelease = nextRelease;
      releases.push(nextRelease);
      currentSection = null;
      continue;
    }

    if (!currentRelease) {
      continue;
    }

    const sectionMatch = line.match(sectionHeadingPattern);
    if (sectionMatch) {
      const title = sectionMatch[1];
      if (!title) {
        continue;
      }

      const nextSection: ChangelogSection = {
        title,
        items: [],
      };
      currentSection = nextSection;
      currentRelease.sections.push(nextSection);
      continue;
    }

    const bulletMatch = line.match(bulletPattern);
    if (bulletMatch && currentSection) {
      const item = bulletMatch[1];
      if (item) {
        currentSection.items.push(item);
      }
    }
  }

  return releases.filter((release) => release.sections.length > 0);
}

export function formatReleaseDate(date: string | null): string {
  if (!date) {
    return "Undated";
  }

  const parts = date.split("-").map(Number);
  if (parts.length !== 3) {
    return date;
  }

  const [year, month, day] = parts;
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    parts.some((part) => Number.isNaN(part))
  ) {
    return date;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function splitChangelogReferences(text: string): ChangelogTextSegment[] {
  const segments: ChangelogTextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(referencePattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, index) });
    }

    const reference = match[0];
    const number = match[1];

    segments.push({
      text: reference,
      href: `https://github.com/kmcgarry1/edhrec-compare/pull/${number}`,
    });

    lastIndex = index + reference.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text }];
}
